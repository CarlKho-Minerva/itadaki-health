import Link from "next/link";
import {
  demoChecklist,
  itadakiVoiceSystemPrompt,
  threeMinuteScript,
} from "@/lib/demo-script";

export default function DemoScriptPage() {
  return (
    <main className="script-shell">
      <nav className="deck-nav architecture-nav" aria-label="Itadaki navigation">
        <Link href="/">Demo</Link>
        <Link href="/logs">Logs</Link>
        <Link href="/architecture">Architecture</Link>
        <Link href="/pitch">Pitch</Link>
      </nav>

      <section className="script-hero">
        <span className="deck-kicker">Presenter notes</span>
        <h1>Three minutes. Show the patient workflow.</h1>
        <p>
          Lead with the working capture, then answer the founder feedback: what happens after
          logging? Five-meal trend, FHIR handoff, Health Passport chat.
        </p>
      </section>

      <section className="script-grid">
        <article className="script-card wide">
          <h2>Line-by-line pitch</h2>
          <div className="script-timeline">
            {threeMinuteScript.map((item) => (
              <section key={item.time}>
                <span>{item.time}</span>
                <p>{item.line}</p>
                <small>{item.action}</small>
              </section>
            ))}
          </div>
        </article>

        <article className="script-card">
          <h2>Demo checklist</h2>
          <ol>
            {demoChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>

        <article className="script-card">
          <h2>Patient story</h2>
          <p>
            Carl is not trying to block a meal after it is already on the table. He is trying to
            give a patient and dietician a better memory: what was eaten, what the estimate was,
            and whether the last five meals show a pattern.
          </p>
          <p>
            HealthEx-style import is the bridge: labs and notes come from patient-directed records;
            Itadaki adds meal context; Health Passport lets the patient chat with the combined
            timeline.
          </p>
        </article>

        <article className="script-card wide">
          <h2>Voice prompt</h2>
          <pre>{itadakiVoiceSystemPrompt}</pre>
        </article>
      </section>
    </main>
  );
}
