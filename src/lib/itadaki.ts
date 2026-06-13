export type MealScenarioId = "sweetgreen-harvest" | "mendo-turkey" | "manual";

export type MealScenario = {
  id: MealScenarioId;
  name: string;
  vendor: string;
  description: string;
  imageHint: string;
};

export type NutritionMetric = {
  value: number;
  range: string;
  unit: string;
};

export type MealAnalysis = {
  id: string;
  source: "mock" | "xai" | "mock-after-api-error";
  mealName: string;
  ritual: string;
  itemEstimate: Array<{
    name: string;
    amount: string;
    confidence: number;
  }>;
  nutrition: {
    calories: NutritionMetric;
    protein: NutritionMetric;
    carbs: NutritionMetric;
    fat: NutritionMetric;
    sodium: NutritionMetric;
  };
  clinicalContext: {
    profileName: string;
    flags: string[];
    whyItMatters: string;
    betterChoice: string;
  };
  clinicianQuestion: string;
  timelineEntry: string;
  uncertainty: string;
  audioBrief: string;
  careActions: string[];
  trace: Array<{
    label: string;
    detail: string;
    status: "done" | "pending" | "warn";
  }>;
};

export const mealScenarios: MealScenario[] = [
  {
    id: "sweetgreen-harvest",
    name: "Sweetgreen Harvest Bowl",
    vendor: "Sweetgreen lunch table",
    description:
      "Warm grains, roasted chicken, sweet potato, apples, goat cheese, almonds, balsamic.",
    imageHint: "A mixed grain bowl with chicken, greens, sweet potato, and dressing.",
  },
  {
    id: "mendo-turkey",
    name: "Mendocino Farms Turkey Sandwich",
    vendor: "Dinner table",
    description:
      "Turkey sandwich with bread, greens, sauce, chips on the side, and sparkling water.",
    imageHint: "A turkey sandwich with chips beside it.",
  },
  {
    id: "manual",
    name: "Manual meal note",
    vendor: "User described",
    description: "User typed or uploaded a meal photo for the demo.",
    imageHint: "A user-provided meal photo or description.",
  },
];

export const syntheticProfile = {
  name: "Synthetic Carl",
  note: "Synthetic data only. No diagnosis. Demo profile mirrors a portable health record.",
  conditions: ["ADHD", "family history of hypertension", "recent elevated A1C flag"],
  medications: ["methylphenidate", "escitalopram"],
  goals: [
    "keep protein steady before long coding blocks",
    "avoid large sodium spikes",
    "ask better questions at appointments",
  ],
  baselines: {
    a1c: "7.2% synthetic flag",
    fastingGlucose: "81 mg/dL synthetic",
    bloodPressure: "borderline family-risk context",
  },
};

export const citations = [
  {
    label: "Dietary self-monitoring",
    claim:
      "Frequent electronic dietary self-monitoring has been associated with greater weight loss in behavioral programs.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6647027/",
  },
  {
    label: "Self-monitoring review",
    claim:
      "A systematic review found many behavioral weight-loss interventions using dietary self-monitoring reported significant weight-loss effects.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8928602/",
  },
  {
    label: "Image-based food records",
    claim:
      "Image-assisted and image-based dietary assessment methods are an established research direction.",
    href: "https://pubmed.ncbi.nlm.nih.gov/27938425/",
  },
  {
    label: "Mindful eating",
    claim:
      "Mindfulness-based interventions have been studied for problematic eating behaviors.",
    href: "https://pubmed.ncbi.nlm.nih.gov/32551798/",
  },
  {
    label: "Cal AI behavior loop",
    claim:
      "Cal AI markets photo-based food logging, nutrition breakdowns, goals, progress tracking, and paid food scanning.",
    href: "https://apps.apple.com/us/app/cal-ai-calorie-tracker/id6480417616",
  },
  {
    label: "Cal AI business case",
    claim:
      "Business Insider reported MyFitnessPal acquired Cal AI after it reached large user and revenue scale.",
    href: "https://www.businessinsider.com/cal-ai-myfitnesspal-calorie-tracker-teen-founder-flow-zack-yadegari-2026-6",
  },
  {
    label: "Meta Web Apps",
    claim:
      "Meta's Web App path supports HTML, CSS, JavaScript, D-pad style input, and public HTTPS deployment for display glasses.",
    href: "https://github.com/facebookincubator/meta-wearables-webapp",
  },
];

