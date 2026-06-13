import Foundation
import Observation
import SwiftUI

@Observable
@MainActor
final class ItadakiMealLogViewModel {
  var logs: [MealLogCard] = []
  var isAnalyzing = false
  var statusText = "Ready to capture a meal."
  var errorMessage = ""
  var showError = false

  private let baseURL = URL(string: "https://itadaki-health.vercel.app")!

  func refreshLogs() async {
    do {
      let response: LogsResponse = try await get("/api/logs?limit=20")
      logs = response.logs
      statusText = logs.isEmpty ? "No meals logged yet." : "Synced \(logs.count) meals."
    } catch {
      showError("Could not refresh logs: \(error.localizedDescription)")
    }
  }

  func analyzeAndLog(photo: UIImage, transcript: String = "Itadakimasu") async {
    let preparedPhoto = photo.itadakiMealCrop()
    guard let imageData = preparedPhoto.jpegData(compressionQuality: 0.72) else {
      showError("Could not encode photo.")
      return
    }

    let dataURL = "data:image/jpeg;base64,\(imageData.base64EncodedString())"
    isAnalyzing = true
    statusText = "Analyzing meal with Grok..."

    do {
      let analysisResponse: AnalyzeMealResponse = try await post(
        "/api/analyze-meal",
        body: [
          "scenarioId": "manual",
          "ritual": transcript,
          "mealText": "iOS DAT companion capture. Estimate meal contents and calories.",
          "imageData": dataURL,
        ]
      )

      let analysis = analysisResponse.analysis
      let logResponse: LogMealResponse = try await post(
        "/api/log-meal",
        body: [
          "source": "ios-dat-companion",
          "status": "logged",
          "triggered": true,
          "transcript": transcript,
          "mealName": analysis.mealName,
          "calories": analysis.nutrition.calories.value,
          "protein": analysis.nutrition.protein.value,
          "carbs": analysis.nutrition.carbs.value,
          "fat": analysis.nutrition.fat.value,
          "imageLabel": "dat-photo",
          "thumbnailDataUrl": dataURL,
          "uncertainty": analysis.uncertainty ?? "",
          "mode": analysisResponse.mode ?? "xai",
          "note": "Captured through the iOS DAT companion, center-cropped before analysis.",
        ]
      )

      if let log = logResponse.log {
        logs.insert(log, at: 0)
        statusText = "Logged \(Int(log.calories)) calories."
      } else {
        await refreshLogs()
      }
    } catch {
      showError("Meal analysis failed: \(error.localizedDescription)")
    }

    isAnalyzing = false
  }

  private func get<T: Decodable>(_ path: String) async throws -> T {
    let url = endpoint(path)
    let (data, response) = try await URLSession.shared.data(from: url)
    try validate(response)
    return try decoder.decode(T.self, from: data)
  }

  private func post<T: Decodable>(_ path: String, body: [String: Any]) async throws -> T {
    let url = endpoint(path)
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONSerialization.data(withJSONObject: body)
    let (data, response) = try await URLSession.shared.data(for: request)
    try validate(response)
    return try decoder.decode(T.self, from: data)
  }

  private func validate(_ response: URLResponse) throws {
    guard let httpResponse = response as? HTTPURLResponse else { return }
    if !(200...299).contains(httpResponse.statusCode) {
      throw URLError(.badServerResponse)
    }
  }

  private func endpoint(_ path: String) -> URL {
    URL(string: path, relativeTo: baseURL)!.absoluteURL
  }

  private var decoder: JSONDecoder {
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    return decoder
  }

  private func showError(_ message: String) {
    errorMessage = message
    showError = true
    statusText = message
  }
}
