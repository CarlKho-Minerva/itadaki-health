import { mealLogsToHealthPassportMarkdown } from "@/lib/health-passport-markdown";
import { readMealLogs } from "@/lib/server/meal-log-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 20);
  const logs = await readMealLogs(limit);
  const markdown = mealLogsToHealthPassportMarkdown(logs);

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'inline; filename="itadaki-health-passport.md"',
      "Cache-Control": "no-store",
    },
  });
}
