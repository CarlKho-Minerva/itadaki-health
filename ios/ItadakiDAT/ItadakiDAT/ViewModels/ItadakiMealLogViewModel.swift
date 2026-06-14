import AVFoundation
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
  private let speechSynthesizer = AVSpeechSynthesizer()
  private var audioPlayer: AVAudioPlayer?

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
    let cardThumbnail = photo.itadakiMealCrop(maxSide: 320)
    guard let imageData = preparedPhoto.jpegData(compressionQuality: 0.72) else {
      showError("Could not encode photo.")
      return
    }

    let dataURL = "data:image/jpeg;base64,\(imageData.base64EncodedString())"
    let thumbnailDataURL = cardThumbnail.jpegData(compressionQuality: 0.58)
      .map { "data:image/jpeg;base64,\($0.base64EncodedString())" } ?? dataURL
    isAnalyzing = true
    statusText = "Analyzing meal with Grok..."
    defer { isAnalyzing = false }

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
      var logBody: [String: Any] = [
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
        "thumbnailDataUrl": thumbnailDataURL,
        "uncertainty": analysis.uncertainty ?? "",
        "audioBrief": analysis.audioBrief ?? "",
        "mode": analysisResponse.mode ?? "xai",
        "note": "Captured through the iOS DAT companion, food-focus cropped before analysis.",
        "items": (analysis.itemEstimate ?? []).map { item in
          [
            "name": item.name,
            "amount": item.amount,
            "confidence": item.confidence ?? 0,
          ] as [String: Any]
        },
      ]
      if let sodium = analysis.nutrition.sodium?.value {
        logBody["sodium"] = sodium
      }
      if let range = analysis.nutrition.calories.range {
        logBody["calorieRange"] = range
      }
      if let range = analysis.nutrition.protein.range {
        logBody["proteinRange"] = range
      }
      if let range = analysis.nutrition.carbs.range {
        logBody["carbsRange"] = range
      }
      if let range = analysis.nutrition.fat.range {
        logBody["fatRange"] = range
      }

      let logResponse: LogMealResponse = try await post(
        "/api/log-meal",
        body: logBody
      )

      if let log = logResponse.log {
        logs.insert(log, at: 0)
        statusText = "Logged \(Int(log.calories)) calories."
        await speakSummary(analysis.audioBrief ?? "Meal saved. I will watch the pattern.")
      } else {
        await refreshLogs()
        await speakSummary(analysis.audioBrief ?? "Meal saved. I will watch the pattern.")
      }
    } catch {
      showError("Meal analysis failed: \(error.localizedDescription)")
    }
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

  private func speakSummary(_ text: String) async {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return }

    do {
      let url = endpoint("/api/speak")
      var request = URLRequest(url: url)
      request.httpMethod = "POST"
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = try JSONSerialization.data(withJSONObject: [
        "text": trimmed,
        "language": "en",
      ])

      let (data, response) = try await URLSession.shared.data(for: request)
      try validate(response)
      try AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
      try AVAudioSession.sharedInstance().setActive(true)
      audioPlayer = try AVAudioPlayer(data: data)
      audioPlayer?.prepareToPlay()
      audioPlayer?.play()
    } catch {
      let utterance = AVSpeechUtterance(string: trimmed)
      utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.92
      utterance.volume = 0.9
      speechSynthesizer.speak(utterance)
    }
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
