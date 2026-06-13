import { appendMealLog, readMealLogs } from "@/lib/server/meal-log-store";
import type { MealLogInput } from "@/lib/meal-log-types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 20);
  const logs = await readMealLogs(limit);
  return Response.json({ logs });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as MealLogInput;

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
