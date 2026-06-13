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
    name: "Health Passport timeline updated",
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
    name: "Care context generated",
    triggers: [{ event: "care_context.generated" }],
  },
  async ({ event, step }) => {
    const payload = await step.run("record clinician question", async () => event.data);
    return { ok: true, payload };
  },
);

export const functions = [
  triggerStarted,
  mealAnalyzed,
  timelineUpdated,
  careContextGenerated,
];
