export const submissionLinks = [
  {
    label: "Live demo",
    href: "https://itadaki-health.vercel.app/",
  },
  {
    label: "Meta glasses HUD",
    href: "https://itadaki-health.vercel.app/glasses/index.html",
  },
  {
    label: "Recently logged",
    href: "https://itadaki-health.vercel.app/logs",
  },
  {
    label: "Architecture",
    href: "https://itadaki-health.vercel.app/architecture",
  },
  {
    label: "Presenter notes",
    href: "https://itadaki-health.vercel.app/demo-script",
  },
  {
    label: "GitHub repo",
    href: "https://github.com/CarlKho-Minerva/itadaki-health",
  },
];

export const projectName = "Itadaki Health";

export const elevatorPitch =
  "Hands-free meal logging for Meta Ray-Bans: say itadakimasu, capture food, hear calories, and sync FHIR-ready trends.";

export const builtWith = [
  "Next.js",
  "React",
  "TypeScript",
  "Framer Motion",
  "Vercel",
  "xAI Grok vision",
  "xAI Speech-to-Text",
  "xAI Text-to-Speech",
  "Meta Wearables Device Access Toolkit",
  "Meta Ray-Ban Display Web Apps",
  "SwiftUI",
  "AVFoundation",
  "FHIR R4",
  "Inngest",
  "JSONL",
  "CSV",
  "Health Passport markdown",
];

export const pubmedSources = [
  {
    label: "Electronic dietary self-monitoring",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6647027/",
  },
  {
    label: "Image-based dietary assessment",
    href: "https://pubmed.ncbi.nlm.nih.gov/27938425/",
  },
  {
    label: "Mindful eating intervention review",
    href: "https://pubmed.ncbi.nlm.nih.gov/32551798/",
  },
  {
    label: "Image-based dietary assessment validity",
    href: "https://pubmed.ncbi.nlm.nih.gov/32839035/",
  },
];

export const demoStats = [
  "3-second wearable calorie pulse after a meal log lands",
  "1.8-second polling loop from glasses HUD to Vercel logs",
  "5-meal trend memory for Michelle's FHIR-friendly risk layer",
  "600x600 static Meta Display Web App bundle",
  "FHIR R4 Observation Bundle for meal nutrients",
  "FHIR R4 CarePlan shape for trend coaching",
  "CSV, JSONL, and markdown export paths",
  "xAI TTS endpoint returns a short MP3 confirmation",
];

export const cutIfSlow = [
  "Skip live STT and tap the iOS capture button while saying the phrase out loud.",
  "Use one real Ray-Ban photo, then switch to the latest logged card if Grok stalls.",
  "Keep the glasses HUD open before logging; tap once to arm audio playback.",
  "If the HUD does not pulse, press ArrowRight for the demo pulse and explain the polling path.",
  "Open /logs to prove the card exists, then /architecture to show the data path.",
  "Do not wait for live HealthEx or real PHI import. Show the mock consent import and FHIR export.",
];

export const demoChecklist = [
  "Open the iOS DAT app and confirm the Ray-Bans are connected.",
  "Open https://itadaki-health.vercel.app/glasses/index.html in the Meta AI Web App.",
  "Tap the blank glasses screen once to arm audio.",
  "Aim at nearby food, say itadakimasu, then capture or use the manual capture button.",
  "Confirm the photo, tap Analyze and log, and let the glasses pulse.",
  "Open /logs and expand the latest card.",
  "Open /architecture and point to the latest logs plus Health Passport export.",
  "End on the patient story: awareness now, better care record later.",
];

export const mediaShotList = [
  "Ray-Bans next to the food with the iOS capture app open",
  "Photo confirmation screen after capture",
  "Glasses HUD showing Calories plus macros",
  "Recently logged phone-style cards",
  "Architecture page with live log strip and Health Passport export",
  "Optional 45-second video: trigger, capture, pulse, log card, architecture",
];

export const projectStoryMarkdown = `## Inspiration

Cal AI proved that people understand photo-based food logging. The missing piece for wearables is intent. Smart glasses can see a lot, but food logging should not become ambient surveillance.

Itadaki Health uses a small ritual as the consent moment. The user looks at food and says "itadakimasu", then the app captures one meal photo, analyzes it, logs it, and gets out of the way.

The human story is simple: a lot of families, including Carl's Filipino community, carry health worries like blood pressure, fatty liver, LDL, diabetes risk, and kidney disease as vague background anxiety. The app does not scold the meal that is already on the table. It creates a better memory for the patient, then lets them share that record later with a dietician or clinician.

## What it does

Itadaki Health is a hands-free meal logging flow for Meta Ray-Bans and iPhone.

1. The user says "itadakimasu" or taps the low-power capture control.
2. The iOS companion app uses Meta's Device Access Toolkit to capture a Ray-Ban camera frame.
3. The app crops toward the food, sends the image to Grok, and receives structured nutrition estimates.
4. The glasses stay blank until the result lands, then pulse calories and macros for about three seconds.
5. xAI Text-to-Speech plays a short reinforcement such as "Logged 705 calories. Five-meal trend saved."
6. The meal appears as a card in the phone web app and exports to CSV, JSONL, FHIR R4, and Health Passport markdown.

## How we built it

The public demo is a Next.js app on Vercel. The wearable HUD is a 600x600 static Meta Display Web App. The real capture path is a SwiftUI iOS companion app using Meta Wearables DAT, because the Web App display path does not provide the camera and microphone capture path we needed.

The backend has three core routes:

- \`/api/analyze-meal\` sends the meal photo and scenario context to xAI for structured food analysis.
- \`/api/speak\` generates a short MP3 confirmation with xAI Text-to-Speech.
- \`/api/log-meal\` saves the log to JSONL and CSV for the demo, then exposes it through \`/logs\`, \`/api/logs\`, and \`/api/health-passport\`.

Michelle worked on the FHIR lane: recent meals become FHIR-friendly Observations and a lightweight CarePlan shape for trend coaching. The project uses synthetic data only.

## Challenges

The main constraint was the Meta split between Web Apps and DAT. Web Apps are excellent for a tiny display HUD, but camera capture needed the native iOS DAT path. That pushed us toward a two-surface architecture: iPhone for capture, glasses for glanceable feedback.

We also had to keep the output calm. A face display is not a dashboard. The final HUD is intentionally blank most of the time, then flashes only the estimate the user needs.

## What we learned

The strongest product is not "can I eat this?" The meal is usually already here. The better product is "help me remember what happened, then show me the pattern later." That framing makes Itadaki Health feel less like food policing and more like patient agency.

## What is next

The next version connects patient-directed health record import, such as a HealthEx-style consent flow, so labs, medications, notes, and meal logs can live in one Health Passport timeline. The long-term direction is local-first and patient-owned: cloud for the hackathon, on-device models when hardware allows.`;
