#!/usr/bin/env swift

import Darwin
import Foundation

private let lz4Flag: UInt8 = 0x40
private let lzxFlag: UInt8 = 0x80

private enum XNBError: Error, CustomStringConvertible {
    case invalid(String)

    var description: String {
        switch self {
        case .invalid(let message): message
        }
    }
}

private final class RawLZ4 {
    private typealias CompressBound = @convention(c) (Int32) -> Int32
    private typealias CompressHC = @convention(c) (
        UnsafePointer<CChar>?, UnsafeMutablePointer<CChar>?, Int32, Int32, Int32
    ) -> Int32
    private typealias DecompressSafe = @convention(c) (
        UnsafePointer<CChar>?, UnsafeMutablePointer<CChar>?, Int32, Int32
    ) -> Int32

    private let handle: UnsafeMutableRawPointer
    private let compressBoundFunction: CompressBound
    private let compressFunction: CompressHC
    private let decompressFunction: DecompressSafe

    init() throws {
        let override = ProcessInfo.processInfo.environment["LZ4_LIBRARY"]
        let candidates = [
            override,
            "/opt/homebrew/opt/lz4/lib/liblz4.dylib",
            "/opt/homebrew/lib/liblz4.dylib",
            "/usr/local/lib/liblz4.dylib",
            "liblz4.dylib",
        ].compactMap { $0 }
        guard let loaded = candidates.lazy.compactMap({ dlopen($0, RTLD_NOW) }).first else {
            throw XNBError.invalid("liblz4 was not found; install Homebrew lz4 or set LZ4_LIBRARY")
        }
        handle = loaded
        guard
            let boundSymbol = dlsym(loaded, "LZ4_compressBound"),
            let compressSymbol = dlsym(loaded, "LZ4_compress_HC"),
            let decompressSymbol = dlsym(loaded, "LZ4_decompress_safe")
        else {
            dlclose(loaded)
            throw XNBError.invalid("liblz4 is missing required block-codec symbols")
        }
        compressBoundFunction = unsafeBitCast(boundSymbol, to: CompressBound.self)
        compressFunction = unsafeBitCast(compressSymbol, to: CompressHC.self)
        decompressFunction = unsafeBitCast(decompressSymbol, to: DecompressSafe.self)
    }

    deinit {
        dlclose(handle)
    }

    func compress(_ source: [UInt8]) throws -> [UInt8] {
        guard source.count <= Int(Int32.max) else {
            throw XNBError.invalid("XNB payload is too large for liblz4")
        }
        let sourceCount = Int32(source.count)
        let capacity = Int(compressBoundFunction(sourceCount))
        var output = [UInt8](repeating: 0, count: capacity)
        let encodedCount = output.withUnsafeMutableBytes { destination in
            source.withUnsafeBytes { input in
                compressFunction(
                    input.bindMemory(to: CChar.self).baseAddress,
                    destination.bindMemory(to: CChar.self).baseAddress,
                    sourceCount,
                    Int32(capacity),
                    12
                )
            }
        }
        guard encodedCount > 0 else {
            throw XNBError.invalid("liblz4 high-compression encoding failed")
        }
        output.removeSubrange(Int(encodedCount)...)
        return output
    }

    func decompress(_ payload: ArraySlice<UInt8>, expectedSize: Int) throws -> [UInt8] {
        guard payload.count <= Int(Int32.max), expectedSize <= Int(Int32.max) else {
            throw XNBError.invalid("XNB payload is too large for liblz4")
        }
        var output = [UInt8](repeating: 0, count: expectedSize)
        let decodedCount = output.withUnsafeMutableBytes { destination in
            payload.withUnsafeBytes { source in
                decompressFunction(
                    source.bindMemory(to: CChar.self).baseAddress,
                    destination.bindMemory(to: CChar.self).baseAddress,
                    Int32(payload.count),
                    Int32(expectedSize)
                )
            }
        }
        guard decodedCount == expectedSize else {
            throw XNBError.invalid("liblz4 decoded \(decodedCount) of \(expectedSize) bytes")
        }
        return output
    }
}

private func readUInt32(_ bytes: [UInt8], at offset: Int) -> Int {
    Int(bytes[offset])
        | (Int(bytes[offset + 1]) << 8)
        | (Int(bytes[offset + 2]) << 16)
        | (Int(bytes[offset + 3]) << 24)
}

private func appendUInt32(_ value: Int, to bytes: inout [UInt8]) {
    precondition(value >= 0 && value <= Int(UInt32.max))
    bytes.append(UInt8(value & 0xff))
    bytes.append(UInt8((value >> 8) & 0xff))
    bytes.append(UInt8((value >> 16) & 0xff))
    bytes.append(UInt8((value >> 24) & 0xff))
}

