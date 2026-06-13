# Itadaki DAT iOS Companion

This folder is a separate iOS app scaffold for the Meta Wearables Device Access Toolkit path.

It exists because Meta Ray-Ban Display Web Apps do not expose camera or microphone access. The Web App remains useful as a glanceable display, but real glasses photo capture needs the native iOS DAT SDK.

## What Works In This Branch

- Register the iOS app with Meta AI through DAT.
- Request camera permission through DAT.
- Start a short glasses camera stream.
- Capture a still photo with `stream.capturePhoto(format: .jpeg)`.
- Confirm the photo in the iPhone app.
- Send the photo to `https://itadaki-health.vercel.app/api/analyze-meal`.
- Log the result to `https://itadaki-health.vercel.app/api/log-meal`.
- Render logged meals as cards inside the iOS app.
- Sync those logs to the browser `/logs` page and the glasses Web App `Recent` view.

## Battery Posture

The app does not run a continuous camera stream. The intended MVP behavior is:

1. Open app.
2. Start DAT camera only when eating.
3. Capture one photo.
4. Confirm and analyze.
5. Stop the stream.

This is the practical hackathon path. Passive ambient listening and always-on camera are intentionally not implemented here because the current docs and DAT plugin materials do not show a glasses microphone API, and iOS background audio/wake-word behavior is not a safe same-day dependency.

## Setup On iPhone

1. Open:

```bash
open ios/ItadakiDAT/ItadakiDAT.xcodeproj
```

2. In Xcode, select the `ItadakiDAT` scheme.
3. Select your connected iPhone.
4. In Signing & Capabilities, set your Apple developer team if Xcode asks.
5. In the Meta AI app, enable Developer Mode for your glasses.
6. Run the app.
7. Tap `Connect Meta glasses`.
8. Approve the app in Meta AI.
9. Return to Itadaki.
10. Tap the floating plus button to start camera.
11. Tap the camera button to capture.
12. Confirm `Analyze and log`.

## DAT Notes Used

- `MWDATCore`: registration, permission, device session lifecycle.
- `MWDATCamera`: low-resolution camera stream and JPEG photo capture.
- `MWDATMockDevice`: simulator/dev testing without real hardware.
- `MWDATDisplay`: later path for native display cards, if needed.

## Next Step After The Hackathon

- Add an explicit hand/EMG gesture trigger if DAT exposes the event for your device.
- Use iPhone speech recognition or xAI STT only as foreground opt-in capture, not silent background listening.
- Add FHIR mapping after the meal log schema stabilizes.
