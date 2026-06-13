import OpenAI from "openai";
import { inngest } from "@/inngest/client";
import {
  MealAnalysis,
  buildAnalysisPrompt,
  createMockAnalysis,
  getScenario,
  normalizeAnalysis,
} from "@/lib/itadaki";

export const runtime = "nodejs";

type AnalyzeRequest = {
  scenarioId?: string;
  mealText?: string;
  imageData?: string | null;
  ritual?: string;
};

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
    return Response.json({ analysis, mode: "mock" });
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

    return Response.json({ analysis, mode: "xai" });
  } catch (error) {
    const analysis = createMockAnalysis(scenario, "mock-after-api-error");
    await sendEvent("meal.analyzed", {
      mealName: analysis.mealName,
      source: analysis.source,
      error: error instanceof Error ? error.message : "Unknown xAI error",
    });
    await sendEvent("timeline.updated", { entry: analysis.timelineEntry });
    await sendEvent("care_context.generated", { question: analysis.clinicianQuestion });

    return Response.json({
      analysis,
      mode: "mock-after-api-error",
      warning: error instanceof Error ? error.message : "Unknown xAI error",
    });
  }
}
