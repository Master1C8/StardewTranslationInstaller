import AppKit
import CoreText
import Foundation

struct GlyphBitmap {
    let index: Int
    let character: String
    let image: CGImage
}

struct AtlasRectangle {
    let x: Int
    let y: Int
    let width: Int
    let height: Int

    var right: Int { x + width }
    var bottom: Int { y + height }

    func contains(_ other: AtlasRectangle) -> Bool {
        other.x >= x && other.y >= y && other.right <= right && other.bottom <= bottom
    }

    func intersects(_ other: AtlasRectangle) -> Bool {
        other.x < right && other.right > x && other.y < bottom && other.bottom > y
    }
}

func pack(_ bitmaps: [GlyphBitmap], atlasSize: Int, padding: Int) throws -> [Int: (Int, Int)] {
    var placements: [Int: (Int, Int)] = [:]
    let ordered = bitmaps.sorted {
        if $0.image.height == $1.image.height { return $0.image.width > $1.image.width }
        return $0.image.height > $1.image.height
    }
    var x = padding
    var y = padding
    var rowHeight = 0
    for glyph in ordered {
        if x + glyph.image.width + padding > atlasSize {
            x = padding
            y += rowHeight + padding
            rowHeight = 0
        }
        if y + glyph.image.height + padding > atlasSize {
            throw GeneratorError.renderFailed("atlas overflow")
        }
        placements[glyph.index] = (x, y)
        x += glyph.image.width + padding
        rowHeight = max(rowHeight, glyph.image.height)
    }
    return placements
}

enum GeneratorError: Error, CustomStringConvertible {
    case usage
    case invalidJSON(String)
    case missingImage(String)
    case missingFont
    case renderFailed(String)

    var description: String {
        switch self {
        case .usage:
            return "Usage: generate-amharic-fonts <base-unpacked-dir> <translations-dir> <output-dir> <font-file> [cluster-map.json]"
        case .invalidJSON(let path):
            return "Invalid SpriteFont JSON: \(path)"
        case .missingImage(let path):
            return "Missing image: \(path)"
        case .missingFont:
            return "The supplied Ethiopic font could not be loaded"
        case .renderFailed(let character):
            return "Could not render glyph: \(character)"
        }
    }
}

func collectStrings(from value: Any, into characters: inout Set<String>) {
    if let string = value as? String {
        for scalar in string.precomposedStringWithCanonicalMapping.unicodeScalars {
            if !CharacterSet.whitespacesAndNewlines.contains(scalar) {
                characters.insert(String(scalar))
            }
        }
    } else if let array = value as? [Any] {
        for item in array {
            collectStrings(from: item, into: &characters)
        }
    } else if let dictionary = value as? [String: Any] {
        for item in dictionary.values {
            collectStrings(from: item, into: &characters)
        }
    }
}

func alphaBounds(of bitmap: NSBitmapImageRep) -> CGRect? {
    guard let data = bitmap.bitmapData else { return nil }
    var minX = bitmap.pixelsWide
    var minY = bitmap.pixelsHigh
    var maxX = -1
    var maxY = -1
    let bytesPerPixel = bitmap.bitsPerPixel / 8

    for y in 0..<bitmap.pixelsHigh {
        for x in 0..<bitmap.pixelsWide {
            let offset = y * bitmap.bytesPerRow + x * bytesPerPixel
            let alpha = data[offset + 3]
            if alpha != 0 {
                minX = min(minX, x)
                minY = min(minY, y)
                maxX = max(maxX, x)
                maxY = max(maxY, y)
            }
        }
    }

    guard maxX >= minX, maxY >= minY else { return nil }
    return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
}

