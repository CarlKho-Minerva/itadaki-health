# Itadaki Health Submission Packet

## General Info

**Project name:** Itadaki Health

**Elevator pitch:** Cal AI for Meta Ray-Bans: one intentional meal frame, instant calories and voice, FHIR-ready history.

## Try It Out

- Live demo: https://itadaki-health.vercel.app/
- Meta glasses HUD: https://itadaki-health.vercel.app/glasses/index.html
- Recently logged: https://itadaki-health.vercel.app/logs
- Architecture: https://itadaki-health.vercel.app/architecture
- Presenter notes: https://itadaki-health.vercel.app/demo-script
- Submission helper: https://itadaki-health.vercel.app/submission
- GitHub repo: https://github.com/CarlKho-Minerva/itadaki-health

## About The Project

### Inspiration

Cal AI proved that people understand photo-based food logging. The missing piece for wearables is intent. Smart glasses can see a lot, but food logging should not become ambient surveillance.

Itadaki Health uses a small ritual as the consent moment. The user looks at food and says "itadakimasu", then the app captures one meal photo, analyzes it, logs it, and gets out of the way.

The human story is simple: a lot of families, including Carl's Filipino community, carry health worries like blood pressure, fatty liver, LDL, diabetes risk, and kidney disease as vague background anxiety. The app does not scold the meal that is already on the table. It creates a better memory for the patient, then lets them share that record later with a dietician or clinician.

### What It Does

Itadaki Health is a hands-free meal logging flow for Meta Ray-Bans and iPhone.

1. The user says "itadakimasu" or taps the low-power capture control.
2. The iOS companion app uses Meta's Device Access Toolkit to capture a Ray-Ban camera frame.
3. The app crops toward the food, sends the image to Grok, and receives structured nutrition estimates.
4. The glasses stay blank until the result lands, then pulse calories and macros for about three seconds.
5. xAI Text-to-Speech plays a short trend line such as "Your recent meals look steady so far."
6. The meal appears as a card in the phone web app and exports to CSV, JSONL, FHIR R4, and Health Passport markdown.

The punchline: Cal AI made the market obvious. Itadaki makes the same habit wearable, consented, and useful for care later.

### How We Built It

The public demo is a Next.js app on Vercel. The wearable HUD is a 600x600 static Meta Display Web App. The real capture path is a SwiftUI iOS companion app using Meta Wearables DAT, because the Web App display path does not provide the camera and microphone capture path we needed.

The backend has three core routes:

- `/api/analyze-meal` sends the meal photo and scenario context to xAI for structured food analysis.
- `/api/speak` generates a short MP3 confirmation with xAI Text-to-Speech.
- `/api/log-meal` saves the log to JSONL and CSV for the demo, then exposes it through `/logs`, `/api/logs`, and `/api/health-passport`.

Michelle worked on the FHIR lane: recent meals become FHIR-friendly Observations and a lightweight CarePlan shape for trend coaching. The project uses synthetic data only.

### Challenges

The main constraint was the Meta split between Web Apps and DAT. Web Apps are excellent for a tiny display HUD, but camera capture needed the native iOS DAT path. That pushed us toward a two-surface architecture: iPhone for capture, glasses for glanceable feedback.

We also had to keep the output calm. A face display is not a dashboard. The final HUD is intentionally blank most of the time, then flashes only the estimate the user needs.

### What We Learned

The strongest product is not "can I eat this?" The meal is usually already here. The better product is "help me remember what happened, then show me the pattern later." That framing makes Itadaki Health feel less like food policing and more like patient agency.

### What Is Next

The next version connects patient-directed health record import, such as a HealthEx-style consent flow, so labs, medications, notes, and meal logs can live in one Health Passport timeline. The long-term direction is local-first and patient-owned: cloud for the hackathon, on-device models when hardware allows.

## Built With

