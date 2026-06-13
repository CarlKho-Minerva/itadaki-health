# Itadaki DAT iOS Companion

This folder is a separate iOS app scaffold for the Meta Wearables Device Access Toolkit path.

It exists because Meta Ray-Ban Display Web Apps do not expose camera or microphone access. The Web App remains useful as a glanceable display, but real glasses photo capture needs the native iOS DAT SDK.

## What Works In This Branch

- Register the iOS app with Meta AI through DAT.
- Request camera permission through DAT.
- Start a short glasses camera stream.
- Capture a still photo with `stream.capturePhoto(format: .jpeg)`.
- Center-crop and resize the meal photo before analysis.
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

The demo gesture should be framed as a low-power intent action:

```text
hands/meal gesture or double tap -> foreground DAT capture -> stop stream after one photo
```

If DAT exposes captouch or EMG events on the target device, wire that event to the same capture action. If not, keep the foreground button and narrate the intended gesture interaction during the screen recording.

## Setup On iPhone

### Fast Simulator Check

Run this from the repo root:

```bash
ios/ItadakiDAT/scripts/run_simulator.sh
```

The script builds the app, boots the `iPhone 17 Pro Max` simulator, installs Itadaki, launches it, and saves a screenshot to `/tmp/itadaki-sim.png`.

### Physical iPhone + Ray-Ban Check

1. Connect the iPhone by USB-C.
2. Open the Xcode project:

```bash
open ios/ItadakiDAT/ItadakiDAT.xcodeproj
```

3. Select the `ItadakiDAT` scheme.
4. Select the connected iPhone, not a simulator.
5. Confirm Signing & Capabilities uses team `V9WTTPBFK9`.
6. In the Meta AI app, confirm the glasses are paired and Developer Mode is enabled.
7. Run the app from Xcode.
8. Tap `Connect Meta glasses`.
9. Approve the app in Meta AI, then return to Itadaki.
10. Tap the floating plus button to start a short camera session.
11. Tap the camera button to capture one meal photo.
12. Confirm `Analyze and log`.
13. Check the logged card in the iOS app and the browser page at `/logs`.

### Meta App Credentials

The project compiles with placeholder DAT credentials:

```text
META_APP_ID = 0
CLIENT_TOKEN = ""
```

Before the physical glasses registration can complete, replace those values in the `ItadakiDAT` target Build Settings with the Meta developer app values for this bundle ID:

```text
com.carlkho.itadaki.dat
```

If registration fails or Meta AI refuses the callback, this is the first thing to check.

### Troubleshooting

- If Xcode says the phone is not trusted, unlock the iPhone and accept the trust prompt.
- If signing fails, set Signing & Capabilities to automatic signing and choose team `V9WTTPBFK9`.
- If Meta AI opens but does not approve the app, verify the Meta App ID, client token, URL scheme, bundle ID, and Developer Mode.
- If the camera stream does not start, keep the app in the foreground and reconnect the glasses inside Meta AI.
- If Vercel analysis fails during the demo, the API falls back to deterministic mock meal data so the log flow still works.

## DAT Notes Used

- `MWDATCore`: registration, permission, device session lifecycle.
- `MWDATCamera`: low-resolution camera stream and JPEG photo capture.
- `MWDATMockDevice`: simulator/dev testing without real hardware.
- `MWDATDisplay`: later path for native display cards, if needed.
- Michelle (`hhizzuk`) owns the future FHIR branch. Do not mix real PHI into this demo branch.

## Next Step After The Hackathon

- Add an explicit hand/EMG gesture trigger if DAT exposes the event for your device.
- Use iPhone speech recognition or xAI STT only as foreground opt-in capture, not silent background listening.
- Add FHIR mapping after the meal log schema stabilizes.
