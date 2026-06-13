import PitchDeck from "@/components/PitchDeck";
import { readMealLogs } from "@/lib/server/meal-log-store";

export const dynamic = "force-dynamic";

export default async function PitchPage() {
  const logs = await readMealLogs(6);

  return <PitchDeck initialLogs={logs} />;
}
