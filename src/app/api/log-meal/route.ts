import { appendMealLog, readMealLogs } from "@/lib/server/meal-log-store";

export const runtime = "nodejs";

type LogMealRequest = {
  source?: string;
  transcript?: string;
  mealName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageLabel?: string;
  thumbnailDataUrl?: string;
  triggered?: boolean;
  uncertainty?: string;
  mode?: string;
  note?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 20);
  const logs = await readMealLogs(limit);
  return Response.json({ logs });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LogMealRequest;

  try {
    const result = await appendMealLog(body);
    return Response.json({
      ok: true,
      log: result.log,
      csvRow: result.csvRow,
      path: result.csvPath,
    });
  } catch (error) {
    return Response.json({
      ok: false,
      csvRow: "",
      error: error instanceof Error ? error.message : "Unable to write CSV.",
    });
  }
}
