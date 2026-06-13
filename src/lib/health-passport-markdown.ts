import type { MealLog } from "@/lib/meal-log-types";

function line(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function field(label: string, value: unknown) {
  const cleaned = line(value);
  return cleaned ? `- ${label}: ${cleaned}` : "";
}

function macroLine(log: MealLog) {
  const parts = [
    log.protein === undefined ? "" : `protein ${log.protein}g`,
    log.carbs === undefined ? "" : `carbs ${log.carbs}g`,
    log.fat === undefined ? "" : `fat ${log.fat}g`,
    log.sodium === undefined ? "" : `sodium ${log.sodium}mg`,
  ].filter(Boolean);

  return parts.length ? `- Macros: ${parts.join(", ")}` : "";
}

function items(log: MealLog) {
  if (!log.items?.length) return "";

  return [
    "- Items:",
    ...log.items.map((item) => {
      const confidence =
        typeof item.confidence === "number"
          ? `, confidence ${Math.round(item.confidence * 100)}%`
          : "";
      return `  - ${line(item.name)} (${line(item.amount)}${confidence})`;
    }),
  ].join("\n");
}

export function mealLogsToHealthPassportMarkdown(logs: MealLog[]) {
  const generatedAt = new Date().toISOString();

  const body = logs
    .map((log) =>
      [
        `## ${log.timestamp} - ${line(log.mealName) || "Meal log"}`,
        field("Source", log.source),
        field("Intent transcript", log.transcript),
        field("Calories", `${log.calories}${log.calorieRange ? ` kcal (${log.calorieRange})` : " kcal"}`),
        macroLine(log),
        field("Uncertainty", log.uncertainty),
        field("Wearable reinforcement", log.audioBrief),
        field("Mode", log.mode),
        field("Note", log.note),
        items(log),
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  return [
    "---",
    "source: itadaki-health",
    `generated_at: ${generatedAt}`,
    "synthetic: true",
    "schema: somach.health_passport.meal_log.v1",
    "---",
    "",
    "# Itadaki Meal Log",
    "",
    "Synthetic hackathon export. Not medical advice, diagnosis, or dosing guidance.",
    "",
    body || "No meal logs yet.",
    "",
    "## Machine-readable endpoints",
    "",
    "- Latest logs: /api/logs?limit=20",
    "- FHIR Observation bundle: /api/analyze-meal?format=fhir",
    "- FHIR CarePlan: /api/analyze-meal?format=careplan",
  ].join("\n");
}