private func replaceUInt32(_ value: Int, at offset: Int, in bytes: inout [UInt8]) {
    precondition(value >= 0 && value <= Int(UInt32.max))
    bytes[offset] = UInt8(value & 0xff)
    bytes[offset + 1] = UInt8((value >> 8) & 0xff)
    bytes[offset + 2] = UInt8((value >> 16) & 0xff)
    bytes[offset + 3] = UInt8((value >> 24) & 0xff)
}

private func validatedBytes(at url: URL) throws -> [UInt8] {
    let bytes = [UInt8](try Data(contentsOf: url))
    guard bytes.count >= 10, Array(bytes[0..<3]) == Array("XNB".utf8) else {
        throw XNBError.invalid("Invalid XNB header: \(url.path)")
    }
    guard readUInt32(bytes, at: 6) == bytes.count else {
        throw XNBError.invalid("Invalid XNB length: \(url.path)")
    }
    return bytes
}

private func verifyCompressed(at url: URL, codec: RawLZ4) throws -> Int {
    let bytes = try validatedBytes(at: url)
    let flags = bytes[5]
    guard flags & lz4Flag != 0, flags & lzxFlag == 0, bytes.count >= 14 else {
        throw XNBError.invalid("Expected MonoGame LZ4-compressed XNB: \(url.path)")
    }
    let expectedSize = readUInt32(bytes, at: 10)
    _ = try codec.decompress(bytes[14...], expectedSize: expectedSize)
    return expectedSize
}

private func compress(at url: URL, codec: RawLZ4) throws -> (before: Int, after: Int, changed: Bool) {
    let bytes = try validatedBytes(at: url)
    let flags = bytes[5]
    if flags & lz4Flag != 0 {
        _ = try verifyCompressed(at: url, codec: codec)
        return (bytes.count, bytes.count, false)
    }
    guard flags & lzxFlag == 0 else {
        throw XNBError.invalid("LZX input is not supported: \(url.path)")
    }

    let source = Array(bytes[10...])
    let compressed = try codec.compress(source)
    guard try codec.decompress(compressed[...], expectedSize: source.count) == source else {
        throw XNBError.invalid("LZ4 content mismatch: \(url.path)")
    }

    var output = Array(bytes[0..<6])
    output[5] = flags | lz4Flag
    appendUInt32(0, to: &output)
    appendUInt32(source.count, to: &output)
    output.append(contentsOf: compressed)
    replaceUInt32(output.count, at: 6, in: &output)
    try Data(output).write(to: url, options: .atomic)
    return (bytes.count, output.count, true)
}

private func xnbFiles(in inputs: [String]) throws -> [URL] {
    let manager = FileManager.default
    var result: [URL] = []
    for input in inputs {
        let url = URL(fileURLWithPath: input)
        var isDirectory: ObjCBool = false
        guard manager.fileExists(atPath: url.path, isDirectory: &isDirectory) else {
            throw XNBError.invalid("Missing path: \(url.path)")
        }
        if !isDirectory.boolValue {
            guard url.pathExtension.lowercased() == "xnb" else {
                throw XNBError.invalid("Expected an XNB file: \(url.path)")
            }
            result.append(url)
            continue
        }
        guard let enumerator = manager.enumerator(
            at: url,
            includingPropertiesForKeys: [.isRegularFileKey],
            options: [.skipsHiddenFiles]
        ) else {
            throw XNBError.invalid("Cannot enumerate: \(url.path)")
        }
        for case let file as URL in enumerator where file.pathExtension.lowercased() == "xnb" {
            result.append(file)
        }
    }
    return result.sorted { $0.path < $1.path }
}

do {
    let codec = try RawLZ4()
    var arguments = Array(CommandLine.arguments.dropFirst())
    let verifyOnly = arguments.first == "--verify"
    if verifyOnly { arguments.removeFirst() }
    if arguments.isEmpty {
        arguments = ["Sources/StardewTranslationInstaller/Resources/ModPayload/assets/fonts"]
    }
    let files = try xnbFiles(in: arguments)
    guard !files.isEmpty else { throw XNBError.invalid("No XNB files found") }

    var originalBytes = 0
    var finalBytes = 0
    var changed = 0
    for file in files {
        if verifyOnly {
            let decodedSize = try verifyCompressed(at: file, codec: codec)
            originalBytes += decodedSize + 10
            finalBytes += Int((try file.resourceValues(forKeys: [.fileSizeKey])).fileSize ?? 0)
        } else {
            let result = try compress(at: file, codec: codec)
            originalBytes += result.before
            finalBytes += result.after
            if result.changed { changed += 1 }
        }
    }

    let saved = originalBytes - finalBytes
    let percent = originalBytes == 0 ? 0 : Double(saved) * 100 / Double(originalBytes)
    let action = verifyOnly ? "Verified" : "Compressed"
    print("\(action) \(files.count) XNB files (\(changed) changed): \(originalBytes) -> \(finalBytes) bytes, saved \(saved) (\(String(format: "%.1f", percent))%).")
} catch {
    FileHandle.standardError.write(Data("error: \(error)\n".utf8))
    exit(1)
}
