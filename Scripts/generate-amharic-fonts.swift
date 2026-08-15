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
    var free = [AtlasRectangle(x: 0, y: 0, width: atlasSize, height: atlasSize)]
    var placements: [Int: (Int, Int)] = [:]
    let ordered = bitmaps.sorted {
        let leftArea = $0.image.width * $0.image.height
        let rightArea = $1.image.width * $1.image.height
        if leftArea == rightArea { return max($0.image.width, $0.image.height) > max($1.image.width, $1.image.height) }
        return leftArea > rightArea
    }

    for glyph in ordered {
        let neededWidth = glyph.image.width + padding
        let neededHeight = glyph.image.height + padding
        let candidates = free.enumerated().filter {
            $0.element.width >= neededWidth && $0.element.height >= neededHeight
        }
        guard let selected = candidates.min(by: { left, right in
            let leftWaste = left.element.width * left.element.height - neededWidth * neededHeight
            let rightWaste = right.element.width * right.element.height - neededWidth * neededHeight
            if leftWaste == rightWaste {
                return min(left.element.width - neededWidth, left.element.height - neededHeight)
                    < min(right.element.width - neededWidth, right.element.height - neededHeight)
            }
            return leftWaste < rightWaste
        }) else {
            throw GeneratorError.renderFailed("atlas overflow")
        }

        let used = AtlasRectangle(
            x: selected.element.x,
            y: selected.element.y,
            width: neededWidth,
            height: neededHeight
        )
        placements[glyph.index] = (used.x, used.y)

        var split: [AtlasRectangle] = []
        for rectangle in free {
            guard rectangle.intersects(used) else {
                split.append(rectangle)
                continue
            }
            if used.x > rectangle.x {
                split.append(AtlasRectangle(x: rectangle.x, y: rectangle.y, width: used.x - rectangle.x, height: rectangle.height))
            }
            if used.right < rectangle.right {
                split.append(AtlasRectangle(x: used.right, y: rectangle.y, width: rectangle.right - used.right, height: rectangle.height))
            }
            if used.y > rectangle.y {
                split.append(AtlasRectangle(x: rectangle.x, y: rectangle.y, width: rectangle.width, height: used.y - rectangle.y))
            }
            if used.bottom < rectangle.bottom {
                split.append(AtlasRectangle(x: rectangle.x, y: used.bottom, width: rectangle.width, height: rectangle.bottom - used.bottom))
            }
        }

        free = split.enumerated().compactMap { index, rectangle in
            for (otherIndex, other) in split.enumerated() where index != otherIndex {
                if other.contains(rectangle) { return nil }
            }
            return rectangle
        }
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
            return "Usage: generate-amharic-fonts <english-unpacked-dir> <translations-dir> <output-dir> <ethiopic-font-file>"
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
            if !CharacterSet.whitespacesAndNewlines.contains(scalar)
                && !CharacterSet.nonBaseCharacters.contains(scalar) {
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

func writePNG(_ image: NSImage, to url: URL) throws {
    guard let tiff = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiff),
          let pixels = bitmap.bitmapData else {
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
    fontName: String
) throws {
    let jsonURL = englishDirectory.appendingPathComponent("\(name).json")
    let imageURL = englishDirectory.appendingPathComponent("\(name).png")
    let raw = try Data(contentsOf: jsonURL)
    guard var root = try JSONSerialization.jsonObject(with: raw) as? [String: Any],
          var content = root["content"] as? [String: Any],
          var characterMap = content["characterMap"] as? [String],
          let glyphs = content["glyphs"] as? [[String: Int]],
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
        let rendered = try renderGlyph(character, index: index, font: font, lineHeight: lineHeight)
        bitmaps.append(rendered)
        characterMap.append(character)
        cropping.append([
            "x": 0,
            "y": max(0, (lineHeight - rendered.image.height) / 2),
            "width": rendered.image.width,
            "height": lineHeight + 1,
        ])
        let sideBearing = name == "SpriteFont1" ? 3 : 2
        kerning.append([
            "x": sideBearing,
            "y": rendered.image.width,
            "z": sideBearing,
        ])
    }

    let padding = 2
    let packedArea = bitmaps.reduce(0) { $0 + ($1.image.width + padding) * ($1.image.height + padding) }
    print("\(name): packed area \(packedArea)/\(atlasSize * atlasSize)")
    let placements = try pack(bitmaps, atlasSize: atlasSize, padding: padding)

    let atlas = NSImage(size: NSSize(width: atlasSize, height: atlasSize))
    atlas.lockFocus()
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
    atlas.unlockFocus()

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

do {
    guard CommandLine.arguments.count == 5 else { throw GeneratorError.usage }
    let englishDirectory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
    let translationsDirectory = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
    let outputDirectory = URL(fileURLWithPath: CommandLine.arguments[3], isDirectory: true)
    let fontURL = URL(fileURLWithPath: CommandLine.arguments[4])
    var registrationError: Unmanaged<CFError>?
    guard CTFontManagerRegisterFontsForURL(fontURL as CFURL, .process, &registrationError),
          let descriptors = CTFontManagerCreateFontDescriptorsFromURL(fontURL as CFURL) as? [CTFontDescriptor],
          let descriptor = descriptors.first,
          let fontName = CTFontDescriptorCopyAttribute(descriptor, kCTFontNameAttribute) as? String else {
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

    try processFont(
        name: "SpriteFont1",
        fontSize: 34,
        atlasSize: 1024,
        englishDirectory: englishDirectory,
        outputDirectory: outputDirectory,
        requiredCharacters: requiredCharacters,
        fontName: fontName
    )
    try processFont(
        name: "SmallFont",
        fontSize: 22,
        atlasSize: 512,
        englishDirectory: englishDirectory,
        outputDirectory: outputDirectory,
        requiredCharacters: requiredCharacters,
        fontName: fontName
    )
} catch {
    fputs("\(error)\n", stderr)
    exit(1)
}
