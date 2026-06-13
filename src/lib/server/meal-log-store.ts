import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { MealLog, MealLogInput } from "@/lib/meal-log-types";
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
  return value.length > 650_000 ? undefined : value;
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
    imageLabel: input.imageLabel || "",
    thumbnailDataUrl: compactDataUrl(input.thumbnailDataUrl),
    uncertainty: input.uncertainty || "",
    mode: input.mode || "",
    note: input.note || "",
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
    },
  ];

  return logs.slice(0, Math.max(1, Math.min(limit, 50)));
}
