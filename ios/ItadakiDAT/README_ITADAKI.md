# Itadaki DAT iOS Companion

This folder is a separate iOS app scaffold for the Meta Wearables Device Access Toolkit path.

It exists because Meta Ray-Ban Display Web Apps do not expose camera or microphone access. The Web App remains useful as a glanceable display, but real glasses photo capture needs the native iOS DAT SDK.

## What Works In This Branch

- Register the iOS app with Meta AI through DAT.
- Request camera permission through DAT.
- Record a short foreground wake-phrase clip, preferring Ray-Ban Bluetooth HFP input when iOS exposes it.
- Transcribe `itadakimasu` through the server-side xAI STT proxy.
- Start a short glasses camera stream.
- Wait for the first video frame before auto-capturing.
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

This is the practical hackathon path. Passive ambient listening and always-on camera are intentionally not implemented here because iOS background wake-word behavior is not a safe same-day dependency. For audio, the app uses a foreground `AVAudioSession` with Bluetooth HFP allowed. When Ray-Bans appear as an input, that mic is preferred; otherwise the iPhone mic is used.

The demo gesture should be framed as a low-power intent action:

```text
hands/meal gesture or double tap -> foreground DAT capture -> stop stream after one photo
```

If DAT exposes captouch or EMG events on the target device, wire that event to the same capture action. If not, keep the `Listen` and `Arm` buttons and narrate the intended gesture interaction during the screen recording.

## Setup On iPhone

### Fast Simulator Check

Run this from the repo root:

```bash
ios/ItadakiDAT/scripts/run_simulator.sh
```

The script builds the app, boots the `iPhone 17 Pro Max` simulator, installs Itadaki, launches it, and saves a screenshot to `/tmp/itadaki-sim.png`.

### Physical iPhone + Ray-Ban Check

1. Connect the iPhone by USB-C.
2. Enable Developer Mode on the iPhone:

```text
Settings -> Privacy & Security -> Developer Mode -> On
```

The iPhone usually reboots after this change. Reconnect it after reboot.

3. Confirm Xcode has an Apple account and can create a development profile:

```text
Xcode -> Settings -> Accounts -> add Apple ID
ItadakiDAT target -> Signing & Capabilities -> Automatically manage signing
Team -> 6F3H8KVKNM
```

This Mac currently has a valid Apple Development certificate, but no installed provisioning profiles. If `run_device.sh` prints `No Accounts` or `No profiles`, fix this step first.

4. From the repo root, run:

```bash
ios/ItadakiDAT/scripts/run_device.sh
```

This builds, installs, and launches Itadaki on the connected iPhone. If you prefer the Xcode UI path, open the project:

```bash
open ios/ItadakiDAT/ItadakiDAT.xcodeproj
```

5. Select the `ItadakiDAT` scheme.
6. Select the connected iPhone, not a simulator.
7. Confirm Signing & Capabilities uses team `6F3H8KVKNM`.
8. In the Meta AI app, confirm the glasses are paired and Developer Mode is enabled.
9. Run the app from Xcode.
10. Tap `Connect Meta glasses`.
11. Approve the app in Meta AI, then return to Itadaki.
12. Tap `Listen`, say `itadakimasu`, and confirm the input label says Ray-Ban if the glasses are the active Bluetooth mic.
13. If the phrase is heard, the app starts a short camera session and auto-captures after the first frame. If not, tap `Arm`, then `Capture`.
14. Confirm `Analyze and log`.
15. Check the logged card in the iOS app and the browser page at `/logs`.

Current observed device state:

```text
iPhone 17 Pro Max (Fully Paid NO INSTALLMENTS)
iOS 26.5.1
UDID: 00008150-000275DE0A00C01C
Paired and available to CoreDevice
Physical install currently blocked by Xcode signing: no Apple account/provisioning profile visible to xcodebuild
```

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
- If signing fails, set Signing & Capabilities to automatic signing, choose team `6F3H8KVKNM`, and add `kho@uni.minerva.edu` under Xcode Settings -> Accounts.
- If Meta AI opens but does not approve the app, verify the Meta App ID, client token, URL scheme, bundle ID, and Developer Mode.
- If the camera stream does not start, keep the app in the foreground and reconnect the glasses inside Meta AI.
- If the mic label says iPhone instead of Ray-Ban, confirm the glasses are connected as a Bluetooth headset input in iOS Control Center or Bluetooth settings.
- If `Listen` fails, confirm microphone permission and that Vercel has `XAI_API_KEY` configured.
- If Vercel analysis fails during the demo, the API falls back to deterministic mock meal data so the log flow still works.

## DAT Notes Used

- `MWDATCore`: registration, permission, device session lifecycle.
- `MWDATCamera`: low-resolution camera stream and JPEG photo capture.
- `MWDATMockDevice`: simulator/dev testing without real hardware.
- `MWDATDisplay`: later path for native display cards, if needed.
- Michelle (`hhizzuk`) owns the future FHIR branch. Do not mix real PHI into this demo branch.

## Next Step After The Hackathon

- Add an explicit hand/EMG gesture trigger if DAT exposes the event for your device.
- Use xAI STT only as foreground opt-in capture, not silent background listening.
- Add FHIR mapping after the meal log schema stabilizes.
