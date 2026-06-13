import Link from "next/link";
import {
  builtWith,
  cutIfSlow,
  demoChecklist,
  demoStats,
  elevatorPitch,
  mediaShotList,
  projectName,
  projectStoryMarkdown,
  pubmedSources,
  submissionLinks,
} from "@/lib/submission";

export default function SubmissionPage() {
  return (
    <main className="submission-shell">
      <nav className="deck-nav architecture-nav" aria-label="Itadaki navigation">
        <Link href="/">Demo</Link>
        <Link href="/logs">Logs</Link>
        <Link href="/architecture">Architecture</Link>
        <Link href="/demo-script">Script</Link>
      </nav>

      <section className="submission-hero">
        <span className="deck-kicker">Submission packet</span>
        <h1>Copy this into the hackathon form.</h1>
        <p>
          Use this as the source of truth for project media, try-it-out links, demo fallback,
          citations, and the final three-minute story.
        </p>
      </section>

      <section className="submission-grid">
        <article className="submission-card">
          <span>Project name</span>
          <h2>{projectName}</h2>
        </article>

        <article className="submission-card">
          <span>Elevator pitch</span>
          <p className="submission-big-copy">{elevatorPitch}</p>
        </article>

        <article className="submission-card wide">
          <span>Try it out</span>
          <div className="submission-links">
            {submissionLinks.map((link) => (
              <a href={link.href} key={link.href}>
                <strong>{link.label}</strong>
                <small>{link.href}</small>
              </a>
            ))}
          </div>
        </article>

        <article className="submission-card wide">
          <span>About the project</span>
          <pre>{projectStoryMarkdown}</pre>
        </article>

        <article className="submission-card">
          <span>Built with</span>
          <ul className="pill-list">
            {builtWith.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="submission-card">
          <span>Best use of Grok Voice</span>
          <p>
            xAI STT catches the intentional phrase in the companion app. Grok analyzes the meal.
            xAI TTS returns one short MP3 while the glasses flash the calorie result.
          </p>
        </article>

        <article className="submission-card">
          <span>Statistics</span>
          <ul>
            {demoStats.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="submission-card">
          <span>PubMed citations</span>
          <ul>
            {pubmedSources.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </article>

        <article className="submission-card wide">
          <span>User flow</span>
          <ol className="submission-steps">
            {demoChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>

        <article className="submission-card">
          <span>If xAI is slow</span>
          <ul>
            {cutIfSlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="submission-card">
          <span>Project media</span>
          <ul>
            {mediaShotList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
