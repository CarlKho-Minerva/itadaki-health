import Link from "next/link";
import { readMealLogs } from "@/lib/server/meal-log-store";

export const dynamic = "force-dynamic";

const demoPipeline = [
  {
    label: "Intent",
    tone: "local",
    boxes: [
      ["Itadakimasu", "spoken or tapped trigger"],
      ["Meta Ray-Bans", "one meal frame, not passive logging"],
    ],
  },
  {
    label: "iPhone DAT",
    tone: "local",
    boxes: [
      ["Short camera session", "stream stops after capture"],
      ["Food crop", "cleaner image before analysis"],
    ],
  },
  {
    label: "Vercel + xAI",
    tone: "cloud",
    boxes: [
      ["/api/analyze-meal", "Grok vision returns strict JSON"],
      ["/api/speak", "short MP3 reinforcement"],
    ],
  },
  {
    label: "User output",
    tone: "data",
    boxes: [
      ["Glasses HUD", "3-second calories + macros pulse"],
      ["Phone card", "photo, uncertainty, breakdown"],
    ],
  },
];

const passportPipeline = [
  {
    label: "Patient records",
    tone: "local",
    boxes: [
      ["HealthEx-style import", "labs, meds, notes, conditions"],
      ["Health Passport", "patient-owned context layer"],
    ],
  },
  {
    label: "Meal memory",
    tone: "data",
    boxes: [
      ["JSONL + CSV", "hackathon logging trail"],
      ["Last 5 meals", "Michelle's trend window"],
    ],
  },
  {
    label: "FHIR lane",
    tone: "cloud",
    boxes: [
      ["Observation Bundle", "nutrients as structured records"],
      ["CarePlan shape", "coaching trend, not diagnosis"],
    ],
  },
  {
    label: "Share later",
    tone: "local",
    boxes: [
      ["Ask better question", "bring pattern to care"],
      ["Patient decides", "export or keep private"],
    ],
  },
];

const runOfShow = [
  {
    time: "0:00",
    screen: "Pitch cover",
    line: "Cal AI made food logging easy. We made it wearable without making it creepy.",
  },
  {
    time: "0:20",
    screen: "iPhone DAT app",
    line: "I say itadakimasu. That is the consent moment. Now we capture one frame.",
  },
  {
    time: "0:50",
    screen: "Glasses HUD",
    line: "The display stays blank, then flashes calories and macros for three seconds.",
  },
  {
    time: "1:15",
    screen: "/logs",
    line: "The same event becomes a card with photo, uncertainty, and nutrition estimate.",
  },
  {
    time: "1:45",
    screen: "/architecture",
    line: "This is the pipeline: DAT capture, Vercel, Grok, TTS, FHIR, Health Passport.",
  },
  {
    time: "2:20",
    screen: "/api/health-passport",
    line: "The endgame is not calorie shame. It is patient-owned context for future care.",
  },
  {
    time: "2:50",
    screen: "Latest log card",
    line: "Awareness now, better record later. That is the product.",
  },
];

const judgeLenses = [
  ["xAI", "Grok vision does the meal parse; xAI voice gives the hands-free feedback."],
  ["Meta", "DAT handles real camera capture; the Web App keeps the glasses display tiny."],
  ["Vercel", "The whole demo is a production HTTPS app with server routes and static HUD."],
  ["Inngest", "Meal analysis is event-shaped: trigger, analysis, timeline, care context."],
  ["Healthcare", "FHIR outputs and markdown exports make the data useful after the meal."],
];

function formatLogTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function PipelinePanel({
  title,
  subtitle,
  groups,
  arrowLabels,
  returnLine,
}: {
  title: string;
  subtitle: string;
  groups: typeof demoPipeline;
  arrowLabels: string[];
  returnLine: string;
}) {
  return (
    <section className="pipeline-panel">
      <div className="pipeline-panel-head">
        <span>{title}</span>
        <p>{subtitle}</p>
      </div>
      <div className="pipeline-flow">
        {groups.map((group, index) => (
          <div className="pipeline-step-wrap" key={group.label}>
            <div className={`pipeline-group ${group.tone}`}>
              <div className="pipeline-group-label">{group.label}</div>
              {group.boxes.map(([title, detail]) => (
                <div className="pipeline-box" key={title}>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
              ))}
            </div>
            {index < groups.length - 1 ? (
              <div className="pipeline-arrow">
                <span>→</span>
                <small>{arrowLabels[index]}</small>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="pipeline-return">{returnLine}</div>
    </section>
  );
}

export default async function ArchitecturePage() {
  const latestLogs = await readMealLogs(3);

  return (
    <main className="pipeline-shell">
      <nav className="deck-nav pipeline-nav" aria-label="Itadaki navigation">
        <Link href="/">Demo</Link>
        <Link href="/pitch">Pitch</Link>
        <Link href="/logs">Logs</Link>
        <Link href="/demo-script">Script</Link>
        <Link href="/submission">Submit</Link>
        <a href="/glasses/index.html">Glasses</a>
      </nav>

      <header className="pipeline-hero">
        <span>Itadaki Health architecture</span>
        <h1>One consented meal frame. Four useful outputs.</h1>
        <p>
          The camera runs for seconds. The glasses show only what belongs on your face. The phone
          keeps the record. Health Passport turns the history into care context later.
        </p>
      </header>

      <PipelinePanel
        title="Panel 1 · Live demo pipeline"
        subtitle="This is what judges should see in the room: trigger, capture, calories, audio, card."
        groups={demoPipeline}
        arrowLabels={["consented frame", "image payload", "JSON + audio"]}
        returnLine="After the log lands, the stream stops and the glasses return to blank."
      />

      <PipelinePanel
        title="Panel 2 · Health Passport pipeline"
        subtitle="This is the bigger thesis: patient records plus daily context become a better memory for care."
        groups={passportPipeline}
        arrowLabels={["records import", "meal history", "FHIR context"]}
        returnLine="The patient shares a trend when they choose. The app does not police the meal in the moment."
      />

      <section className="pipeline-panel">
        <div className="pipeline-panel-head">
          <span>Panel 3 · Three-minute run of show</span>
          <p>Use this as the literal screen choreography. Do not wander.</p>
        </div>
        <div className="pipeline-rundown">
          {runOfShow.map((item) => (
            <article key={item.time}>
              <span>{item.time}</span>
              <strong>{item.screen}</strong>
              <p>{item.line}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pipeline-bottom-grid">
        <article className="pipeline-judge-card">
          <span>Judge hooks</span>
          <h2>Translate the same demo five ways.</h2>
          <div>
            {judgeLenses.map(([label, line]) => (
              <p key={label}>
                <strong>{label}:</strong> {line}
              </p>
            ))}
          </div>
        </article>

        <article className="pipeline-live-card">
          <span>Live log proof</span>
          <h2>Latest stored meals</h2>
          <div className="pipeline-log-list">
            {latestLogs.map((log) => (
              <section key={log.id}>
                <small>{formatLogTime(log.timestamp)}</small>
                <strong>{log.mealName}</strong>
                <p>
                  {log.calories} kcal · {log.protein ?? 0}g protein · {log.carbs ?? 0}g carbs ·{" "}
                  {log.fat ?? 0}g fat
                </p>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className="pipeline-links">
        <a href="/api/health-passport">Health Passport markdown</a>
        <a href="/api/logs?limit=3">Latest logs JSON</a>
        <a href="/api/risk?userId=demo-user">Risk JSON</a>
        <a href="/api/analyze-meal?format=careplan">CarePlan shape</a>
      </section>
    </main>
  );
}
