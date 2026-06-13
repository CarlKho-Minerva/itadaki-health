import MWDATCore
import SwiftUI

struct ItadakiCaptureView: View {
  let wearables: WearablesInterface
  var wearablesViewModel: WearablesViewModel

  @State private var streamViewModel: StreamSessionViewModel
  @State private var mealLogViewModel = ItadakiMealLogViewModel()
  @State private var wakePhraseViewModel = WakePhraseViewModel()
  @State private var pendingPhoto: UIImage?
  @State private var showConfirmPhoto = false

  init(wearables: WearablesInterface, wearablesVM: WearablesViewModel) {
    self.wearables = wearables
    self.wearablesViewModel = wearablesVM
    self._streamViewModel = State(wrappedValue: StreamSessionViewModel(wearables: wearables))
  }

  var body: some View {
    NavigationStack {
      ZStack(alignment: .bottomTrailing) {
        ScrollView {
          VStack(alignment: .leading, spacing: 24) {
            header
            triggerPanel
            capturePanel
            summaryRow
            awarenessCard
            recentlyLogged
          }
          .padding(24)
          .padding(.bottom, 96)
        }
        .background(Color(red: 0.985, green: 0.985, blue: 0.965))

        captureButton
          .padding(24)
      }
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .topBarTrailing) {
          Button("Refresh") {
            Task { await mealLogViewModel.refreshLogs() }
          }
        }
      }
      .task {
        await mealLogViewModel.refreshLogs()
      }
      .onChange(of: streamViewModel.showPhotoPreview) { _, isShowing in
        guard isShowing, let photo = streamViewModel.capturedPhoto else { return }
        pendingPhoto = photo
        showConfirmPhoto = true
      }
      .sheet(isPresented: $showConfirmPhoto) {
        if let pendingPhoto {
          ConfirmPhotoView(
            photo: pendingPhoto,
            isAnalyzing: mealLogViewModel.isAnalyzing,
            onCancel: {
              streamViewModel.dismissPhotoPreview()
              self.pendingPhoto = nil
              showConfirmPhoto = false
            },
            onAnalyze: {
              Task {
                await mealLogViewModel.analyzeAndLog(
                  photo: pendingPhoto,
                  transcript: wakePhraseViewModel.bestTranscript
                )
                streamViewModel.dismissPhotoPreview()
                self.pendingPhoto = nil
                showConfirmPhoto = false
                await streamViewModel.stopSession()
              }
            }
          )
        }
      }
      .alert("Itadaki", isPresented: $mealLogViewModel.showError) {
        Button("OK") {}
      } message: {
        Text(mealLogViewModel.errorMessage)
      }
      .alert("Camera issue", isPresented: $streamViewModel.showError) {
        Button("OK") {
          streamViewModel.dismissError()
        }
      } message: {
        Text(streamViewModel.errorMessage)
      }
      .alert("Voice trigger issue", isPresented: $wakePhraseViewModel.showError) {
        Button("OK") {}
      } message: {
        Text(wakePhraseViewModel.errorMessage)
      }
      .alert("Photo capture failed", isPresented: $streamViewModel.showPhotoCaptureError) {
        Button("OK") {
          streamViewModel.dismissPhotoCaptureError()
        }
      } message: {
        Text("Try again after the stream is fully active.")
      }
    }
    .onDisappear {
      streamViewModel.endSession()
    }
  }

  private var triggerPanel: some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack(alignment: .center, spacing: 14) {
        ZStack {
          Circle()
            .fill(Color.black)
            .frame(width: 54, height: 54)
          Image(systemName: wakePhraseViewModel.isRecording ? "waveform" : "mic.fill")
            .font(.system(size: 24, weight: .bold))
            .foregroundStyle(.white)
        }

        VStack(alignment: .leading, spacing: 4) {
          Text("Intent trigger")
            .font(.system(size: 22, weight: .heavy))
          Text(wakePhraseViewModel.statusText)
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(.secondary)
            .lineLimit(2)
          Text(wakePhraseViewModel.inputLabel)
            .font(.system(size: 12, weight: .bold))
            .foregroundStyle(.secondary)
            .lineLimit(1)
        }

        Spacer()
      }

      Text("Say itadakimasu, then capture one meal frame. If the Ray-Bans are connected as a Bluetooth headset, the recorder prefers that mic; otherwise it uses the iPhone mic.")
        .font(.system(size: 14, weight: .medium))
        .foregroundStyle(.secondary)
        .fixedSize(horizontal: false, vertical: true)

      HStack(spacing: 10) {
        Button {
          Task {
            await handleVoiceTrigger()
          }
        } label: {
          Label(
            wakePhraseViewModel.isRecording ? "Listening..." : "Listen",
            systemImage: wakePhraseViewModel.isRecording ? "waveform" : "mic"
          )
          .font(.system(size: 16, weight: .heavy))
          .frame(maxWidth: .infinity)
          .padding(.vertical, 14)
        }
        .buttonStyle(.borderedProminent)
        .tint(Color.black)
        .disabled(wakePhraseViewModel.isRecording || wakePhraseViewModel.isTranscribing || mealLogViewModel.isAnalyzing)

        Button {
          Task {
            await armOrCaptureCamera()
          }
        } label: {
          Label(streamViewModel.isStreaming ? "Capture" : "Arm", systemImage: streamViewModel.isStreaming ? "camera" : "eyeglasses")
            .font(.system(size: 16, weight: .heavy))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
        }
        .buttonStyle(.bordered)
        .disabled(mealLogViewModel.isAnalyzing)
      }
    }
    .padding(18)
    .background(Color.white)
    .clipShape(RoundedRectangle(cornerRadius: 24))
    .shadow(color: .black.opacity(0.06), radius: 18, y: 8)
  }

  private var header: some View {
    HStack(alignment: .center) {
      HStack(spacing: 10) {
        Circle()
          .fill(Color.black)
          .frame(width: 38, height: 38)
          .overlay(Circle().fill(Color.white).frame(width: 8, height: 8))
        Text("Itadaki")
          .font(.system(size: 36, weight: .heavy))
      }

      Spacer()

      Text("\(mealLogViewModel.logs.count)")
        .font(.system(size: 22, weight: .heavy))
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .background(.white)
        .clipShape(Capsule())
        .shadow(color: .black.opacity(0.06), radius: 18, y: 8)
    }
  }

  private var capturePanel: some View {
    VStack(alignment: .leading, spacing: 18) {
      Text("Glasses capture")
        .font(.system(size: 28, weight: .heavy))

      ZStack {
        RoundedRectangle(cornerRadius: 28)
          .fill(Color.black)
          .frame(height: 360)

        if let frame = streamViewModel.currentVideoFrame, streamViewModel.hasReceivedFirstFrame {
          Image(uiImage: frame)
            .resizable()
            .scaledToFill()
            .frame(height: 360)
            .clipShape(RoundedRectangle(cornerRadius: 28))
        } else {
          VStack(spacing: 12) {
            Image(systemName: streamViewModel.isStreaming ? "camera.metering.center.weighted" : "eyeglasses")
              .font(.system(size: 42, weight: .bold))
            Text(streamViewModel.isStreaming ? "Waiting for frames" : "Start DAT camera")
              .font(.system(size: 22, weight: .bold))
            Text("Ray-Ban video stream, photo capture, crop, analyze, then stop.")
              .font(.system(size: 15, weight: .medium))
              .foregroundStyle(.white.opacity(0.7))
          }
          .foregroundStyle(.white)
        }
      }

      HStack {
        statusPill(streamLabel)
        Spacer()
        if streamViewModel.isStreaming {
          Button("Stop") {
            Task { await streamViewModel.stopSession() }
          }
          .buttonStyle(.bordered)
        }
      }

      Text(mealLogViewModel.statusText)
        .font(.system(size: 15, weight: .semibold))
        .foregroundStyle(.secondary)
    }
  }

  private var streamLabel: String {
    switch streamViewModel.streamingStatus {
    case .streaming:
      return "Streaming"
    case .waiting:
      return "Connecting"
    case .stopped:
      return "Idle"
    }
  }

  private func statusPill(_ text: String) -> some View {
    Text(text)
      .font(.system(size: 14, weight: .heavy))
      .padding(.horizontal, 12)
      .padding(.vertical, 8)
      .background(streamViewModel.streamingStatus == .streaming ? Color.green.opacity(0.18) : Color.black.opacity(0.06))
      .clipShape(Capsule())
  }

  private var summaryRow: some View {
    HStack(spacing: 14) {
      SummaryCard(
        title: "Calories",
        value: "\(Int(mealLogViewModel.logs.reduce(0) { $0 + $1.calories }))",
        caption: "Logged today"
      )
      SummaryCard(
        title: "Meals",
        value: "\(mealLogViewModel.logs.count)",
        caption: "Synced"
      )
    }
  }

  private var awarenessCard: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("Health Passport context")
        .font(.system(size: 15, weight: .heavy))
        .foregroundStyle(.secondary)
      Text("This is not food policing.")
        .font(.system(size: 24, weight: .heavy))
      Text("The meal is already here. Itadaki turns it into health memory: calories now, lab context and FHIR records next.")
        .font(.system(size: 16, weight: .medium))
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(20)
    .background(Color.white)
    .clipShape(RoundedRectangle(cornerRadius: 24))
    .shadow(color: .black.opacity(0.06), radius: 18, y: 8)
  }

  private var recentlyLogged: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text("Recently logged")
        .font(.system(size: 30, weight: .heavy))

      if mealLogViewModel.logs.isEmpty {
        Text("Capture a meal from the glasses, confirm it, and it appears here and at /logs.")
          .font(.system(size: 16, weight: .medium))
          .foregroundStyle(.secondary)
          .padding(20)
          .frame(maxWidth: .infinity, alignment: .leading)
          .background(Color.white)
          .clipShape(RoundedRectangle(cornerRadius: 22))
      } else {
        ForEach(mealLogViewModel.logs) { log in
          ItadakiLogCard(log: log)
        }
      }
    }
  }

  private var captureButton: some View {
    Button {
      Task {
        await armOrCaptureCamera()
      }
    } label: {
      Image(systemName: streamViewModel.isStreaming ? "camera.fill" : "plus")
        .font(.system(size: 34, weight: .bold))
        .foregroundStyle(.white)
        .frame(width: 82, height: 82)
        .background(Color(red: 0.09, green: 0.075, blue: 0.12))
        .clipShape(Circle())
        .shadow(color: .black.opacity(0.2), radius: 22, y: 12)
    }
    .disabled(mealLogViewModel.isAnalyzing)
  }

  private func handleVoiceTrigger() async {
    let didHearTrigger = await wakePhraseViewModel.recordAndTranscribe()
    guard didHearTrigger else { return }
    await armOrCaptureCamera(autoCapture: true)
  }

  private func armOrCaptureCamera(autoCapture: Bool = false) async {
    if streamViewModel.isStreaming {
      if autoCapture {
        await streamViewModel.captureWhenReady()
      } else {
        streamViewModel.capturePhoto()
      }
      return
    }

    await streamViewModel.handleStartStreaming()
    if autoCapture {
      await streamViewModel.captureWhenReady()
    }
  }
}

