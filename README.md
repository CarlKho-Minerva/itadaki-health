# Itadaki Health

Wearable food logging that starts with consent, then returns one number: calories.

Built during the Autonomous Healthcare Hackathon on June 13, 2026.

Live:

- Judge demo: https://itadaki-health.vercel.app/
- Meta Display Web App: https://itadaki-health.vercel.app/glasses/index.html
- Public repo: https://github.com/CarlKho-Minerva/itadaki-health

## Team

- Carl Vincent Kho
- Michelle [last name/email/GitHub TBD]

## What It Does

Itadaki Health turns the meal ritual "itadakimasu" into an explicit consent trigger for food logging on Meta Ray-Ban Display. The MVP flow is intentionally small:

```text
say itadakimasu -> add food image -> estimate calories -> log CSV row
```

The demo has two surfaces:

- Judge console: Next.js, Framer Motion, xAI STT proxy, image analysis route, and CSV download.
- Glasses app: static `600x600` HTML/CSS/JS at `/glasses/index.html`, built for Meta Display Web Apps.

## Current MVP Pipeline

1. Tap `Listen` on the glasses app.
2. Say "itadakimasu" or tap `Trigger` as fallback.
3. Tap `Photo` to open camera/file input if supported, or `Sample` for the hackathon demo.
4. The server calls xAI from `/api/analyze-meal`; the glasses display only:

```text
Calories
705
```

5. Tap `Log`; `/api/log-meal` creates a CSV row.

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

## Why This Is Not A Cal AI Clone

Cal AI proved photo-based food logging can become a large consumer behavior loop. Itadaki Health borrows that familiar behavior, then adds:

- Intent before capture.
- A wearable glanceable UI.
- A tiny calorie-only result for Meta Ray-Ban Display.
- A CSV trail the user can inspect or export.
- A later path into Health Passport context without using PHI during the hackathon.

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

## Deploy

```bash
vercel
vercel --prod
```

After deploy, add the public HTTPS `/glasses/index.html` URL to the Meta AI app under Display Glasses Web Apps.

## 3-Minute Pitch

- `0:00-0:20` Cal AI proved people will pay to photograph food. Passive glasses need an intent layer.
- `0:20-0:45` Itadakimasu is the consent moment.
- `0:45-1:25` Demo the trigger, glasses HUD, meal image, calories number, and CSV row.
- `1:25-1:55` Cite self-monitoring, image-based dietary assessment, and mindful eating research.
- `1:55-2:20` Show the Cal AI business case and the wearable intent wedge.
- `2:20-2:50` Show Vercel, Grok, xAI STT, Meta Web App, and CSV logging.
- `2:50-3:00` Close: this is patient agency at the moment behavior happens.

## Judge Questions

- Meta: Can Web Apps access camera in this preview, or should production use DAT for capture and Web Apps only for display?
- xAI: Which Grok vision model/endpoint gives the lowest-latency structured meal analysis?
- Inngest: What is the cleanest way to show event traces live during a 3-minute demo?
- Healthcare judges: Where is the boundary between useful food-context coaching and medical advice?
- Vercel: How should we keep the glasses bundle tiny while sharing backend routes with the main demo?
