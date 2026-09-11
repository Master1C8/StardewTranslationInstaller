import AppKit
import CoreText
import Foundation

enum RenderError: Error {
    case usage
    case font
    case bitmap
}

func alphaBounds(of bitmap: NSBitmapImageRep) -> CGRect? {
    guard let data = bitmap.bitmapData else { return nil }
    let bytesPerPixel = bitmap.bitsPerPixel / 8
    var minX = bitmap.pixelsWide
    var minY = bitmap.pixelsHigh
    var maxX = -1
    var maxY = -1
    for y in 0..<bitmap.pixelsHigh {
        for x in 0..<bitmap.pixelsWide {
            if data[y * bitmap.bytesPerRow + x * bytesPerPixel + 3] != 0 {
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

do {
    guard (5...7).contains(CommandLine.arguments.count),
          let size = Double(CommandLine.arguments[3]) else { throw RenderError.usage }
    let fontURL = URL(fileURLWithPath: CommandLine.arguments[1])
    let text = CommandLine.arguments[2]
    let outputURL = URL(fileURLWithPath: CommandLine.arguments[4])
    var registrationError: Unmanaged<CFError>?
    _ = CTFontManagerRegisterFontsForURL(fontURL as CFURL, .process, &registrationError)
    guard let descriptors = CTFontManagerCreateFontDescriptorsFromURL(fontURL as CFURL) as? [CTFontDescriptor]
    else { throw RenderError.font }
    let requestedDescriptorIndex = CommandLine.arguments.count >= 6
        ? Int(CommandLine.arguments[5])
        : descriptors.indices.last
    guard let requestedDescriptorIndex,
          descriptors.indices.contains(requestedDescriptorIndex) else { throw RenderError.font }
    let descriptor = descriptors[requestedDescriptorIndex]
    let alphaThreshold = CommandLine.arguments.count == 7
        ? Int(CommandLine.arguments[6])
        : 96
    guard let alphaThreshold, (0...255).contains(alphaThreshold) else { throw RenderError.usage }
    guard
          let fontName = CTFontDescriptorCopyAttribute(descriptor, kCTFontNameAttribute) as? String,
          let font = NSFont(name: fontName, size: size) else { throw RenderError.font }

    let measured = (text as NSString).size(withAttributes: [.font: font])
    let width = max(32, Int(ceil(measured.width)) + 32)
    let height = max(32, Int(ceil(measured.height)) + 32)
    guard let bitmap = NSBitmapImageRep(
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
    ) else { throw RenderError.bitmap }
    NSGraphicsContext.saveGraphicsState()
    guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else { throw RenderError.bitmap }
    NSGraphicsContext.current = context
    NSColor.clear.setFill()
    NSRect(x: 0, y: 0, width: width, height: height).fill()
    (text as NSString).draw(at: NSPoint(x: 16, y: 16), withAttributes: [
        .font: font,
        .foregroundColor: NSColor.white,
    ])
    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()
    guard let bounds = alphaBounds(of: bitmap),
          let image = bitmap.cgImage?.cropping(to: bounds) else { throw RenderError.bitmap }
    let result = NSBitmapImageRep(cgImage: image)
    guard let pixels = result.bitmapData else { throw RenderError.bitmap }
    let bytesPerPixel = result.bitsPerPixel / 8
    for y in 0..<result.pixelsHigh {
        for x in 0..<result.pixelsWide {
            let offset = y * result.bytesPerRow + x * bytesPerPixel
            let opaque = Int(pixels[offset + 3]) >= alphaThreshold
            pixels[offset] = opaque ? 255 : 0
            pixels[offset + 1] = opaque ? 255 : 0
            pixels[offset + 2] = opaque ? 255 : 0
            pixels[offset + 3] = opaque ? 255 : 0
        }
    }
    guard let data = result.representation(using: .png, properties: [:]) else {
        throw RenderError.bitmap
    }
    try data.write(to: outputURL)
} catch {
    fputs("Usage: render-shaped-text <font-file> <text> <size> <output.png> [font-index] [alpha-threshold]\n", stderr)
    exit(1)
}
