import { readMealLogs } from "@/lib/server/meal-log-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 20);
  const logs = await readMealLogs(limit);
  return Response.json({ logs });
}