struct SummaryCard: View {
  let title: String
  let value: String
  let caption: String

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      Text(title)
        .font(.system(size: 15, weight: .bold))
        .foregroundStyle(.secondary)
      Text(value)
        .font(.system(size: 34, weight: .heavy))
      Text(caption)
        .font(.system(size: 14, weight: .semibold))
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(20)
    .background(Color.white)
    .clipShape(RoundedRectangle(cornerRadius: 24))
    .shadow(color: .black.opacity(0.06), radius: 18, y: 8)
  }
}

struct ItadakiLogCard: View {
  let log: MealLogCard

  var body: some View {
    HStack(spacing: 16) {
      thumbnail

      VStack(alignment: .leading, spacing: 10) {
        HStack(alignment: .firstTextBaseline) {
          Text(log.mealName)
            .font(.system(size: 18, weight: .heavy))
            .lineLimit(1)
          Spacer()
          Text(log.timeLabel)
            .font(.system(size: 12, weight: .bold))
            .foregroundStyle(.secondary)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(.white)
            .clipShape(Capsule())
        }

        Text("\(Int(log.calories)) calories")
          .font(.system(size: 24, weight: .heavy))

        HStack(spacing: 16) {
          Text("\(Int(log.protein ?? 0))g")
          Text("\(Int(log.carbs ?? 0))g")
          Text("\(Int(log.fat ?? 0))g")
        }
        .font(.system(size: 15, weight: .bold))
        .foregroundStyle(.secondary)
      }
    }
    .padding(14)
    .background(Color(red: 0.945, green: 0.945, blue: 0.965))
    .clipShape(RoundedRectangle(cornerRadius: 24))
  }

