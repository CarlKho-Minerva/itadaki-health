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
    label: "Patient-directed capture",
    text: "A phrase or tap turns one meal into patient-owned health data.",
  },
  {
    label: "Care on your own data",
    text: "Grok explains the recent pattern, not generic diet advice.",
  },
  {
    label: "Portable record",
    text: "Health Passport and FHIR let the patient transport the context later.",
  },
];

const architecture = [
  "Meta DAT captures one glasses frame after patient action",
  "iPhone crops toward food and stops the stream",
  "Vercel sends image to Grok for strict JSON nutrition",
  "xAI TTS returns one short trend line from the recent meal window",
  "Logs feed cards, CSV, JSONL, FHIR Observations, and Health Passport markdown",
  "Michelle's five-meal lane can generate a FHIR CarePlan shape",
];

const demoSteps = [
  "Show /pitch cover and state the patient-agency wedge",
  "Use the iOS DAT app to capture food from Ray-Bans",
  "Let the glasses pulse calories and macros for three seconds",
  "Open /logs and expand the newest card",
  "Open /architecture for the Health Passport and FHIR path",
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
        <Link href="/architecture">Architecture</Link>
        <Link href="/demo-script">Script</Link>
        <Link href="/submission">Submit</Link>
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
          <h1>Patient-owned meal memory for autonomous care.</h1>
          <p>
            Itadaki turns one Ray-Ban meal frame into a patient-owned record: calories on the
            glasses, a trend voice from Grok, and FHIR-ready context for Health Passport.
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
          <h2>Autonomous care needs the patient&apos;s daily context.</h2>
        </div>
        <p>
          The event thesis is patient agency: people will direct care with AI, own their health
          data, and receive guidance based on their own biometrics. But the EHR misses daily life.
          Itadaki turns meals into portable context the patient controls.
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
          <h2>Families remember warnings. Patients need usable records.</h2>
        </div>
        <p>
          In Filipino families, blood pressure, fatty liver, LDL, and kidney worries often show up
          as half-remembered advice at dinner. Itadaki turns the moment into a patient-owned record:
          what I ate, what the estimate was, and what pattern I should ask about later.
        </p>
      </section>

      <section className="deck-flow">
        <div className="deck-flow-copy">
          <span className="deck-kicker">Live flow</span>
          <h2>Patient action, capture, calories, care context.</h2>
          <p>
            The face display should not become another app screen. The glasses flash the result.
            The phone keeps the record the patient can transport later.
          </p>
        </div>
        <div className="deck-flow-rail">
          {["Patient action", "DAT photo", "Grok JSON", "3s HUD", "FHIR lane"].map(
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
          <p>FHIR-ready event generated.</p>
        </article>
      </section>

      <section className="deck-band architecture-band" id="architecture">
        <div>
          <span className="deck-kicker">Architecture</span>
          <h2>The capture lasts seconds. The patient owns the memory.</h2>
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
          <h2>Three minutes, built around what judges care about.</h2>
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
