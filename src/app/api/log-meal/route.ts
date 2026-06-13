import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { csvEscape } from "@/lib/trigger";

export const runtime = "nodejs";

type LogMealRequest = {
  source?: string;
  transcript?: string;
  mealName?: string;
  calories?: number;
  imageLabel?: string;
  triggered?: boolean;
};

const header = "timestamp,source,triggered,transcript,meal_name,calories,image_label\n";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LogMealRequest;
  const row = [
    new Date().toISOString(),
    body.source || "web",
    body.triggered ? "true" : "false",
    body.transcript || "",
    body.mealName || "unknown meal",
    Number.isFinite(body.calories) ? body.calories : "",
    body.imageLabel || "",
  ]
    .map(csvEscape)
    .join(",");

  const csvRow = `${row}\n`;
  const storageRoot = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
  const filePath = path.join(storageRoot, "itadaki-meals.csv");

  try {
    await mkdir(storageRoot, { recursive: true });
    try {
      await appendFile(filePath, header, { flag: "wx" });
    } catch {
      // File already exists. Continue with row append.
    }
    await appendFile(filePath, csvRow);
  } catch (error) {
    return Response.json({
      ok: false,
      csvRow,
      error: error instanceof Error ? error.message : "Unable to write CSV.",
    });
  }

  return Response.json({
    ok: true,
    csvRow,
    path: process.env.VERCEL ? "/tmp/itadaki-meals.csv" : "data/itadaki-meals.csv",
  });
}
