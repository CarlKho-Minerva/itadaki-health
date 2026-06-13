import UIKit

extension UIImage {
  func itadakiMealCrop(maxSide: CGFloat = 1024) -> UIImage {
    let normalized = normalizedForProcessing()
    let sourceSize = normalized.size
    let side = min(sourceSize.width, sourceSize.height)
    guard side > 0 else { return normalized }

    let scale = min(1, maxSide / side)
    let targetSide = side * scale
    let cropOrigin = CGPoint(
      x: (sourceSize.width - side) / 2,
      y: (sourceSize.height - side) / 2
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
