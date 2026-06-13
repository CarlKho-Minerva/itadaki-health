import OpenAI from "openai";
import { inngest } from "@/inngest/client";
import {
  MealAnalysis,
  buildAnalysisPrompt,
  createMockAnalysis,
  getScenario,
  normalizeAnalysis,
} from "@/lib/itadaki";
import { toFhirBundle } from "@/lib/fhir";
import {
  DEFAULT_USER_ID,
  mealRecordFromAnalysis,
  runRiskIntelligence,
} from "@/lib/risk-intelligence";

export const runtime = "nodejs";

// format=fhir returns the bare FHIR R4 Bundle; otherwise the normal payload
// with the bundle attached so the demo UI keeps working.
//
// Additive Health Risk Intelligence Layer: every response also stores the meal,
// runs the rule-based risk engine, and generates a FHIR R4 CarePlan. This sits
// alongside the existing Observation bundle and never modifies it.
//   format=careplan returns the bare CarePlan resource.
async function respond(
  analysis: MealAnalysis,
  mode: string,
  format: string | null,
  userId: string,
  sugar: number | undefined,
  extra: Record<string, unknown> = {},
) {
  const fhir = toFhirBundle(analysis);

  // store meal -> run risk engine -> generate CarePlan
  const meal = mealRecordFromAnalysis(analysis, userId, sugar);
  const intel = runRiskIntelligence(meal, analysis.clinicalContext.profileName);
  await sendEvent("care_plan.generated", {
    userId,
    score: intel.risk.score,
    risks: intel.risk.risks,
    carePlanId: intel.carePlan.id,
  });

  if (format === "fhir") {
    return Response.json(fhir, {
      headers: { "Content-Type": "application/fhir+json" },
    });
  }
  if (format === "careplan") {
    return Response.json(intel.carePlan, {
      headers: { "Content-Type": "application/fhir+json" },
    });
  }
  return Response.json({
    analysis,
    mode,
    fhir,
    riskIntelligence: {
      risk: intel.risk,
      carePlan: intel.carePlan,
      recentMeals: intel.recentMeals,
    },
    ...extra,
  });
}

type AnalyzeRequest = {
  scenarioId?: string;
  mealText?: string;
  imageData?: string | null;
  ritual?: string;
  // Health Risk Intelligence Layer (optional, additive):
  userId?: string;
  sugar?: number; // explicit grams; otherwise estimated from carbs
};

type ReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";

function xaiReasoningEffort(): ReasoningEffort | undefined {
  const raw = process.env.XAI_REASONING_EFFORT;
  if (!raw) return undefined;
  const normalized = raw.trim().toLowerCase();
  if (
    normalized === "none" ||
    normalized === "minimal" ||
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "high" ||
    normalized === "xhigh"
  ) {
    return normalized;
  }
  return undefined;
}

async function sendEvent(name: string, data: Record<string, unknown>) {
  try {
    await inngest.send({ name, data });
  } catch {
    // Inngest visibility is useful for the demo, but the user flow must not fail without it.
  }
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const direct = tryParse(trimmed);
  if (direct) return direct;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return tryParse(trimmed.slice(start, end + 1));
  }

  return null;
}

function tryParse(text: string) {
  try {
    return JSON.parse(text) as Partial<MealAnalysis>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AnalyzeRequest;
  const scenario = getScenario(body.scenarioId);
  const mealText = body.mealText ?? "";
  const format = new URL(request.url).searchParams.get("format");
  const userId = body.userId ?? DEFAULT_USER_ID;
  const sugar = body.sugar;

  await sendEvent("trigger.started", {
    scenarioId: scenario.id,
    ritual: body.ritual ?? "itadakimasu",
    at: new Date().toISOString(),
  });

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    const analysis = createMockAnalysis(scenario);
    await sendEvent("meal.analyzed", { mealName: analysis.mealName, source: analysis.source });
    await sendEvent("timeline.updated", { entry: analysis.timelineEntry });
    await sendEvent("care_context.generated", { question: analysis.clinicianQuestion });
    return respond(analysis, "mock", format, userId, sugar);
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });

    const prompt = buildAnalysisPrompt(mealText, scenario);
    const content = body.imageData
      ? [
          { type: "text" as const, text: prompt },
          {
            type: "image_url" as const,
            image_url: {
              url: body.imageData,
            },
          },
        ]
      : prompt;

    const completion = await client.chat.completions.create({
      model: process.env.XAI_MODEL ?? "grok-4.3",
      messages: [
        {
          role: "system",
          content:
            "Return strict JSON only. Do not diagnose, prescribe, or claim medical certainty.",
        },
        {
          role: "user",
          content,
        },
      ],
      temperature: 0.2,
      reasoning_effort: xaiReasoningEffort(),
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const parsed = extractJson(text);

    if (!parsed) {
      throw new Error("xAI returned non-JSON content.");
    }

    const analysis = normalizeAnalysis(parsed, scenario, "xai");
    await sendEvent("meal.analyzed", { mealName: analysis.mealName, source: analysis.source });
    await sendEvent("timeline.updated", { entry: analysis.timelineEntry });
    await sendEvent("care_context.generated", { question: analysis.clinicianQuestion });

    return respond(analysis, "xai", format, userId, sugar);
  } catch (error) {
    const analysis = createMockAnalysis(scenario, "mock-after-api-error");
    await sendEvent("meal.analyzed", {
      mealName: analysis.mealName,
      source: analysis.source,
      error: error instanceof Error ? error.message : "Unknown xAI error",
    });
    await sendEvent("timeline.updated", { entry: analysis.timelineEntry });
    await sendEvent("care_context.generated", { question: analysis.clinicianQuestion });

    return respond(analysis, "mock-after-api-error", format, userId, sugar, {
      warning: error instanceof Error ? error.message : "Unknown xAI error",
    });
  }
}
