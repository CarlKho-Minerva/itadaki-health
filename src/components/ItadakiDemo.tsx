"use client";

import { motion } from "framer-motion";
import { ChangeEvent, useRef, useState } from "react";
import { MealAnalysis, createMockAnalysis, getScenario } from "@/lib/itadaki";

type TranscribePayload = {
  text: string;
  triggered: boolean;
  error?: string;
};

type LogPayload = {
  ok: boolean;
  csvRow: string;
  log?: {
    id: string;
  };
  path?: string;
  error?: string;
};

const fallback = createMockAnalysis(getScenario("sweetgreen-harvest"));
const csvHeader = "timestamp,source,triggered,transcript,meal_name,calories,image_label\n";

export default function ItadakiDemo() {
  const [transcript, setTranscript] = useState("");
  const [triggered, setTriggered] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis>(fallback);
  const [csvRows, setCsvRows] = useState<string[]>([]);
  const [status, setStatus] = useState("Ready. Say itadakimasu, then add a food image.");
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [logPath, setLogPath] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calories = analysis.nutrition.calories.value;

  async function recordTrigger() {
    setStatus("Listening for itadakimasu...");
    setRecording(true);
    setTranscript("");
    setTriggered(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        await transcribe(blob);
      };

      recorder.start();
      window.setTimeout(() => recorder.stop(), 2600);
    } catch (error) {
      setRecording(false);
      setStatus(error instanceof Error ? error.message : "Microphone unavailable.");
    }
  }

  async function transcribe(blob: Blob) {
    try {
      const form = new FormData();
      form.append("language", "ja");
      form.append("file", blob, "itadakimasu.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });
      const payload = (await response.json()) as TranscribePayload;

      setTranscript(payload.text || "");
      setTriggered(Boolean(payload.triggered));
      setStatus(
        payload.triggered
          ? "Trigger caught. Add the food image."
          : payload.error || "Trigger not caught. You can tap Trigger for the demo.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Transcription failed.");
    } finally {
      setRecording(false);
    }
  }

  function manualTrigger() {
    setTriggered(true);
    setTranscript("Itadakimasu");
    setStatus("Manual trigger set. Add the food image.");
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result));
      setStatus("Image ready. Estimate calories.");
    };
    reader.readAsDataURL(file);
  }

  function useSampleImage() {
    setImageData(null);
    setStatus("Using sample food image. Estimate calories.");
  }

  async function estimateCalories() {
    setAnalyzing(true);
    setStatus("Estimating calories...");

    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "sweetgreen-harvest",
          ritual: transcript || "itadakimasu",
          mealText:
            "Minimal MVP: return only practical food identification and calorie estimate for a small glasses UI.",
          imageData,
        }),
      });

      const payload = (await response.json()) as { analysis: MealAnalysis; mode: string };
      const nextAnalysis = payload.analysis || fallback;
      setAnalysis(nextAnalysis);
      setStatus(`Calories estimated via ${payload.mode}. Logging CSV row...`);
      await logMeal(nextAnalysis);
    } catch (error) {
      setAnalysis(fallback);
      setStatus(error instanceof Error ? error.message : "Analysis failed; fallback shown.");
      await logMeal(fallback);
    } finally {
      setAnalyzing(false);
    }
  }

  async function logMeal(nextAnalysis: MealAnalysis) {
    const response = await fetch("/api/log-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "judge-console",
        transcript,
        triggered,
        mealName: nextAnalysis.mealName,
        calories: nextAnalysis.nutrition.calories.value,
        protein: nextAnalysis.nutrition.protein.value,
        carbs: nextAnalysis.nutrition.carbs.value,
        fat: nextAnalysis.nutrition.fat.value,
        imageLabel: imageData ? "uploaded-image" : "sample-image",
        thumbnailDataUrl: imageData || undefined,
        uncertainty: nextAnalysis.uncertainty,
        note: "Browser companion log",
      }),
    });

    const payload = (await response.json()) as LogPayload;
    setCsvRows((rows) => [payload.csvRow, ...rows].slice(0, 6));
    setLogPath(payload.path || "");
    setStatus(payload.ok ? "Logged to CSV." : payload.error || "CSV row created in browser.");
  }

  function downloadCsv() {
    const blob = new Blob([csvHeader, ...csvRows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "itadaki-meals.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mvp-shell">
      <section className="mvp-hero">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="brand-row">
            <span className="apple-mark">●</span>
            <strong>Itadaki</strong>
          </div>
          <h1>Say itadakimasu. See the calories.</h1>
          <p>
            A tiny Meta Ray-Ban Display MVP: voice trigger, food image, calorie estimate,
            CSV log.
          </p>
        </motion.div>

        <motion.div
          className="phone-shell"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.42 }}
        >
          <div className="phone-top">
            <span>9:41</span>
            <span>Itadaki</span>
          </div>
          <div className="photo-stage">
            {imageData ? <div style={{ backgroundImage: `url(${imageData})` }} /> : null}
            {!imageData ? <span>Sample food image</span> : null}
          </div>
          <div className="calorie-card">
            <span>Calories</span>
            <strong>{calories}</strong>
          </div>
          <div className="mini-macros">
            <span>{analysis.nutrition.protein.value}g protein</span>
            <span>{analysis.nutrition.carbs.value}g carbs</span>
            <span>{analysis.nutrition.fat.value}g fat</span>
          </div>
        </motion.div>
      </section>

      <section className="mvp-grid">
        <div className="mvp-card steps-card">
          <div className="step-row">
            <span>1</span>
            <div>
              <h2>Trigger</h2>
              <p>Record a short phrase. xAI STT stays behind the server.</p>
            </div>
          </div>
          <div className="button-row">
            <button className="dark-button" onClick={recordTrigger} disabled={recording}>
              {recording ? "Listening..." : "Listen"}
            </button>
            <button className="light-button" onClick={manualTrigger}>
              Trigger
            </button>
          </div>
          <div className={triggered ? "status-pill good" : "status-pill"}>
            {triggered ? "Trigger caught" : "Waiting"}
          </div>
          <p className="transcript">{transcript || "Transcript appears here."}</p>
        </div>

        <div className="mvp-card steps-card">
          <div className="step-row">
            <span>2</span>
            <div>
              <h2>Image</h2>
              <p>Upload or capture a food image. If the glasses cannot open camera, use sample.</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={onFileChange}
          />
          <div className="button-row">
            <button className="dark-button" onClick={() => fileInputRef.current?.click()}>
              Photo
            </button>
            <button className="light-button" onClick={useSampleImage}>
              Sample
            </button>
          </div>
          <button className="primary-run" onClick={estimateCalories} disabled={analyzing}>
            {analyzing ? "Estimating..." : "Estimate Calories"}
          </button>
        </div>

        <div className="mvp-card result-card-light">
          <span>Calories</span>
          <strong>{calories}</strong>
          <p>{analysis.mealName}</p>
          <small>{status}</small>
        </div>

        <div className="mvp-card log-card">
          <div className="step-row">
            <span>3</span>
            <div>
              <h2>CSV Log</h2>
              <p>{logPath || "Rows are stored in browser and posted to /api/log-meal."}</p>
            </div>
          </div>
          <pre>{csvRows[0] || "No rows yet."}</pre>
          <button className="light-button" onClick={downloadCsv} disabled={!csvRows.length}>
            Download CSV
          </button>
        </div>
      </section>

      <section className="docs-card">
        <h2>Meta Ray-Ban setup</h2>
        <ol>
          <li>Deploy the app to a public HTTPS URL.</li>
          <li>Open Meta AI app on your phone.</li>
          <li>Go to Devices, Display Glasses settings, App connections, Web apps.</li>
          <li>Add: https://itadaki-health.vercel.app/glasses/index.html</li>
          <li>Use D-pad/Neural Band gestures: arrows move, Enter selects, Escape goes back.</li>
        </ol>
        <a className="logs-link" href="/logs">
          Open Recently Logged
        </a>
      </section>
    </main>
  );
}
