#!/usr/bin/env swift

import AppKit
import Foundation

func fail(_ message: String) -> Never {
    fputs("label-overlay: \(message)\n", stderr)
    exit(1)
}

let arguments = Array(CommandLine.arguments.dropFirst())
guard arguments.count == 3 else {
    fail("usage: label-overlay INPUT.png OUTPUT.png LABEL")
}

let inputPath = arguments[0]
let outputPath = arguments[1]
let label = arguments[2]

guard let sourceData = try? Data(contentsOf: URL(fileURLWithPath: inputPath)),
      let sourceRep = NSBitmapImageRep(data: sourceData),
      let sourceImage = NSImage(data: sourceData) else {
    fail("could not read \(inputPath)")
}

let width = sourceRep.pixelsWide
let height = sourceRep.pixelsHigh
guard width > 0, height > 0 else {
    fail("input image has invalid dimensions")
}
guard let outputRep = NSBitmapImageRep(
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
), let context = NSGraphicsContext(bitmapImageRep: outputRep) else {
    fail("could not create output bitmap")
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.imageInterpolation = NSImageInterpolation.none
sourceImage.draw(
    in: NSRect(x: 0, y: 0, width: width, height: height),
    from: NSRect(origin: .zero, size: sourceImage.size),
    operation: .copy,
    fraction: 1
)

let panel = NSRect(x: 64, y: height - 148, width: 866, height: 84)
let panelPath = NSBezierPath(roundedRect: panel, xRadius: 18, yRadius: 18)
NSColor(calibratedRed: 16 / 255, green: 24 / 255, blue: 39 / 255, alpha: 0.8).setFill()
panelPath.fill()
NSColor(calibratedWhite: 1, alpha: 0.4).setStroke()
panelPath.lineWidth = 2
panelPath.stroke()

let paragraph = NSMutableParagraphStyle()
paragraph.baseWritingDirection = .leftToRight
paragraph.alignment = .left
paragraph.lineBreakMode = .byClipping
let attributes: [NSAttributedString.Key: Any] = [
    .font: NSFont(name: "Arial Unicode MS", size: 34) ?? NSFont.systemFont(ofSize: 34),
    .foregroundColor: NSColor.white,
    .paragraphStyle: paragraph,
]
(label as NSString).draw(
    in: NSRect(x: 96, y: height - 139, width: 810, height: 54),
    withAttributes: attributes
)
context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()

guard let png = outputRep.representation(using: NSBitmapImageRep.FileType.png, properties: [:]) else {
    fail("could not encode PNG")
}
do {
    try png.write(to: URL(fileURLWithPath: outputPath), options: Data.WritingOptions.atomic)
} catch {
    fail("could not write \(outputPath): \(error)")
}
