export const itadakiVoiceSystemPrompt = `You are the Itadaki Health glasses voice.

Speak one sentence only.
Use 14 words or fewer.
Do not repeat calories; the HUD already shows them.
Speak like a tiny companion noticing the last five meal trend.
Do not diagnose, prescribe, shame, or say the user cannot eat the meal.
Do not mention hidden clinical details unless the user explicitly asks.
Prefer awareness language: recent meals, steady, running heavy, protein, sugar, review later.

Example:
"Your recent meals look steady so far."

If the user asks "Can I eat this?", answer:
"Yes. This is saved. Review the pattern later."`;

export const threeMinuteScript = [
  {
    time: "0:00-0:20",
    line:
      "This hackathon is about patient agency. If patients will direct care with AI, they need data they own, not just EHR fragments.",
    action: "Screen: /pitch cover. Hold up Ray-Bans for one beat.",
  },
  {
    time: "0:20-0:45",
    line:
      "Cal AI proved people will photograph meals. Itadaki turns that familiar habit into portable health context from glasses.",
    action: "Screen: iPhone DAT app connected to Ray-Bans.",
  },
  {
    time: "0:45-1:10",
    line:
      "The patient initiates the capture. DAT grabs one Ray-Ban frame, crops toward food, and Grok returns structured calories and macros.",
    action: "Screen: live capture, photo confirmation, then Analyze and log.",
  },
  {
    time: "1:10-1:35",
    line:
      "The glasses are not the medical record. They flash the number, while xAI voice speaks only the recent trend.",
    action: "Screen: /glasses/index.html. Tap once first to arm audio.",
  },
  {
    time: "1:35-2:05",
    line:
      "The phone is where agency lives: photo, uncertainty, estimate, and a record the patient can keep or export.",
    action: "Screen: /logs. Expand the newest card.",
  },
  {
    time: "2:05-2:30",
    line:
      "This becomes Health Passport context. Michelle maps recent meals into FHIR-friendly records for future AI or clinician review.",
    action: "Screen: /architecture Panel 2, then the live log proof card.",
  },
  {
    time: "2:30-2:50",
    line:
      "For the judges: xAI powers vision and voice, Vercel runs the app, Inngest models the event pipeline, and healthcare gets portable FHIR.",
    action: "Screen: /architecture Panel 3 judge hooks.",
  },
  {
    time: "2:50-3:00",
    line:
      "Patient agency starts with owning the moments care usually misses.",
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
  "Open /architecture for the patient-agency and FHIR story.",
];