func renderGlyph(_ character: String, index: Int, font: NSFont, lineHeight: Int) throws -> GlyphBitmap {
    if character.unicodeScalars.allSatisfy({ $0.properties.generalCategory == .format }) {
        guard let bitmap = NSBitmapImageRep(
            bitmapDataPlanes: nil,
            pixelsWide: 1,
            pixelsHigh: 1,
            bitsPerSample: 8,
            samplesPerPixel: 4,
            hasAlpha: true,
            isPlanar: false,
            colorSpaceName: .deviceRGB,
            bytesPerRow: 0,
            bitsPerPixel: 0
        ), let image = bitmap.cgImage else {
            throw GeneratorError.renderFailed(character)
        }
        return GlyphBitmap(index: index, character: character, image: image)
    }
    let canvasWidth = max(96, Int(ceil((character as NSString).size(withAttributes: [.font: font]).width)) + 24)
    let canvasHeight = lineHeight + 24
    guard let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: canvasWidth,
        pixelsHigh: canvasHeight,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    ) else {
        throw GeneratorError.renderFailed(character)
    }

    NSGraphicsContext.saveGraphicsState()
    guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
        throw GeneratorError.renderFailed(character)
    }
    NSGraphicsContext.current = context
    NSColor.clear.setFill()
    NSRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight).fill()
    (character as NSString).draw(
        at: NSPoint(x: 10, y: 7),
        withAttributes: [
            .font: font,
            .foregroundColor: NSColor.white,
        ]
    )
    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()

    guard let bounds = alphaBounds(of: bitmap),
          let image = bitmap.cgImage?.cropping(to: bounds) else {
        throw GeneratorError.renderFailed(character)
    }
    return GlyphBitmap(index: index, character: character, image: image)
}

func makeBitmap(width: Int, height: Int) -> NSBitmapImageRep? {
    NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )
}

func writePNG(_ bitmap: NSBitmapImageRep, to url: URL) throws {
    guard let pixels = bitmap.bitmapData else {
        throw GeneratorError.renderFailed(url.lastPathComponent)
    }
    // The game's texture uses binary alpha. Thresholding avoids coloured DXT
    // fringes around antialiased system-font glyphs after XNB packing.
    let bytesPerPixel = bitmap.bitsPerPixel / 8
    for y in 0..<bitmap.pixelsHigh {
        for x in 0..<bitmap.pixelsWide {
            let offset = y * bitmap.bytesPerRow + x * bytesPerPixel
            let opaque = pixels[offset + 3] >= 96
            pixels[offset] = opaque ? 255 : 0
            pixels[offset + 1] = opaque ? 255 : 0
            pixels[offset + 2] = opaque ? 255 : 0
            pixels[offset + 3] = opaque ? 255 : 0
        }
    }
    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        throw GeneratorError.renderFailed(url.lastPathComponent)
    }
    try data.write(to: url)
}

func compactJSON(_ value: Any) throws -> String {
    let data = try JSONSerialization.data(withJSONObject: value, options: [.withoutEscapingSlashes, .fragmentsAllowed])
    return String(decoding: data, as: UTF8.self)
}

