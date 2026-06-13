import Foundation

struct AnalyzeMealResponse: Decodable {
  let analysis: MealAnalysisPayload
  let mode: String?
}

struct MealAnalysisPayload: Decodable {
  let mealName: String
  let itemEstimate: [MealItemEstimatePayload]?
  let nutrition: NutritionPayload
  let uncertainty: String?
  let audioBrief: String?
}

struct MealItemEstimatePayload: Codable {
  let name: String
  let amount: String
  let confidence: Double?
}

struct NutritionPayload: Decodable {
  let calories: NutritionMetricPayload
  let protein: NutritionMetricPayload
  let carbs: NutritionMetricPayload
  let fat: NutritionMetricPayload
  let sodium: NutritionMetricPayload?
}

struct NutritionMetricPayload: Decodable {
  let value: Double
  let range: String?
  let unit: String?
}

struct MealLogCard: Identifiable, Codable {
  let id: String
  let timestamp: String
  let source: String
  let status: String
  let triggered: Bool
  let transcript: String
  let mealName: String
  let calories: Double
  let protein: Double?
  let carbs: Double?
  let fat: Double?
  let sodium: Double?
  let imageLabel: String?
  let thumbnailDataUrl: String?
  let uncertainty: String?
  let mode: String?
  let note: String?
  let calorieRange: String?
  let proteinRange: String?
  let carbsRange: String?
  let fatRange: String?
  let items: [MealLogItem]?

  var timeLabel: String {
    guard let date = Self.isoFormatter.date(from: timestamp) else {
      return "--"
    }
    return Self.timeFormatter.string(from: date)
  }

  private static let isoFormatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
  }()

  private static let timeFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateStyle = .none
    formatter.timeStyle = .short
    return formatter
  }()
}

struct MealLogItem: Identifiable, Codable {
  var id: String { "\(name)-\(amount)" }
  let name: String
  let amount: String
  let confidence: Double?
}

struct LogsResponse: Decodable {
  let logs: [MealLogCard]
}

struct LogMealResponse: Decodable {
  let ok: Bool
  let log: MealLogCard?
  let csvRow: String?
  let path: String?
  let error: String?
}
