import AppKit
import Foundation

let size = NSSize(width: 174, height: 78)
let image = NSImage(size: size)
image.lockFocus()

func drawState(y: CGFloat, background: NSColor, border: NSColor) {
    let outer = NSBezierPath(roundedRect: NSRect(x: 0, y: y, width: 174, height: 39), xRadius: 5, yRadius: 5)
    background.setFill()
    outer.fill()
    let inner = NSBezierPath(roundedRect: NSRect(x: 2, y: y + 2, width: 170, height: 35), xRadius: 4, yRadius: 4)
    border.setFill()
    inner.fill()
    NSColor(calibratedRed: 0.23, green: 0.13, blue: 0.09, alpha: 1).setStroke()
    inner.lineWidth = 2
    inner.stroke()
}

drawState(y: 39, background: NSColor(calibratedRed: 0.96, green: 0.77, blue: 0.42, alpha: 1), border: NSColor(calibratedRed: 0.48, green: 0.25, blue: 0.14, alpha: 1))
drawState(y: 0, background: NSColor(calibratedRed: 1, green: 0.89, blue: 0.57, alpha: 1), border: NSColor(calibratedRed: 0.62, green: 0.32, blue: 0.18, alpha: 1))

let paragraph = NSMutableParagraphStyle()
paragraph.alignment = .center
let titleAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 13, weight: .bold),
    .foregroundColor: NSColor(calibratedRed: 1, green: 0.97, blue: 0.84, alpha: 1),
    .paragraphStyle: paragraph,
]
let subtitleAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 8, weight: .semibold),
    .foregroundColor: NSColor(calibratedRed: 1, green: 0.97, blue: 0.84, alpha: 1),
    .paragraphStyle: paragraph,
    .kern: 1.2,
]
for baseY in [CGFloat(39), CGFloat(0)] {
    NSString(string: "БЪЛГАРСКИ").draw(in: NSRect(x: 0, y: baseY + 18, width: 174, height: 17), withAttributes: titleAttributes)
    NSString(string: "VN REVIVAL").draw(in: NSRect(x: 0, y: baseY + 6, width: 174, height: 12), withAttributes: subtitleAttributes)
}

image.unlockFocus()
guard let tiff = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiff),
      let png = bitmap.representation(using: .png, properties: [:]) else {
    fatalError("Could not render Bulgarian language button")
}
try png.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
