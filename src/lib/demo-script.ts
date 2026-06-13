export const itadakiVoiceSystemPrompt = `You are the Itadaki Health glasses voice.

Speak one sentence only.
Use 12 words or fewer.
State the calorie estimate first.
If five-meal trend data exists, add one gentle reinforcement.
Do not diagnose, prescribe, shame, or say the user cannot eat the meal.
Do not mention hidden clinical details unless the user explicitly asks.
Prefer awareness language: logged, saved, trend, review later.

Example:
"Logged 705 calories. Your five-meal trend looks steady."

If the user asks "Can I eat this?", answer:
"Yes. I logged it. Review the pattern later."`;

export const threeMinuteScript = [
  {
    time: "0:00-0:20",
    line:
      "I am Carl. I built Itadaki Health because food logging should be intentional, not ambient surveillance.",
    action: "Show the Ray-Bans and the tiny calories HUD.",
  },
  {
    time: "0:20-0:45",
    line:
      "Cal AI proved the habit: take a meal photo, get calories, keep a history. We upgrade that for wearables with a consent moment.",
    action: "Point to Itadakimasu trigger and the capture flow.",
  },
  {
    time: "0:45-1:10",
    line:
      "I say itadakimasu, the iPhone DAT companion captures one Ray-Ban photo, crops toward the plate, sends it to Grok, and stops the stream.",
    action: "Run Listen or Arm/Capture, then Analyze and log.",
  },
  {
    time: "1:10-1:35",
    line:
      "The glasses should not become a dashboard on my face. They flash calories, let me swipe once for macros, then get out of the way.",
    action: "Open the glasses Web App, Refresh, then ArrowRight for breakdown.",
  },
  {
    time: "1:35-2:05",
    line:
      "The real value is what happens after five meals. Michelle maps the last meals into a FHIR-friendly trend so a dietician gets more than memory.",
    action: "Open /logs and expand the latest card.",
  },
  {
    time: "2:05-2:30",
    line:
      "For medical context, we mock a HealthEx-style import: patient-directed records come in, meal logs join the timeline, and Health Passport can chat with the data.",
    action: "Open /architecture or /api/health-passport.",
  },
  {
    time: "2:30-2:50",
    line:
      "Today it runs through Vercel and xAI. The Health Passport direction is patient-owned, and the on-device path is exactly why my Qualcomm Health Passport work matters.",
    action: "Show architecture page.",
  },
  {
    time: "2:50-3:00",
    line:
      "This is not food policing. It is awareness at the moment behavior happens, and a better record for care later.",
    action: "End on latest log card.",
  },
];

export const demoChecklist = [
  "Open iOS DAT app on the iPhone.",
  "Confirm Ray-Bans are connected in Meta AI.",
  "Tap Listen and say itadakimasu, or use Arm/Capture if audio is noisy.",
  "Confirm the captured food photo.",
  "Tap Analyze and log.",
  "Listen for the short audio confirmation.",
  "Open /glasses/index.html on Meta Web Apps and refresh.",
  "Swipe right once to show macros for three seconds.",
  "Open /logs and expand the latest card.",
  "Open /architecture for the HealthEx/FHIR story.",
];
