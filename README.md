# Itadaki Health

Wearable food logging that starts with consent, then turns meals into Health Passport context.

Built during the Autonomous Healthcare Hackathon on June 13, 2026.

Live:

- Judge demo: https://itadaki-health.vercel.app/
- Meta Display Web App: https://itadaki-health.vercel.app/glasses/index.html
- Public repo: https://github.com/CarlKho-Minerva/itadaki-health

## Team

- Carl Vincent Kho
- Michelle [last name/email/GitHub TBD]

## What It Does

Itadaki Health turns the meal ritual "itadakimasu" into an explicit consent trigger for food logging on Meta Ray-Ban Display. The glasses can see food all day; the app logs only when the user intentionally begins a meal.

The demo has two surfaces:

- Judge demo: Next.js, Framer Motion, xAI/Grok route, and Inngest trace.
- Glasses app: static `600x600` HTML/CSS/JS at `/glasses/index.html`, built for Meta Display Web Apps.

## Demo Flow

1. User says or taps "Itadakimasu."
2. Glasses show `Intentional log?` with `Analyze`, `Skip`, and `Manual`.
3. The app estimates food and nutrition with uncertainty.
4. Synthetic Health Passport context turns the meal into patient-relevant guidance.
5. Inngest events record `trigger.started`, `meal.analyzed`, `timeline.updated`, and `care_context.generated`.
6. The user gets one clinician question, not a diagnosis.

## Why This Is Not A Cal AI Clone

Cal AI proved photo-based food logging can become a large consumer behavior loop. Itadaki Health borrows that familiar behavior, then adds:

- Intent before capture.
- A wearable glanceable UI.
- Health Passport context.
- Uncertainty ranges.
- One clinician question instead of medical advice.

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

Without `XAI_API_KEY`, the app uses deterministic demo analysis. With `XAI_API_KEY`, `/api/analyze-meal` calls xAI through the OpenAI-compatible client.

## Deploy

```bash
vercel
vercel --prod
```

After deploy, add the public HTTPS `/glasses/index.html` URL to the Meta AI app under Display Glasses Web Apps.

## 3-Minute Pitch

- `0:00-0:20` Cal AI proved people will pay to photograph food. Passive glasses need an intent layer.
- `0:20-0:45` Itadakimasu is the consent moment.
- `0:45-1:25` Demo the trigger, glasses HUD, meal analysis, Health Passport context, and timeline update.
- `1:25-1:55` Cite self-monitoring, image-based dietary assessment, and mindful eating research.
- `1:55-2:20` Show the Cal AI business case and the wearable clinical-context wedge.
- `2:20-2:50` Show Vercel, Grok, Inngest, Meta Web App, and synthetic Health Passport architecture.
- `2:50-3:00` Close: this is patient agency at the moment behavior happens.

## Judge Questions

- Meta: Can Web Apps access camera in this preview, or should production use DAT for capture and Web Apps only for display?
- xAI: Which Grok vision model/endpoint gives the lowest-latency structured meal analysis?
- Inngest: What is the cleanest way to show event traces live during a 3-minute demo?
- Healthcare judges: Where is the boundary between useful food-context coaching and medical advice?
- Vercel: How should we keep the glasses bundle tiny while sharing backend routes with the main demo?