export const pitchTimeline = [
  {
    time: "0:00-0:20",
    title: "Hook",
    line:
      "Cal AI proved people will pay to photograph food. Passive glasses need an intent layer.",
  },
  {
    time: "0:20-0:45",
    title: "Ritual",
    line:
      "Itadakimasu is the consent moment: the glasses see food all day, but logging starts only when the user begins a meal.",
  },
  {
    time: "0:45-1:25",
    title: "Demo",
    line:
      "Trigger, glasses HUD, meal analysis, log card, trend-aware export.",
  },
  {
    time: "1:25-1:55",
    title: "Science",
    line:
      "Self-monitoring, image-based food records, and mindful eating give the behavior loop a credible base.",
  },
  {
    time: "1:55-2:20",
    title: "Business",
    line:
      "Cal AI made the market obvious. Itadaki Health adds consent, wearability, and trend memory.",
  },
  {
    time: "2:20-2:50",
    title: "Architecture",
    line: "Vercel, Grok, Inngest, Meta Web App, iOS DAT, and Michelle's FHIR lane.",
  },
  {
    time: "2:50-3:00",
    title: "Close",
    line:
      "This is not food policing. It is a clean record at the moment behavior happens.",
  },
];

export function getScenario(id?: string): MealScenario {
  return mealScenarios.find((scenario) => scenario.id === id) ?? mealScenarios[0];
}

export function createMockAnalysis(
  scenario: MealScenario = mealScenarios[0],
  source: MealAnalysis["source"] = "mock",
): MealAnalysis {
  const isSandwich = scenario.id === "mendo-turkey";

  return {
    id: `itadaki-${Date.now()}`,
    source,
    mealName: scenario.name,
    ritual: "Itadakimasu logged as explicit meal intent.",
    itemEstimate: isSandwich
      ? [
          { name: "Turkey sandwich", amount: "1 sandwich", confidence: 0.86 },
          { name: "Kettle chips", amount: "1 small bag", confidence: 0.79 },
          { name: "Sparkling water", amount: "1 can", confidence: 0.93 },
        ]
      : [
          { name: "Roasted chicken", amount: "1 palm-sized portion", confidence: 0.84 },
          { name: "Warm grains", amount: "1 cup", confidence: 0.78 },
          { name: "Sweet potato and apples", amount: "mixed topping", confidence: 0.74 },
          { name: "Balsamic dressing", amount: "1 to 2 tbsp", confidence: 0.62 },
        ],
    nutrition: isSandwich
      ? {
          calories: { value: 790, range: "680-940", unit: "kcal" },
          protein: { value: 35, range: "28-43", unit: "g" },
          carbs: { value: 86, range: "70-105", unit: "g" },
          fat: { value: 33, range: "24-44", unit: "g" },
          sodium: { value: 1560, range: "1200-1900", unit: "mg" },
        }
      : {
          calories: { value: 705, range: "590-850", unit: "kcal" },
          protein: { value: 39, range: "31-48", unit: "g" },
          carbs: { value: 74, range: "58-92", unit: "g" },
          fat: { value: 29, range: "22-38", unit: "g" },
          sodium: { value: 980, range: "720-1280", unit: "mg" },
        },
    clinicalContext: {
      profileName: syntheticProfile.name,
      flags: isSandwich
        ? ["Higher-sodium restaurant meal", "Carb-heavy dinner worth logging"]
        : ["Solid protein for a coding block", "Grain-heavy lunch worth tracking"],
      whyItMatters: isSandwich
        ? "The useful move is awareness: if this pattern repeats, bring the trend to a clinician instead of guessing from memory."
        : "This meal is fine as a meal. The value is seeing whether similar lunches cluster with labs, energy, or sleep later.",
      betterChoice: isSandwich
        ? "Keep the sandwich, swap chips for fruit or split the chips."
        : "Keep the bowl, ask for dressing on the side next time.",
    },
    clinicianQuestion: isSandwich
      ? "Given my family history of hypertension, what daily sodium target should I use for restaurant meals?"
      : "If my A1C is elevated but fasting glucose is normal, should I track post-meal glucose or meal timing?",
    timelineEntry: `${scenario.name}: intentional food log captured after "itadakimasu"; added nutrition estimate, uncertainty, and one optional clinician question.`,
    uncertainty:
      "Portion estimates are approximate. This is coaching context, not medical advice or dosing guidance.",
    audioBrief: isSandwich
      ? "Logged 790 calories. Estimate saved."
      : "Logged 705 calories. Estimate saved.",
    careActions: [
      "Log meal with uncertainty range",
      "Save one clinician question",
      "Watch repeat pattern across 7 days",
    ],
    trace: [
      {
        label: "trigger.started",
        detail: "Ritual phrase converted passive seeing into intentional logging.",
        status: "done",
      },
      {
        label: "meal.analyzed",
        detail: "Meal items and nutrition estimated with confidence values.",
        status: "done",
      },
      {
        label: "timeline.updated",
        detail: "Meal memory received a food-context event.",
        status: "done",
      },
      {
        label: "care_context.generated",
        detail: "One plain-language clinician question prepared.",
        status: "done",
      },
    ],
  };
}

