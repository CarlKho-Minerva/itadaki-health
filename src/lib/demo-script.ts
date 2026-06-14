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
      "Cal AI proved people will photograph food. We built the glasses version without making every plate feel watched.",
    action: "Screen: /pitch cover. Hold up Ray-Bans for one beat.",
  },
  {
    time: "0:20-0:45",
    line:
      "The product hinge is intent. Itadakimasu is the switch: one meal frame, then the stream stops.",
    action: "Screen: iPhone DAT app connected to Ray-Bans.",
  },
  {
    time: "0:45-1:10",
    line:
      "Watch the actual path: DAT captures from the glasses, crops toward the food, and sends the image to Grok for structured calories and macros.",
    action: "Screen: live capture, photo confirmation, then Analyze and log.",
  },
  {
    time: "1:10-1:35",
    line:
      "The glasses are not a dashboard. They stay blank, flash calories and macros for three seconds, speak once, then disappear.",
    action: "Screen: /glasses/index.html. Tap once first to arm audio.",
  },
  {
    time: "1:35-2:05",
    line:
      "The meal card is the receipt. It keeps the photo, the uncertainty, and the nutrition estimate so the user has a real memory later.",
    action: "Screen: /logs. Expand the newest card.",
  },
  {
    time: "2:05-2:30",
    line:
      "The Health Passport angle is what happens after repetition. Michelle maps the last five meals into FHIR-friendly trend context.",
    action: "Screen: /architecture Panel 2, then the live log proof card.",
  },
  {
    time: "2:30-2:50",
    line:
      "For the judges: Meta gets real DAT capture and display, xAI gets vision plus voice, Vercel runs the live app, and healthcare gets exportable records.",
    action: "Screen: /architecture Panel 3 judge hooks.",
  },
  {
    time: "2:50-3:00",
    line:
      "This is not food policing. It is awareness now and a better record later.",
    action: "Screen: latest log card or glasses pulse.",
  },
];

export const demoChecklist = [
  "Open iOS DAT app on the iPhone.",
  "Confirm Ray-Bans are connected in Meta AI.",
  "Tap Listen and say itadakimasu, or use Arm/Capture if audio is noisy.",
  "Confirm the captured food photo.",
  "Tap Analyze and log.",
  "Listen for the short audio confirmation.",
  "Keep /glasses/index.html open before capture; it should stay mostly blank.",
  "Watch calories and macros fade in for three seconds after the new log lands.",
  "Open /logs and expand the latest card.",
  "Open /architecture for the HealthEx/FHIR story.",
];
