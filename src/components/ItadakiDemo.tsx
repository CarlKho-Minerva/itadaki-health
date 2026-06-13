"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  MealAnalysis,
  citations,
  createMockAnalysis,
  getScenario,
  mealScenarios,
  pitchTimeline,
  syntheticProfile,
} from "@/lib/itadaki";

type DemoMode = "sweetgreen-harvest" | "mendo-turkey" | "manual";

const traceLabels = [
  "trigger.started",
  "meal.analyzed",
  "timeline.updated",
  "care_context.generated",
];

export default function ItadakiDemo() {
  const [mode, setMode] = useState<DemoMode>("sweetgreen-harvest");
  const [mealNote, setMealNote] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis>(() =>
    createMockAnalysis(getScenario("sweetgreen-harvest")),
  );
  const [activeTrace, setActiveTrace] = useState(4);
  const [loading, setLoading] = useState(false);
  const [pitchMode, setPitchMode] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scenario = useMemo(() => getScenario(mode), [mode]);

  async function runAnalysis(nextMode = mode) {
    const nextScenario = getScenario(nextMode);
    setMode(nextMode);
    setLoading(true);
    setError("");
    setActiveTrace(1);

    const traceTimer = window.setInterval(() => {
      setActiveTrace((value) => Math.min(value + 1, traceLabels.length));
    }, 520);

    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: nextScenario.id,
          mealText: mealNote,
          imageData,
          ritual: "itadakimasu",
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with ${response.status}`);
      }

      const payload = (await response.json()) as { analysis: MealAnalysis };
      setAnalysis(payload.analysis);
      setActiveTrace(traceLabels.length);
    } catch (err) {
      const fallback = createMockAnalysis(nextScenario, "mock-after-api-error");
      setAnalysis(fallback);
      setError(err instanceof Error ? err.message : "Analysis failed; using demo fallback.");
      setActiveTrace(traceLabels.length);
    } finally {
      window.clearInterval(traceTimer);
      setLoading(false);
    }
  }

  function onScenarioChange(nextMode: DemoMode) {
    const nextScenario = getScenario(nextMode);
    setMode(nextMode);
    setAnalysis(createMockAnalysis(nextScenario));
    setError("");
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setMode("manual");
      setImageData(String(reader.result));
      setAnalysis(createMockAnalysis(getScenario("manual")));
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="app-shell">
      <section className="hero-band" aria-label="Itadaki Health demo">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="eyebrow">Autonomous Healthcare Hackathon - June 13, 2026</div>
          <h1>Itadaki Health</h1>
          <p className="lede">
            Cal AI made food tracking easy. Itadaki Health makes it consented,
            wearable, and medically contextual.
          </p>
          <div className="hero-actions">
            <button className="button primary" onClick={() => runAnalysis()}>
              Say Itadakimasu
            </button>
            <button className="button secondary" onClick={() => setPitchMode((value) => !value)}>
              {pitchMode ? "Close Pitch" : "Pitch Mode"}
            </button>
            <a className="button ghost" href="/glasses/index.html" target="_blank">
              Open Glasses App
            </a>
          </div>
        </motion.div>

        <motion.div
          className="glasses-frame"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.55 }}
        >
          <div className="lens">
            <div className="lens-topline">Meta Display Web App</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${analysis.mealName}-${analysis.source}`}
                className="hud-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24 }}
              >
                <span className="hud-kicker">Intentional log?</span>
                <strong>{analysis.mealName}</strong>
                <p>{analysis.clinicalContext.flags[0]}</p>
                <div className="hud-actions">
                  <span>Analyze</span>
                  <span>Skip</span>
                  <span>Ask doctor</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      <section className="workbench">
        <div className="panel controls-panel">
          <div className="section-label">Meal Input</div>
          <div className="segmented" role="tablist" aria-label="Meal presets">
            {mealScenarios.map((item) => (
              <button
                key={item.id}
                className={item.id === mode ? "active" : ""}
                onClick={() => onScenarioChange(item.id as DemoMode)}
              >
                {item.name.replace("Sweetgreen ", "").replace("Mendocino Farms ", "")}
              </button>
            ))}
          </div>

          <div className="meal-visual">
            {imageData ? (
              <div
                className="image-preview"
                aria-label="Uploaded meal preview"
                style={{ backgroundImage: `url(${imageData})` }}
              />
            ) : (
              <div className={`plate-illustration ${scenario.id}`}>
                <span className="grain" />
                <span className="protein" />
                <span className="greens" />
                <span className="accent-one" />
                <span className="accent-two" />
              </div>
            )}
          </div>

          <p className="meal-description">{scenario.description}</p>
          <textarea
            value={mealNote}
            onChange={(event) => setMealNote(event.target.value)}
            placeholder="Optional meal note for Grok, e.g. dressing on side, skipped chips, shared with teammate."
          />
          <div className="control-row">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              hidden
            />
            <button className="button secondary" onClick={() => fileInputRef.current?.click()}>
              Upload Photo
            </button>
            <button className="button primary" onClick={() => runAnalysis("manual")}>
              Analyze Context
            </button>
          </div>
          {error ? <p className="inline-warning">{error}</p> : null}
        </div>

        <div className="panel result-panel">
          <div className="section-label">Health Passport Context</div>
          <h2>{analysis.mealName}</h2>
          <div className="metric-grid">
            {Object.entries(analysis.nutrition).map(([key, value]) => (
              <motion.div
                className="metric-card"
                key={key}
                initial={{ opacity: 0.5, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                <span>{key}</span>
                <strong>
                  {value.value} {value.unit}
                </strong>
                <small>{value.range}</small>
              </motion.div>
            ))}
          </div>

          <div className="insight-card">
            <span>Personal context</span>
            <p>{analysis.clinicalContext.whyItMatters}</p>
          </div>

          <div className="ask-card">
            <span>Ask your clinician</span>
            <p>{analysis.clinicianQuestion}</p>
          </div>
        </div>

        <div className="panel trace-panel">
          <div className="section-label">Agent Trace</div>
          <div className="trace-list">
            {analysis.trace.map((step, index) => (
              <motion.div
                key={step.label}
                className={`trace-item ${index < activeTrace ? "done" : ""}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <span className="trace-dot" />
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="button secondary wide" onClick={() => runAnalysis()}>
            {loading ? "Running..." : "Replay Ritual"}
          </button>
        </div>
      </section>

      <section className="evidence-band">
        <div className="panel story-panel">
          <div className="section-label">Why This Beats A Calorie Clone</div>
          <div className="comparison-grid">
            <div>
              <span>Cal AI</span>
              <p>Photo, calories, macros, streaks, subscription habit.</p>
            </div>
            <div>
              <span>Itadaki Health</span>
              <p>Intent phrase, wearable HUD, Health Passport context, clinician question.</p>
            </div>
          </div>
        </div>

        <div className="panel profile-panel">
          <div className="section-label">Synthetic Profile</div>
          <h2>{syntheticProfile.name}</h2>
          <p>{syntheticProfile.note}</p>
          <div className="tag-row">
            {[...syntheticProfile.conditions, ...syntheticProfile.goals.slice(0, 2)].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {pitchMode ? (
          <motion.section
            className="pitch-drawer"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
          >
            <div>
              <div className="section-label">3-Minute Pitch</div>
              <div className="pitch-grid">
                {pitchTimeline.map((item) => (
                  <div className="pitch-card" key={item.time}>
                    <span>{item.time}</span>
                    <strong>{item.title}</strong>
                    <p>{item.line}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="section-label">Citations</div>
              <div className="citation-list">
                {citations.map((citation) => (
                  <a href={citation.href} target="_blank" key={citation.href}>
                    <strong>{citation.label}</strong>
                    <span>{citation.claim}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