export function buildAnalysisPrompt(mealText: string, scenario: MealScenario) {
  return `You are Itadaki Health, a meal awareness agent.

Return strict JSON matching this shape:
{
  "mealName": string,
  "ritual": string,
  "itemEstimate": [{"name": string, "amount": string, "confidence": number}],
  "nutrition": {
    "calories": {"value": number, "range": string, "unit": "kcal"},
    "protein": {"value": number, "range": string, "unit": "g"},
    "carbs": {"value": number, "range": string, "unit": "g"},
    "fat": {"value": number, "range": string, "unit": "g"},
    "sodium": {"value": number, "range": string, "unit": "mg"}
  },
  "clinicalContext": {
    "profileName": "Synthetic Carl",
    "flags": string[],
    "whyItMatters": string,
    "betterChoice": string
  },
  "clinicianQuestion": string,
  "timelineEntry": string,
  "uncertainty": string,
  "audioBrief": string,
  "careActions": string[]
}

Rules:
- Do not diagnose, prescribe, or claim medical certainty.
- Do not shame the meal or tell the user not to eat it; the meal is already here.
- Do not mention Health Passport in user-facing output.
- Be specific about uncertainty.
- Keep audioBrief under 12 words. It should be calm, useful, and non-medical.
- Make the result useful in a 3-minute hackathon demo.

Meal scenario: ${scenario.name}
Vendor/context: ${scenario.vendor}
Meal description: ${scenario.description}
User note: ${mealText || "No extra note."}
Synthetic profile: ${JSON.stringify(syntheticProfile)}`;
}

export function normalizeAnalysis(
  raw: Partial<MealAnalysis>,
  scenario: MealScenario,
  source: MealAnalysis["source"],
): MealAnalysis {
  const fallback = createMockAnalysis(scenario, source);

  return {
    ...fallback,
    ...raw,
    id: fallback.id,
    source,
    mealName: raw.mealName || fallback.mealName,
    ritual: raw.ritual || fallback.ritual,
    itemEstimate: Array.isArray(raw.itemEstimate) ? raw.itemEstimate : fallback.itemEstimate,
    nutrition: raw.nutrition || fallback.nutrition,
    clinicalContext: raw.clinicalContext || fallback.clinicalContext,
    clinicianQuestion: raw.clinicianQuestion || fallback.clinicianQuestion,
    timelineEntry: raw.timelineEntry || fallback.timelineEntry,
    uncertainty: raw.uncertainty || fallback.uncertainty,
    audioBrief: raw.audioBrief || fallback.audioBrief,
    careActions: Array.isArray(raw.careActions) ? raw.careActions : fallback.careActions,
    trace: fallback.trace,
  };
}