func processFont(
    name: String,
    fontSize: CGFloat,
    atlasSize: Int,
    englishDirectory: URL,
    outputDirectory: URL,
    requiredCharacters: Set<String>,
    fontName: String,
    renderTextByCharacter: [String: String]
) throws {
    let jsonURL = englishDirectory.appendingPathComponent("\(name).json")
    let imageURL = englishDirectory.appendingPathComponent("\(name).png")
    let raw = try Data(contentsOf: jsonURL)
    guard var root = try JSONSerialization.jsonObject(with: raw) as? [String: Any],
          var content = root["content"] as? [String: Any],
          var characterMap = content["characterMap"] as? [String],
          var glyphs = content["glyphs"] as? [[String: Int]],
          var cropping = content["cropping"] as? [[String: Int]],
          var kerning = content["kerning"] as? [[String: Int]],
          let lineHeight = content["verticalLineSpacing"] as? Int else {
        throw GeneratorError.invalidJSON(jsonURL.path)
    }
    guard let baseImage = NSImage(contentsOf: imageURL),
          let baseCG = baseImage.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        throw GeneratorError.missingImage(imageURL.path)
    }
    guard let font = NSFont(name: fontName, size: fontSize) else {
        throw GeneratorError.missingFont
    }

    if !renderTextByCharacter.isEmpty {
        let retained = characterMap.indices.filter { index in
            guard let scalar = characterMap[index].unicodeScalars.first?.value else { return false }
            return !(0x0D00...0x0D7F).contains(scalar) && !(0xE000...0xF8FF).contains(scalar)
        }
        characterMap = retained.map { characterMap[$0] }
        glyphs = retained.map { glyphs[$0] }
        cropping = retained.map { cropping[$0] }
        kerning = retained.map { kerning[$0] }
    }

    let existing = Set(characterMap)
    let missing = requiredCharacters
        .subtracting(existing)
        .sorted { left, right in
            left.unicodeScalars.first!.value < right.unicodeScalars.first!.value
        }
    var bitmaps = try glyphs.enumerated().map { index, rectangle -> GlyphBitmap in
        let bounds = CGRect(
            x: rectangle["x"]!,
            y: rectangle["y"]!,
            width: rectangle["width"]!,
            height: rectangle["height"]!
        )
        guard let image = baseCG.cropping(to: bounds) else {
            throw GeneratorError.renderFailed(characterMap[index])
        }
        return GlyphBitmap(index: index, character: characterMap[index], image: image)
    }

    for character in missing {
        let index = characterMap.count
        let renderedText = renderTextByCharacter[character] ?? character
        let rendered = try renderGlyph(
            renderedText,
            index: index,
            font: font,
            lineHeight: lineHeight
        )
        bitmaps.append(rendered)
        characterMap.append(character)
        cropping.append([
            "x": 0,
            "y": max(0, (lineHeight - rendered.image.height) / 2),
            "width": rendered.image.width,
            "height": lineHeight + 1,
        ])
        if character.unicodeScalars.allSatisfy({ $0.properties.generalCategory == .format }) {
            kerning.append(["x": 0, "y": 0, "z": 0])
        } else if renderTextByCharacter[character] != nil {
            let advance = max(1, Int(ceil(
                (renderedText as NSString).size(withAttributes: [.font: font]).width
            )))
            kerning.append(["x": 0, "y": advance, "z": 0])
        } else {
            let sideBearing = name == "SpriteFont1" ? 3 : 2
            kerning.append([
                "x": sideBearing,
                "y": rendered.image.width,
                "z": sideBearing,
            ])
        }
    }

    let padding = 2
    let packedArea = bitmaps.reduce(0) { $0 + ($1.image.width + padding) * ($1.image.height + padding) }
    print("\(name): packed area \(packedArea)/\(atlasSize * atlasSize)")
    let placements = try pack(bitmaps, atlasSize: atlasSize, padding: padding)

    guard let atlas = makeBitmap(width: atlasSize, height: atlasSize) else {
        throw GeneratorError.renderFailed(name)
    }
    NSGraphicsContext.saveGraphicsState()
    guard let atlasContext = NSGraphicsContext(bitmapImageRep: atlas) else {
        throw GeneratorError.renderFailed(name)
    }
    NSGraphicsContext.current = atlasContext
    NSColor.clear.setFill()
    NSRect(x: 0, y: 0, width: atlasSize, height: atlasSize).fill()
    NSGraphicsContext.current?.imageInterpolation = .none
    var packedGlyphs = [[String: Int]](repeating: [:], count: bitmaps.count)
    for glyph in bitmaps {
        let (glyphX, glyphY) = placements[glyph.index]!
        let image = NSImage(cgImage: glyph.image, size: NSSize(width: glyph.image.width, height: glyph.image.height))
        image.draw(
            in: NSRect(
                x: glyphX,
                y: atlasSize - glyphY - glyph.image.height,
                width: glyph.image.width,
                height: glyph.image.height
            )
        )
        packedGlyphs[glyph.index] = [
            "x": glyphX,
            "y": glyphY,
            "width": glyph.image.width,
            "height": glyph.image.height,
        ]
    }
    atlasContext.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()

    // MonoGame searches this list as an ordered table and rejects an XNB when
    // new characters are merely appended. Reorder every parallel metadata
    // list together so each character stays attached to its own bitmap and
    // metrics while the character map remains strictly ascending.
    let sortedIndices = characterMap.indices.sorted { left, right in
        characterMap[left].unicodeScalars.first!.value
            < characterMap[right].unicodeScalars.first!.value
    }
    characterMap = sortedIndices.map { characterMap[$0] }
    packedGlyphs = sortedIndices.map { packedGlyphs[$0] }
    cropping = sortedIndices.map { cropping[$0] }
    kerning = sortedIndices.map { kerning[$0] }

    content["characterMap"] = characterMap
    content["glyphs"] = packedGlyphs
    content["cropping"] = cropping
    content["kerning"] = kerning
    root["content"] = content

    try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
    try writePNG(atlas, to: outputDirectory.appendingPathComponent("\(name).png"))
    // xnbcli's SpriteFont writer consumes the content properties in this exact order.
    let orderedJSON = """
    {
      "header": \(try compactJSON(root["header"]!)),
      "readers": \(try compactJSON(root["readers"]!)),
      "content": {
        "texture": \(try compactJSON(content["texture"]!)),
        "glyphs": \(try compactJSON(content["glyphs"]!)),
        "cropping": \(try compactJSON(content["cropping"]!)),
        "characterMap": \(try compactJSON(content["characterMap"]!)),
        "verticalLineSpacing": \(try compactJSON(content["verticalLineSpacing"]!)),
        "horizontalSpacing": \(try compactJSON(content["horizontalSpacing"]!)),
        "kerning": \(try compactJSON(content["kerning"]!)),
        "defaultCharacter": \(try compactJSON(content["defaultCharacter"]!))
      }
    }
    """
    try Data((orderedJSON + "\n").utf8).write(to: outputDirectory.appendingPathComponent("\(name).json"))
    print("\(name): kept \(existing.count), added \(missing.count), atlas \(atlasSize)x\(atlasSize)")
}

