import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { MealLog, MealLogInput, MealLogItem } from "@/lib/meal-log-types";
import { csvEscape } from "@/lib/trigger";

const csvHeader =
  "timestamp,source,status,triggered,transcript,meal_name,calories,protein,carbs,fat,image_label\n";

function storageRoot() {
  return process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
}

function jsonlPath() {
  return path.join(storageRoot(), "itadaki-meals.jsonl");
}

function csvPath() {
  return path.join(storageRoot(), "itadaki-meals.csv");
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function compactDataUrl(value?: string) {
  if (!value?.startsWith("data:image/")) return undefined;
  return value.length > 900_000 ? undefined : value;
}

function compactItems(value: unknown): MealLogItem[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .slice(0, 8)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const name = String(record.name ?? "").trim();
      const amount = String(record.amount ?? "").trim();
      const confidence = Number(record.confidence);
      if (!name || !amount) return null;
      return {
        name: name.slice(0, 80),
        amount: amount.slice(0, 80),
        confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : undefined,
      };
    })
    .filter(Boolean) as MealLogItem[];

  return items.length ? items : undefined;
}

export function toCsvRow(log: MealLog) {
  return [
    log.timestamp,
    log.source,
    log.status,
    log.triggered ? "true" : "false",
    log.transcript,
    log.mealName,
    log.calories,
    log.protein ?? "",
    log.carbs ?? "",
    log.fat ?? "",
    log.imageLabel ?? "",
  ]
    .map(csvEscape)
    .join(",");
}

export async function appendMealLog(input: MealLogInput) {
  const log: MealLog = {
    id: `meal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: input.timestamp || new Date().toISOString(),
    source: input.source || "web",
    status: input.status || "logged",
    triggered: Boolean(input.triggered),
    transcript: input.transcript || "",
    mealName: input.mealName || "Estimated meal",
    calories: toNumber(input.calories),
    protein: input.protein === undefined ? undefined : toNumber(input.protein),
    carbs: input.carbs === undefined ? undefined : toNumber(input.carbs),
    fat: input.fat === undefined ? undefined : toNumber(input.fat),
    sodium: input.sodium === undefined ? undefined : toNumber(input.sodium),
    imageLabel: input.imageLabel || "",
    thumbnailDataUrl: compactDataUrl(input.thumbnailDataUrl),
    uncertainty: input.uncertainty || "",
    mode: input.mode || "",
    note: input.note || "",
    calorieRange: input.calorieRange || "",
    proteinRange: input.proteinRange || "",
    carbsRange: input.carbsRange || "",
    fatRange: input.fatRange || "",
    items: compactItems(input.items),
  };

  await mkdir(storageRoot(), { recursive: true });

  try {
    await appendFile(csvPath(), csvHeader, { flag: "wx" });
  } catch {
    // The file already exists. Append only the new row below.
  }

  const csvRow = `${toCsvRow(log)}\n`;
  await appendFile(csvPath(), csvRow);
  await appendFile(jsonlPath(), `${JSON.stringify(log)}\n`);

  return {
    log,
    csvRow,
    csvPath: process.env.VERCEL ? "/tmp/itadaki-meals.csv" : "data/itadaki-meals.csv",
  };
}

export async function readMealLogs(limit = 20) {
  try {
    const raw = await readFile(jsonlPath(), "utf8");
    const logs = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as MealLog)
      .reverse()
      .slice(0, Math.max(1, Math.min(limit, 50)));
    return logs.length ? logs : seededLogs(limit);
  } catch {
    return seededLogs(limit);
  }
}

function seededLogs(limit: number): MealLog[] {
  const logs: MealLog[] = [
    {
      id: "seed_itadaki_dat",
      timestamp: new Date().toISOString(),
      source: "demo-seed",
      status: "logged",
      triggered: true,
      transcript: "Itadakimasu",
      mealName: "DAT Eggs and Toast",
      calories: 450,
      protein: 20,
      carbs: 40,
      fat: 25,
      imageLabel: "sample",
      uncertainty: "Seeded fallback shown when Vercel serverless storage is empty.",
      mode: "demo",
      note: "Use persistent KV or Blob storage after the hackathon.",
      calorieRange: "400-520",
      proteinRange: "16-25",
      carbsRange: "32-48",
      fatRange: "18-32",
      items: [
        { name: "Eggs", amount: "2 large", confidence: 0.92 },
        { name: "Avocado", amount: "half avocado", confidence: 0.78 },
        { name: "Toast", amount: "1 slice", confidence: 0.84 },
      ],
    },
  ];

  return logs.slice(0, Math.max(1, Math.min(limit, 50)));
}
