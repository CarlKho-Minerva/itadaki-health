# Itadaki Health

Wearable food logging that starts with consent, then returns one number: calories.

Built during the Autonomous Healthcare Hackathon on June 13, 2026.

Live:

- Judge demo: https://itadaki-health.vercel.app/
- Meta Display Web App: https://itadaki-health.vercel.app/glasses/index.html
- Public repo: https://github.com/CarlKho-Minerva/itadaki-health

## Team

- Carl Vincent Kho
- Michelle (`hhizzuk`) — FHIR / Fast Healthcare Interoperability Resources lane

## What It Does

Itadaki Health turns a meal gesture into an explicit consent trigger for food logging on Meta Ray-Ban Display. The MVP flow is intentionally small:

```text
intent gesture -> cropped meal image -> calorie estimate -> Health Passport memory
```

The demo has two surfaces:

- Judge console: Next.js, Framer Motion, xAI STT proxy, image analysis route, and CSV download.
- Glasses app: static `600x600` HTML/CSS/JS at `/glasses/index.html`, built for Meta Display Web Apps.
- iOS DAT companion: `ios/ItadakiDAT`, a native SwiftUI app scaffold for real glasses photo capture through Meta's Device Access Toolkit.

## Human Story

This is not a "you should not eat that" app. Most people have already bought the meal by the time a camera sees it.

The better job is awareness. In Carl's family and Filipino community context, blood pressure, fatty liver, LDL, diabetes risk, and kidney worries often sit in the background as vague anxiety. Health Passport makes the record portable. Itadaki makes the meal part of that record, so the next check-in can connect what someone eats with the labs and notes they already carry.

The demo line:

```text
Meta can see the meal. Health Passport knows the context. Itadaki asks for intent, logs the moment, and gives one useful awareness card.
```

## Current MVP Pipeline

1. On web, use the browser companion to test the pipeline.
2. On glasses Web Apps, use `Recent` to sync the latest server log or `Demo` as fallback.
3. On iOS DAT, connect glasses, start a short camera session, capture, confirm, analyze, and log.
4. The app center-crops and resizes the meal image before sending it to xAI.
5. The server calls xAI from `/api/analyze-meal`; the glasses display only:

```text
Calories
705
```

6. Tap `Log`; `/api/log-meal` creates a CSV row and a JSONL card record.

## Put It On Meta Ray-Ban Display

The official Wearables Developer Center pages require login, but the public Meta toolkit states the usable constraints: `600x600px`, D-pad/arrow navigation, dark background, high contrast, `.focusable` controls, browser testing with arrow keys, and public HTTPS deployment.

Manual setup:

1. Open the Meta AI app on your phone.
2. Go to `Devices`.
3. Open `Display Glasses settings`.
4. Go to `App connections`.
5. Open `Web apps`.
6. Tap `Add a web app`.
7. Name: `Itadaki Calories`.
8. URL: `https://itadaki-health.vercel.app/glasses/index.html`.
9. On the glasses, use the Neural Band/D-pad gestures. Arrow keys simulate this in browser.

Browser test:

```bash
npm run dev
open http://localhost:3000/glasses/index.html
```

Use:

- Arrow left/right: move focus.
- Enter: select.
- Escape: back to listen screen.

## iOS DAT Companion

The native iOS scaffold lives at:

```bash
open ios/ItadakiDAT/ItadakiDAT.xcodeproj
```

It uses the public DAT CameraAccess sample as the SDK scaffold, then adds the Itadaki ingestion flow:

```text
connect Meta AI -> start DAT camera -> capture photo -> confirm -> Vercel xAI analysis -> meal card
```

The current Web App docs say MRBD Web Apps do not support camera or microphone, so this iOS path is the real capture path. The app keeps the stream off until capture, then stops it after logging for battery.

### Low-Power Gesture Strategy

For the hackathon demo, the low-power manual trigger is:

```text
meal intent gesture / double tap -> foreground iOS DAT capture -> immediate stream stop after photo
```

Do not pitch continuous camera or passive always-on audio as built today. The next implementation target is a DAT-supported tap/captouch/EMG gesture if available on the device. If that hook is unavailable in the current SDK, keep the iPhone foreground capture button and narrate the gesture as the product interaction.

## Why This Is Not A Cal AI Clone

Cal AI proved photo-based food logging can become a large consumer behavior loop. Itadaki Health borrows that familiar behavior, then adds:

