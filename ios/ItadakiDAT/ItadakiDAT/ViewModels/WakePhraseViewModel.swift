import AVFoundation
import Foundation
import Observation

struct WakePhraseResponse: Decodable {
  let text: String
  let triggered: Bool
  let error: String?
}

@Observable
@MainActor
final class WakePhraseViewModel {
  var isRecording = false
  var isTranscribing = false
  var lastTranscript = ""
  var statusText = "Tap to listen for itadakimasu."
  var inputLabel = "Mic input: not armed."
  var showError = false
  var errorMessage = ""

  var bestTranscript: String {
    lastTranscript.isEmpty ? "Itadakimasu" : lastTranscript
  }

  @ObservationIgnored private var recorder: AVAudioRecorder?
  private let baseURL = URL(string: "https://itadaki-health.vercel.app")!

  func recordAndTranscribe() async -> Bool {
    guard !isRecording && !isTranscribing else { return false }

    do {
      try await requestMicrophonePermission()
      let audioURL = try startRecording()
      try await Task.sleep(nanoseconds: 2_800_000_000)
      stopRecording()
      return try await transcribe(audioURL: audioURL)
    } catch {
      stopRecording()
      showError("Voice trigger failed: \(error.localizedDescription)")
      return false
    }
  }

  private func requestMicrophonePermission() async throws {
    let granted = await withCheckedContinuation { continuation in
      if #available(iOS 17.0, *) {
        AVAudioApplication.requestRecordPermission { allowed in
          continuation.resume(returning: allowed)
        }
      } else {
        AVAudioSession.sharedInstance().requestRecordPermission { allowed in
          continuation.resume(returning: allowed)
        }
      }
    }

    guard granted else {
      throw WakePhraseError.microphoneDenied
    }
  }

  private func startRecording() throws -> URL {
    let session = AVAudioSession.sharedInstance()
    try session.setCategory(.playAndRecord, mode: .spokenAudio, options: [.allowBluetoothHFP, .duckOthers])
    try session.setActive(true)
    try selectPreferredInput(in: session)

    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent("itadaki-trigger-\(UUID().uuidString)")
      .appendingPathExtension("m4a")

    let settings: [String: Any] = [
      AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
      AVSampleRateKey: 16_000,
      AVNumberOfChannelsKey: 1,
      AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue,
    ]

    let recorder = try AVAudioRecorder(url: url, settings: settings)
    recorder.isMeteringEnabled = true
    recorder.prepareToRecord()
    recorder.record(forDuration: 2.6)
    self.recorder = recorder
    isRecording = true
    statusText = "Listening for itadakimasu..."
    return url
  }

  private func stopRecording() {
    recorder?.stop()
    recorder = nil
    isRecording = false
    try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
  }

  private func selectPreferredInput(in session: AVAudioSession) throws {
    let inputs = session.availableInputs ?? []
    let rayBanInput = inputs.first { input in
      input.portType == .bluetoothHFP && input.portName.localizedCaseInsensitiveContains("ray")
    }
    let bluetoothInput = inputs.first { $0.portType == .bluetoothHFP }
    let preferredInput = rayBanInput ?? bluetoothInput

    if let preferredInput {
      try session.setPreferredInput(preferredInput)
      inputLabel = "Mic input: \(preferredInput.portName)."
      return
    }

    inputLabel = "Mic input: iPhone foreground mic."
  }

  private func transcribe(audioURL: URL) async throws -> Bool {
    isTranscribing = true
    statusText = "Checking phrase with xAI STT..."
    defer { isTranscribing = false }

    let response: WakePhraseResponse = try await postAudio(audioURL)
    lastTranscript = response.text

    if response.triggered {
      statusText = "Trigger heard: \(response.text)"
      return true
    }

    statusText = response.text.isEmpty ? "No trigger heard." : "Heard: \(response.text)"
    return false
  }

  private func postAudio(_ audioURL: URL) async throws -> WakePhraseResponse {
    let boundary = "itadaki-\(UUID().uuidString)"
    var request = URLRequest(url: URL(string: "/api/transcribe", relativeTo: baseURL)!.absoluteURL)
    request.httpMethod = "POST"
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    var body = Data()
    body.appendMultipartField(name: "language", value: "ja", boundary: boundary)
    body.appendMultipartFile(
      name: "file",
      filename: "itadaki-trigger.m4a",
      mimeType: "audio/mp4",
      data: try Data(contentsOf: audioURL),
      boundary: boundary
    )
    body.appendString("--\(boundary)--\r\n")

    let (data, response) = try await URLSession.shared.upload(for: request, from: body)
    guard let httpResponse = response as? HTTPURLResponse else {
      throw WakePhraseError.badResponse
    }

    let payload = try JSONDecoder().decode(WakePhraseResponse.self, from: data)
    guard (200...299).contains(httpResponse.statusCode) else {
      throw WakePhraseError.server(payload.error ?? "Transcription server returned \(httpResponse.statusCode).")
    }
    return payload
  }

  private func showError(_ message: String) {
    errorMessage = message
    statusText = message
    showError = true
  }
}

enum WakePhraseError: LocalizedError {
  case microphoneDenied
  case badResponse
  case server(String)

  var errorDescription: String? {
    switch self {
    case .microphoneDenied:
      return "Microphone permission was denied."
    case .badResponse:
      return "The transcription server returned a bad response."
    case .server(let message):
      return message
    }
  }
}

private extension Data {
  mutating func appendString(_ string: String) {
    append(Data(string.utf8))
  }

  mutating func appendMultipartField(name: String, value: String, boundary: String) {
    appendString("--\(boundary)\r\n")
    appendString("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n")
    appendString("\(value)\r\n")
  }

  mutating func appendMultipartFile(
    name: String,
    filename: String,
    mimeType: String,
    data: Data,
    boundary: String
  ) {
    appendString("--\(boundary)\r\n")
    appendString("Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(filename)\"\r\n")
    appendString("Content-Type: \(mimeType)\r\n\r\n")
    append(data)
    appendString("\r\n")
  }
}
