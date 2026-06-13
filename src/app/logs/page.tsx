import { readMealLogs } from "@/lib/server/meal-log-store";
import { createMockAnalysis, getScenario } from "@/lib/itadaki";

export const dynamic = "force-dynamic";

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default async function LogsPage() {
  const logs = await readMealLogs(20);
  const sample = createMockAnalysis(getScenario("sweetgreen-harvest"));
  const cards = logs.length
    ? logs
    : [
        {
          id: "sample",
          timestamp: new Date().toISOString(),
          source: "sample",
          status: "logged" as const,
          triggered: true,
          transcript: "Itadakimasu",
          mealName: sample.mealName,
          calories: sample.nutrition.calories.value,
          protein: sample.nutrition.protein.value,
          carbs: sample.nutrition.carbs.value,
          fat: sample.nutrition.fat.value,
          imageLabel: "sample",
          uncertainty: sample.uncertainty,
        },
      ];

  return (
    <main className="logs-phone-shell">
      <section className="logs-phone">
        <header className="logs-header">
          <div>
            <span className="logs-mark">●</span>
            <strong>Itadaki</strong>
          </div>
          <span className="streak-pill">1</span>
        </header>

        <div className="date-strip" aria-label="Week log strip">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <span className={index === 5 ? "active" : ""} key={`${day}-${index}`}>
              {day}
              <strong>{index + 27 > 31 ? index - 4 : index + 27}</strong>
            </span>
          ))}
        </div>

        <section className="summary-grid">
          <div>
            <strong>{cards.reduce((sum, item) => sum + item.calories, 0)}</strong>
            <span>Calories logged</span>
          </div>
          <div>
            <strong>{cards.length}</strong>
            <span>Meals today</span>
          </div>
        </section>

        <h1 className="recent-heading">Recently logged</h1>
        <section className="meal-card-list">
          {cards.map((log) => (
            <details className="meal-log-card" key={log.id}>
              <summary>
                <div className="meal-thumb">
                  {log.thumbnailDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={log.thumbnailDataUrl} alt="" />
                  ) : (
                    <span>{log.imageLabel === "sample" ? "Sample" : "Photo"}</span>
                  )}
                </div>
                <div className="meal-log-copy">
                  <div className="meal-log-title">
                    <strong>{log.mealName}</strong>
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                  <p>{log.calories} calories</p>
                  <div className="macro-row">
                    <span>{log.protein ?? 0}g</span>
                    <span>{log.carbs ?? 0}g</span>
                    <span>{log.fat ?? 0}g</span>
                  </div>
                </div>
              </summary>
              <div className="meal-log-expanded">
                {log.calorieRange ? <p>Calories range: {log.calorieRange}</p> : null}
                {log.sodium ? <p>Sodium estimate: {log.sodium}mg</p> : null}
                {log.uncertainty ? <p>{log.uncertainty}</p> : null}
                {log.items?.length ? (
                  <ul>
                    {log.items.map((item) => (
                      <li key={`${item.name}-${item.amount}`}>
                        {item.name} - {item.amount}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </details>
          ))}
        </section>

        <a className="logs-export-link" href="/api/health-passport">
          Export markdown
        </a>
      </section>
    </main>
  );
}
