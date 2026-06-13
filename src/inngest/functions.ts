import { inngest } from "./client";

export const triggerStarted = inngest.createFunction(
  {
    id: "trigger-started",
    name: "Ritual trigger started",
    triggers: [{ event: "trigger.started" }],
  },
  async ({ event, step }) => {
    const payload = await step.run("record ritual", async () => event.data);
    return { ok: true, payload };
  },
);

export const mealAnalyzed = inngest.createFunction(
  {
    id: "meal-analyzed",
    name: "Meal analyzed",
    triggers: [{ event: "meal.analyzed" }],
  },
  async ({ event, step }) => {
    const payload = await step.run("record meal estimate", async () => event.data);
    return { ok: true, payload };
  },
);

export const timelineUpdated = inngest.createFunction(
  {
    id: "timeline-updated",
    name: "Meal timeline updated",
    triggers: [{ event: "timeline.updated" }],
  },
  async ({ event, step }) => {
    const payload = await step.run("record timeline entry", async () => event.data);
    return { ok: true, payload };
  },
);

export const careContextGenerated = inngest.createFunction(
  {
    id: "care-context-generated",
    name: "Awareness context generated",
    triggers: [{ event: "care_context.generated" }],
  },
  async ({ event, step }) => {
    const payload = await step.run("record awareness question", async () => event.data);
    return { ok: true, payload };
  },
);

// Health Risk Intelligence Layer: records the generated FHIR CarePlan so the
// rule-based risk trend is visible in the Inngest trace alongside the rest of
// the pipeline. Additive — it does not alter the existing functions above.
export const carePlanGenerated = inngest.createFunction(
  {
    id: "care-plan-generated",
    name: "Risk CarePlan generated",
    triggers: [{ event: "care_plan.generated" }],
  },
  async ({ event, step }) => {
    const payload = await step.run("record care plan", async () => event.data);
    return { ok: true, payload };
  },
);

export const functions = [
  triggerStarted,
  mealAnalyzed,
  timelineUpdated,
  careContextGenerated,
  carePlanGenerated,
];