func xmlEscaped(_ value: String) -> String {
    value
        .replacingOccurrences(of: "&", with: "&amp;")
        .replacingOccurrences(of: "\"", with: "&quot;")
        .replacingOccurrences(of: "<", with: "&lt;")
        .replacingOccurrences(of: ">", with: "&gt;")
}

func processBmFont(
    name: String,
    fontSize: CGFloat,
    atlasSize: Int,
    outputDirectory: URL,
    requiredCharacters: Set<String>,
    fontName: String,
    renderTextByCharacter: [String: String]
) throws {
    guard let font = NSFont(name: fontName, size: fontSize) else {
        throw GeneratorError.missingFont
    }
    let lineHeight = 18
    let base = 14
    let orderedCharacters = requiredCharacters
        .filter { $0 != "\n" && $0 != "\r" && $0 != "\t" }
        .sorted { left, right in
            left.unicodeScalars.first!.value < right.unicodeScalars.first!.value
        }
    var bitmaps: [GlyphBitmap] = []
    var advances: [Int: Int] = [:]
    var yOffsets: [Int: Int] = [:]
    for (index, character) in orderedCharacters.enumerated() {
        let renderedText = renderTextByCharacter[character] ?? character
        if renderedText.unicodeScalars.allSatisfy({ CharacterSet.whitespacesAndNewlines.contains($0) }) {
            guard let bitmap = NSBitmapImageRep(
                bitmapDataPlanes: nil,
                pixelsWide: 1,
                pixelsHigh: 1,
                bitsPerSample: 8,
                samplesPerPixel: 4,
                hasAlpha: true,
                isPlanar: false,
                colorSpaceName: .deviceRGB,
                bytesPerRow: 0,
                bitsPerPixel: 0
            ), let image = bitmap.cgImage else {
                throw GeneratorError.renderFailed(character)
            }
            bitmaps.append(GlyphBitmap(index: index, character: character, image: image))
            advances[index] = 4
            yOffsets[index] = base
            continue
        }
        let glyph = try renderGlyph(renderedText, index: index, font: font, lineHeight: lineHeight)
        bitmaps.append(GlyphBitmap(index: index, character: character, image: glyph.image))
        advances[index] = max(1, Int(ceil((renderedText as NSString).size(withAttributes: [.font: font]).width)))
        yOffsets[index] = max(0, (lineHeight - glyph.image.height) / 2)
    }
    let placements = try pack(bitmaps, atlasSize: atlasSize, padding: 1)
    guard let atlas = makeBitmap(width: atlasSize, height: atlasSize) else {
        throw GeneratorError.renderFailed(name)
    }
    NSGraphicsContext.saveGraphicsState()
    guard let atlasContext = NSGraphicsContext(bitmapImageRep: atlas) else {
        throw GeneratorError.renderFailed(name)
    }
    NSGraphicsContext.current = atlasContext
    NSColor.clear.setFill()
    NSRect(x: 0, y: 0, width: atlasSize, height: atlasSize).fill()
    NSGraphicsContext.current?.imageInterpolation = .none
    for glyph in bitmaps {
        let (x, y) = placements[glyph.index]!
        let image = NSImage(cgImage: glyph.image, size: NSSize(width: glyph.image.width, height: glyph.image.height))
        image.draw(in: NSRect(
            x: x,
            y: atlasSize - y - glyph.image.height,
            width: glyph.image.width,
            height: glyph.image.height
        ))
    }
    atlasContext.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()
    try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
    try writePNG(atlas, to: outputDirectory.appendingPathComponent("\(name)_0.png"))

    var lines = [
        "<?xml version=\"1.0\" encoding=\"utf-8\"?>",
        "<font>",
        "  <info face=\"\(xmlEscaped(font.displayName ?? font.fontName))\" size=\"\(Int(fontSize))\" bold=\"0\" italic=\"0\" charset=\"\" unicode=\"1\" stretchH=\"100\" smooth=\"0\" aa=\"1\" padding=\"0,0,0,0\" spacing=\"1,1\" outline=\"0\" />",
        "  <common lineHeight=\"\(lineHeight)\" base=\"\(base)\" scaleW=\"\(atlasSize)\" scaleH=\"\(atlasSize)\" pages=\"1\" packed=\"0\" alphaChnl=\"0\" redChnl=\"4\" greenChnl=\"4\" blueChnl=\"4\" />",
        "  <pages>",
        "    <page id=\"0\" file=\"\(name)_0\" />",
        "  </pages>",
        "  <chars count=\"\(bitmaps.count)\">",
    ]
    for glyph in bitmaps {
        let (x, y) = placements[glyph.index]!
        let id = orderedCharacters[glyph.index].unicodeScalars.first!.value
        lines.append(
            "    <char id=\"\(id)\" x=\"\(x)\" y=\"\(y)\" width=\"\(glyph.image.width)\" height=\"\(glyph.image.height)\" xoffset=\"0\" yoffset=\"\(yOffsets[glyph.index]!)\" xadvance=\"\(advances[glyph.index]!)\" page=\"0\" chnl=\"15\" />"
        )
    }
    lines.append(contentsOf: ["  </chars>", "</font>"])
    try Data((lines.joined(separator: "\n") + "\n").utf8).write(
        to: outputDirectory.appendingPathComponent("\(name).xml")
    )

    let fontJSON: [String: Any] = [
        "header": ["target": "w", "formatVersion": 5, "hidef": true, "compressed": 128],
        "readers": [[
            "type": "BmFont.XmlSourceReader, BmFont, Version=2012.1.7.0, Culture=neutral, PublicKeyToken=null",
            "version": 0,
        ]],
        "content": ["export": "\(name).xml"],
    ]
    let textureJSON: [String: Any] = [
        "header": ["target": "w", "formatVersion": 5, "hidef": true, "compressed": 128],
        "readers": [[
            "type": "Microsoft.Xna.Framework.Content.Texture2DReader, Microsoft.Xna.Framework.Graphics, Version=4.0.0.0, Culture=neutral, PublicKeyToken=842cf8be1de50553",
            "version": 0,
        ]],
        "content": ["format": 0, "export": "\(name)_0.png"],
    ]
    for (filename, value) in [("\(name).json", fontJSON), ("\(name)_0.json", textureJSON)] {
        let data = try JSONSerialization.data(withJSONObject: value, options: [.prettyPrinted, .sortedKeys])
        try (data + Data("\n".utf8)).write(to: outputDirectory.appendingPathComponent(filename))
    }
    print("\(name): generated \(bitmaps.count) BMFont glyphs in a \(atlasSize)x\(atlasSize) atlas")
}

