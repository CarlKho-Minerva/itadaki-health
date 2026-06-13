import Link from "next/link";

export const dynamic = "force-dynamic";

const mermaid = `flowchart LR
  A[Meta Ray-Ban camera] --> B[iOS DAT companion]
  B --> C[Food-focus crop]
  C --> D[Vercel /api/analyze-meal]
  D --> E[xAI Grok vision JSON]
  E --> F[Meal log JSONL + CSV]
  F --> G[/logs phone cards]
  F --> H[/api/health-passport markdown]
  E --> I[FHIR Observation Bundle]
  F --> J[Michelle risk engine]
  J --> K[FHIR CarePlan]
  E --> L[/api/speak xAI TTS]
  L --> M[Short audio feedback]`;

const glassesPayload = [
  "Calories",
  "One number",
  "Short audio confirmation",
  "No diagnosis",
];

const passportPayload = [
  "timestamp",
  "meal name",
  "calories with range",
  "protein, carbs, fat, sodium",
  "image thumbnail",
  "uncertainty",
  "FHIR Observations",
  "CarePlan trend hooks",
];

export default function ArchitecturePage() {
  return (
    <main className="architecture-shell">
      <nav className="deck-nav architecture-nav" aria-label="Itadaki navigation">
        <Link href="/">Demo</Link>
        <Link href="/logs">Logs</Link>
        <Link href="/pitch">Pitch</Link>
        <a href="/glasses/index.html">Glasses</a>
      </nav>

      <section className="architecture-hero">
        <div>
          <span className="deck-kicker">Architecture</span>
          <h1>Capture on the phone. Whisper back through the glasses.</h1>
          <p>
            The working build keeps the face display quiet. The iOS DAT companion captures the
            Ray-Ban photo, crops it toward the plate, sends it to Grok, stores the meal, and plays
            one short audio confirmation.
          </p>
        </div>
        <aside className="architecture-glasses">
          <span>Calories</span>
          <strong>705</strong>
          <p>Logged. Estimate saved.</p>
        </aside>
      </section>

      <section className="architecture-grid">
        <article>
          <span>01</span>
          <h2>What goes on the glasses</h2>
          <ul>
            {glassesPayload.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>02</span>
          <h2>What goes to Health Passport</h2>
          <ul>
            {passportPayload.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>03</span>
          <h2>Why this avoids food policing</h2>
          <p>
            The meal is already here. Itadaki logs what happened, gives a small estimate, and saves
            the trend for later care conversations instead of scolding in the moment.
          </p>
        </article>
      </section>

      <section className="architecture-diagram">
        <div>
          <span className="deck-kicker">Mermaid</span>
          <h2>Pipeline Michelle can plug into.</h2>
        </div>
        <pre>{mermaid}</pre>
      </section>

      <section className="architecture-links">
        <a href="/api/health-passport">Health Passport markdown</a>
        <a href="/api/risk?userId=demo-user">Risk JSON</a>
        <a href="/api/analyze-meal?format=careplan">CarePlan shape</a>
      </section>
    </main>
  );
}