- Intent before capture.
- A wearable glanceable UI.
- A tiny calorie-only result for Meta Ray-Ban Display.
- A CSV trail the user can inspect or export.
- A later FHIR path through Michelle's branch without using PHI during the hackathon.

## xAI Speech Trigger

`/api/transcribe` is the only place that talks to xAI Speech-to-Text. The browser and glasses app send an audio blob to the server, and the server adds:

- `format=true`
- `language=ja` by default
- keyterms for `itadakimasu`, `いただきます`, `jal meokgetseumnida`, and `잘 먹겠습니다`
- `file` as the last multipart field

The MVP does not assume a system-level "Hey Meta" wake hook inside Web Apps. It uses an app-level `Listen` button and a `Trigger` fallback for the live demo.

## Evidence Base

- Dietary self-monitoring: https://pmc.ncbi.nlm.nih.gov/articles/PMC6647027/
- Dietary self-monitoring systematic review: https://pmc.ncbi.nlm.nih.gov/articles/PMC8928602/
- Image-based dietary assessment: https://pubmed.ncbi.nlm.nih.gov/27938425/
- Mindful eating systematic review: https://pubmed.ncbi.nlm.nih.gov/32551798/
- Cal AI App Store behavior loop: https://apps.apple.com/us/app/cal-ai-calorie-tracker/id6480417616
- Cal AI acquisition/business case: https://www.businessinsider.com/cal-ai-myfitnesspal-calorie-tracker-teen-founder-flow-zack-yadegari-2026-6
- Meta Wearables Web App toolkit: https://github.com/facebookincubator/meta-wearables-webapp
- xAI chat completions: https://docs.x.ai/developers/rest-api-reference/inference/chat
- Inngest Next.js quick start: https://www.inngest.com/docs/getting-started/nextjs-quick-start

## Prior Art Disclosure

This repo was created fresh for the June 13 hackathon. Prior Carl projects such as Health Passport, Somach Care Router, and Soma HUD are disclosed as background and narrative context. Source code from those repos is not copied here.

## Safety Note

This project uses synthetic health data. It does not diagnose, prescribe, or provide medical advice. It produces coaching context and clinician questions for a user to discuss with a professional.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- Judge demo: `http://localhost:3000`
- Glasses app: `http://localhost:3000/glasses/index.html`
- Inngest route: `http://localhost:3000/api/inngest`

Without `XAI_API_KEY`, the app uses deterministic demo analysis. With `XAI_API_KEY`, `/api/analyze-meal` calls xAI through the OpenAI-compatible client and `/api/transcribe` calls xAI Speech-to-Text.

## API Routes

- `POST /api/transcribe`: multipart audio file -> xAI STT -> `{ text, triggered }`.
- `POST /api/analyze-meal`: image or scenario -> xAI/Grok or fallback -> calorie estimate.
- `POST /api/log-meal`: JSON meal event -> CSV row.
- `GET /api/logs`: recent JSONL meal cards for iOS, `/logs`, and glasses sync.

On Vercel, file writes use serverless `/tmp`, so cross-instance persistence is not guaranteed. The route returns a seeded card when storage is empty so the live demo never blanks. Replace this with Vercel KV, Blob, Firebase, or Supabase before treating `/logs` as durable storage.

## Deploy

```bash
vercel
vercel --prod
```

After deploy, add the public HTTPS `/glasses/index.html` URL to the Meta AI app under Display Glasses Web Apps.

## 3-Minute Pitch

- `0:00-0:20` Cal AI proved people will pay to photograph food. Passive glasses need an intent layer.
- `0:20-0:45` The consent moment is a meal gesture, not passive surveillance.
- `0:45-1:25` Demo: look at meal, gesture/button, DAT photo, crop, xAI analysis, calories card.
- `1:25-1:55` Health Passport context: the card turns a meal into a memory connected to labs and risks.
- `1:55-2:20` Business: Cal AI made the habit obvious; Itadaki adds wearability and medical context.
- `2:20-2:50` Architecture: iOS DAT capture, Vercel, Grok, JSONL cards, FHIR-ready next branch.
- `2:50-3:00` Close: this is awareness at the moment behavior happens.

## Judge Questions

- Meta: Can Web Apps access camera in this preview, or should production use DAT for capture and Web Apps only for display?
- xAI: Which Grok vision model/endpoint gives the lowest-latency structured meal analysis?
- Inngest: What is the cleanest way to show event traces live during a 3-minute demo?
- Healthcare judges: Where is the boundary between useful food-context coaching and medical advice?
- Vercel: How should we keep the glasses bundle tiny while sharing backend routes with the main demo?