do {
    guard CommandLine.arguments.count == 5 || CommandLine.arguments.count == 6 else {
        throw GeneratorError.usage
    }
    let englishDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
    let translationsDirectory = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
    let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[3], isDirectory: true)
    let fontURL = URL(fileURLWithPath: CommandLine.arguments[4])
    var renderTextByCharacter: [String: String] = [:]
    if CommandLine.arguments.count == 6 {
        let mappingURL = URL(fileURLWithPath: CommandLine.arguments[5])
        let value = try JSONSerialization.jsonObject(with: Data(contentsOf: mappingURL))
        guard let document = value as? [String: Any],
              let entries = document["entries"] as? [[String: Any]] else {
            throw GeneratorError.invalidJSON(mappingURL.path)
        }
        for entry in entries {
            guard let glyph = entry["glyph"] as? String,
                  let cluster = entry["cluster"] as? String else {
                throw GeneratorError.invalidJSON(mappingURL.path)
            }
            renderTextByCharacter[glyph] = cluster
        }
    }
    var registrationError: Unmanaged<CFError>?
    _ = CTFontManagerRegisterFontsForURL(fontURL as CFURL, .process, &registrationError)
    guard let descriptors = CTFontManagerCreateFontDescriptorsFromURL(fontURL as CFURL) as? [CTFontDescriptor] else {
        throw GeneratorError.missingFont
    }
    let requestedFontName = ProcessInfo.processInfo.environment["VN_FONT_NAME"]
    let availableFontNames = descriptors.compactMap {
        CTFontDescriptorCopyAttribute($0, kCTFontNameAttribute) as? String
    }
    guard let fontName = requestedFontName ?? availableFontNames.first,
          availableFontNames.contains(fontName) else {
        throw GeneratorError.missingFont
    }

    var requiredCharacters = Set<String>()
    // Save slots keep player/farm names across language switches. Include the
    // character inventory of every language in the unified pack, plus the
    // complete modern Russian alphabet for older Cyrillic-named saves.
    for value in 0x0410...0x044F {
        if let scalar = UnicodeScalar(value) {
            requiredCharacters.insert(String(scalar))
        }
    }
    requiredCharacters.insert("Ё")
    requiredCharacters.insert("ё")
    if let extraCharacters = ProcessInfo.processInfo.environment["VN_EXTRA_CHARACTERS"] {
        for scalar in extraCharacters.precomposedStringWithCanonicalMapping.unicodeScalars {
            if !CharacterSet.whitespacesAndNewlines.contains(scalar) {
                requiredCharacters.insert(String(scalar))
            }
        }
    }
    requiredCharacters.formUnion(renderTextByCharacter.keys)
    let enumerator = FileManager.default.enumerator(
        at: translationsDirectory,
        includingPropertiesForKeys: [.isRegularFileKey]
    )
    var files: [URL] = []
    while let file = enumerator?.nextObject() as? URL {
        if file.pathExtension == "json" {
            files.append(file)
        }
    }
    for file in files {
        let value = try JSONSerialization.jsonObject(with: Data(contentsOf: file))
        collectStrings(from: value, into: &requiredCharacters)
    }

    let spriteAtlasSize = Int(ProcessInfo.processInfo.environment["VN_SPRITEFONT_ATLAS_SIZE"] ?? "")
        ?? (renderTextByCharacter.isEmpty ? 1024 : 2048)
    let smallAtlasSize = Int(ProcessInfo.processInfo.environment["VN_SMALLFONT_ATLAS_SIZE"] ?? "")
        ?? (renderTextByCharacter.isEmpty ? 512 : 2048)
    let bitmapAtlasSize = Int(ProcessInfo.processInfo.environment["VN_BITMAP_FONT_ATLAS_SIZE"] ?? "") ?? 1024
    let generateBitmapFont = !renderTextByCharacter.isEmpty
        || ProcessInfo.processInfo.environment["VN_GENERATE_BITMAP_FONT"] == "1"

    try processFont(
        name: "SpriteFont1",
        fontSize: CGFloat(
            Double(ProcessInfo.processInfo.environment["VN_SPRITEFONT_SIZE"] ?? "") ?? 34
        ),
        atlasSize: spriteAtlasSize,
        englishDirectory: englishDirectory,
        outputDirectory: outputDirectory,
        requiredCharacters: requiredCharacters,
        fontName: fontName,
        renderTextByCharacter: renderTextByCharacter
    )
    try processFont(
        name: "SmallFont",
        fontSize: CGFloat(
            Double(ProcessInfo.processInfo.environment["VN_SMALLFONT_SIZE"] ?? "") ?? 22
        ),
        atlasSize: smallAtlasSize,
        englishDirectory: englishDirectory,
        outputDirectory: outputDirectory,
        requiredCharacters: requiredCharacters,
        fontName: fontName,
        renderTextByCharacter: renderTextByCharacter
    )
    if generateBitmapFont {
        let bitmapFontName = ProcessInfo.processInfo.environment["VN_BITMAP_FONT_NAME"] ?? "Malayalam"
        try processBmFont(
            name: bitmapFontName,
            fontSize: 12,
            atlasSize: bitmapAtlasSize,
            outputDirectory: outputDirectory,
            requiredCharacters: requiredCharacters,
            fontName: fontName,
            renderTextByCharacter: renderTextByCharacter
        )
    }
} catch {
    fputs("\(error)\n", stderr)
    exit(1)
}
