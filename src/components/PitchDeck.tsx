"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { MealLog } from "@/lib/meal-log-types";
import { citations, pitchTimeline } from "@/lib/itadaki";

type PitchDeckProps = {
  initialLogs: MealLog[];
};

const reveal = {
  hidden: { opacity: 1, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const principles = [
  {
    label: "Intent first",
    text: "The glasses can see food all day. Itadaki waits for a deliberate meal moment.",
  },
  {
    label: "Context after capture",
    text: "A single card connects calories to synthetic Health Passport context.",
  },
  {
    label: "One useful question",
    text: "The output is a better clinician question, not a diagnosis.",
  },
];

const architecture = [
  "iOS DAT companion starts a short glasses camera session",
  "Meal image is center-cropped and compressed on device",
  "Vercel route sends photo and synthetic profile to Grok",
  "Result writes a log card, CSV row, and FHIR-ready event shape",
  "Michelle's FHIR branch maps logs into portable clinical records",
];

const demoSteps = [
  "Open the iOS companion and connect Meta glasses",
  "Look at the meal, then tap capture as the explicit intent gesture",
  "Confirm the cropped photo",
  "Show calories on the tiny display",
  "Open /logs and show the same meal as a card",
];

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function latestLog(logs: MealLog[]) {
  return logs[0] ?? {
    id: "fallback",
    timestamp: new Date().toISOString(),
    source: "pitch",
    status: "logged" as const,
    triggered: true,
    transcript: "Itadakimasu",
    mealName: "DAT Eggs and Toast",
    calories: 450,
    protein: 20,
    carbs: 40,
    fat: 25,
    imageLabel: "sample",
  };
}

export default function PitchDeck({ initialLogs }: PitchDeckProps) {
  const prefersReducedMotion = useReducedMotion();
  const meal = latestLog(initialLogs);
  const totalCalories = initialLogs.reduce((sum, item) => sum + item.calories, 0) || meal.calories;

  return (
    <main className="deck-shell">
      <nav className="deck-nav" aria-label="Itadaki deck navigation">
        <Link href="/">Demo</Link>
        <Link href="/logs">Logs</Link>
        <a href="/glasses/index.html">Glasses</a>
      </nav>

      <motion.section
        className="deck-cover"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={reveal}
        transition={{ duration: 0.45 }}
      >
        <div className="deck-copy">
          <span className="deck-kicker">Autonomous Healthcare Hackathon</span>
          <h1>The meal is already here.</h1>
          <p>
            Itadaki turns one meal photo from Meta Ray-Ban Display into a calorie estimate,
            a Health Passport memory, and one question worth asking later.
          </p>
          <div className="deck-cta-row">
            <a className="deck-dark-link" href="#script">
              3-minute pitch
            </a>
            <a className="deck-light-link" href="#architecture">
              Architecture
            </a>
          </div>
        </div>

        <div className="deck-device-stack" aria-label="Itadaki product mockup">
          <div className="deck-glasses-display">
            <span>Calories</span>
            <strong>{meal.calories}</strong>
          </div>
          <div className="deck-phone">
            <header>
              <div>
                <span className="deck-dot" />
                <strong>Itadaki</strong>
              </div>
              <span className="deck-streak">1</span>
            </header>
            <div className="deck-photo-slot">
              {meal.thumbnailDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meal.thumbnailDataUrl} alt="" />
              ) : (
                <span>meal photo</span>
              )}
            </div>
            <article className="deck-meal-card">
              <span>{formatTime(meal.timestamp)}</span>
              <h2>{meal.mealName}</h2>
              <strong>{meal.calories} calories</strong>
              <div>
                <small>{meal.protein ?? 0}g protein</small>
                <small>{meal.carbs ?? 0}g carbs</small>
                <small>{meal.fat ?? 0}g fat</small>
              </div>
            </article>
          </div>
        </div>
      </motion.section>

      <section className="deck-band problem-band">
        <div>
          <span className="deck-kicker">Problem</span>
          <h2>Food logging is easy now. Intent and medical context are still missing.</h2>
        </div>
        <p>
          Cal AI made the behavior obvious: take a photo, get calories, keep history. Smart
          glasses raise a harder question. Should every plate the camera sees become health data?
          Itadaki says no. The log starts only when the user acts.
        </p>
      </section>

      <section className="deck-principles" aria-label="Product principles">
        {principles.map((item, index) => (
          <motion.article
            key={item.label}
            className="deck-principle"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.label}</h3>
            <p>{item.text}</p>
          </motion.article>
        ))}
      </section>

      <section className="deck-band story-band-deck">
        <div>
          <span className="deck-kicker">Human story</span>
          <h2>A meal should not become vague health anxiety.</h2>
        </div>
        <p>
          In Filipino families, blood pressure, fatty liver, LDL, and kidney worries often show up
          as half-remembered advice at dinner. Itadaki gives the person a record they can bring
          back to care: what they ate, how uncertain the estimate was, and what to ask next.
        </p>
      </section>

      <section className="deck-flow">
        <div className="deck-flow-copy">
          <span className="deck-kicker">Live flow</span>
          <h2>Gesture, photo, calories, context.</h2>
          <p>
            The demo stays small on purpose. The glasses surface only needs a number. The phone
            keeps the photo, the log card, and the Health Passport explanation.
          </p>
        </div>
        <div className="deck-flow-rail">
          {["Intent gesture", "DAT photo", "Grok estimate", "Log card", "FHIR lane"].map(
            (step, index) => (
              <div className="deck-flow-node" key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="deck-metrics" aria-label="Demo metrics">
        <article>
          <span>Latest estimate</span>
          <strong>{meal.calories}</strong>
          <p>Calories shown on glasses.</p>
        </article>
        <article>
          <span>Today</span>
          <strong>{totalCalories}</strong>
          <p>Calories in synced log cards.</p>
        </article>
        <article>
          <span>Care output</span>
          <strong>1</strong>
          <p>Question saved for a clinician.</p>
        </article>
      </section>

      <section className="deck-band architecture-band" id="architecture">
        <div>
          <span className="deck-kicker">Architecture</span>
          <h2>The native app does capture. The web app does demo and review.</h2>
        </div>
        <ol>
          {architecture.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="deck-script" id="script">
        <div>
          <span className="deck-kicker">Talk track</span>
          <h2>Three minutes, no wandering.</h2>
        </div>
        <div className="deck-timeline">
          {pitchTimeline.map((item) => (
            <article key={item.time}>
              <span>{item.time}</span>
              <h3>{item.title}</h3>
              <p>{item.line}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="deck-demo-checklist">
        <div>
          <span className="deck-kicker">Demo checklist</span>
          <h2>What judges should see.</h2>
        </div>
        <ol>
          {demoSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="deck-citations" aria-label="Evidence and references">
        <div>
          <span className="deck-kicker">Evidence</span>
          <h2>Claims we can defend.</h2>
        </div>
        <div className="deck-source-grid">
          {citations.map((citation) => (
            <a href={citation.href} key={citation.label} target="_blank" rel="noreferrer">
              <strong>{citation.label}</strong>
              <span>{citation.claim}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