  @ViewBuilder
  private var thumbnail: some View {
    if let image = imageFromDataURL(log.thumbnailDataUrl) {
      Image(uiImage: image)
        .resizable()
        .scaledToFill()
        .frame(width: 108, height: 108)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    } else {
      RoundedRectangle(cornerRadius: 20)
        .fill(Color.black.opacity(0.06))
        .frame(width: 108, height: 108)
        .overlay(
          Image(systemName: "fork.knife")
            .font(.system(size: 30, weight: .bold))
        )
    }
  }

  private func imageFromDataURL(_ dataURL: String?) -> UIImage? {
    guard
      let dataURL,
      let comma = dataURL.firstIndex(of: ",")
    else {
      return nil
    }

    let base64 = String(dataURL[dataURL.index(after: comma)...])
    guard let data = Data(base64Encoded: base64) else {
      return nil
    }

    return UIImage(data: data)
  }
}

struct ConfirmPhotoView: View {
  let photo: UIImage
  let isAnalyzing: Bool
  let onCancel: () -> Void
  let onAnalyze: () -> Void

  var body: some View {
    VStack(spacing: 18) {
      Capsule()
        .fill(Color.black.opacity(0.18))
        .frame(width: 48, height: 5)
        .padding(.top, 10)

      Text("Log this meal?")
        .font(.system(size: 28, weight: .heavy))

      Image(uiImage: photo)
        .resizable()
        .scaledToFill()
        .frame(height: 340)
        .clipShape(RoundedRectangle(cornerRadius: 28))

      HStack(spacing: 12) {
        Button("Retake") {
          onCancel()
        }
        .buttonStyle(.bordered)
        .controlSize(.large)

        Button(isAnalyzing ? "Analyzing..." : "Analyze and log") {
          onAnalyze()
        }
        .buttonStyle(.borderedProminent)
        .controlSize(.large)
        .disabled(isAnalyzing)
      }
    }
    .padding(24)
  }
}
