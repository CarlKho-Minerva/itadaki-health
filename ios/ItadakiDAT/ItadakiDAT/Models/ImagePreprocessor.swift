import UIKit

extension UIImage {
  func itadakiMealCrop(maxSide: CGFloat = 1024) -> UIImage {
    let normalized = normalizedForProcessing()
    let sourceSize = normalized.size
    let baseSide = min(sourceSize.width, sourceSize.height)
    let side = baseSide * 0.92
    guard side > 0 else { return normalized }

    let scale = min(1, maxSide / side)
    let targetSide = side * scale
    let centerX = sourceSize.width * 0.5
    let centerY = sourceSize.height * 0.54
    let cropOrigin = CGPoint(
      x: min(max(0, centerX - side / 2), sourceSize.width - side),
      y: min(max(0, centerY - side / 2), sourceSize.height - side)
    )

    let renderer = UIGraphicsImageRenderer(size: CGSize(width: targetSide, height: targetSide))
    return renderer.image { _ in
      normalized.draw(
        in: CGRect(
          x: -cropOrigin.x * scale,
          y: -cropOrigin.y * scale,
          width: sourceSize.width * scale,
          height: sourceSize.height * scale
        )
      )
    }
  }

  private func normalizedForProcessing() -> UIImage {
    guard imageOrientation != .up else { return self }
    let renderer = UIGraphicsImageRenderer(size: size)
    return renderer.image { _ in
      draw(in: CGRect(origin: .zero, size: size))
    }
  }
}