Next.js, React, TypeScript, Framer Motion, Vercel, xAI Grok vision, xAI Speech-to-Text, xAI Text-to-Speech, Meta Wearables Device Access Toolkit, Meta Ray-Ban Display Web Apps, SwiftUI, AVFoundation, FHIR R4, Inngest, JSONL, CSV, Health Passport markdown.

## Best Use Of Grok Voice

xAI STT catches the intentional phrase in the companion app. Grok analyzes the meal. xAI TTS returns one short MP3 while the glasses flash the calorie result. The voice output is intentionally short because the best wearable intervention should not hijack the user's face.

## Statistics

- 3-second wearable calorie pulse after a meal log lands.
- 1.8-second polling loop from glasses HUD to Vercel logs.
- 5-meal trend memory for Michelle's FHIR-friendly risk layer.
- 600x600 static Meta Display Web App bundle.
- FHIR R4 Observation Bundle for meal nutrients.
- FHIR R4 CarePlan shape for trend coaching.
- CSV, JSONL, and markdown export paths.
- xAI TTS endpoint returns a short trend-aware MP3.

## PubMed / Research Citations

- Electronic dietary self-monitoring: https://pmc.ncbi.nlm.nih.gov/articles/PMC6647027/
- Image-based dietary assessment: https://pubmed.ncbi.nlm.nih.gov/27938425/
- Mindful eating intervention review: https://pubmed.ncbi.nlm.nih.gov/32551798/
- Image-based dietary assessment validity: https://pubmed.ncbi.nlm.nih.gov/32839035/

## User Flow

1. Open the iOS DAT app and confirm the Ray-Bans are connected.
2. Open https://itadaki-health.vercel.app/glasses/index.html in the Meta AI Web App.
3. Tap the blank glasses screen once to arm audio.
4. Aim at nearby food, say itadakimasu, then capture or use the manual capture button.
5. Confirm the photo, tap Analyze and log, and let the glasses pulse.
6. Open /logs and expand the latest card.
7. Open /architecture and point to the latest logs plus Health Passport export.
8. End on the patient story: awareness now, better care record later.

## If xAI Is Slow

- Skip live STT and tap the iOS capture button while saying the phrase out loud.
- Use one real Ray-Ban photo, then switch to the latest logged card if Grok stalls.
- Keep the glasses HUD open before logging; tap once to arm audio playback.
- If the HUD does not pulse, press ArrowRight for the demo pulse and explain the polling path.
- Open /logs to prove the card exists, then /architecture to show the data path.
- Do not wait for live HealthEx or real PHI import. Show the mock consent import and FHIR export.

## Project Media

- Ray-Bans next to the food with the iOS capture app open.
- Photo confirmation screen after capture.
- Glasses HUD showing Calories plus macros.
- Recently logged phone-style cards.
- Architecture page with live log strip and Health Passport export.
- Optional 45-second video: trigger, capture, pulse, log card, architecture.

## Three-Minute Demo

0:00-0:20: "Cal AI proved people will photograph food. We built the glasses version without making every plate feel watched."

0:20-0:45: "The product hinge is intent. Itadakimasu is the switch: one meal frame, then the stream stops."

0:45-1:10: "Watch the actual path: DAT captures from the glasses, crops toward the food, and sends the image to Grok for structured calories and macros."

1:10-1:35: "The glasses are not a dashboard. They stay blank, flash calories and macros for three seconds, speak once, then disappear."

1:35-2:05: "The meal card is the receipt. It keeps the photo, the uncertainty, and the nutrition estimate so the user has a real memory later."

2:05-2:30: "The Health Passport angle is what happens after repetition. Michelle maps the last five meals into FHIR-friendly trend context."

2:30-2:50: "For the judges: Meta gets real DAT capture and display, xAI gets vision plus voice, Vercel runs the live app, and healthcare gets exportable records."

2:50-3:00: "This is not food policing. It is awareness now and a better record later."
