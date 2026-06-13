// Health Risk Intelligence Layer — FHIR R4 CarePlan generator.
//
// Deterministically turns a RiskReport into a valid, lightweight FHIR R4
// CarePlan resource. No LLM involved, so the shape is always well-formed.
// This is a SEPARATE resource from the existing Observation Bundle in
// `@/lib/fhir.ts`; it does not modify or depend on that output.
//
// Validate against a real validator (HAPI / validator.fhir.org) before
// trusting it. Demo-safe synthetic data only — not a medical diagnosis.

import { randomUUID } from "node:crypto";
import type { RiskReport } from "@/lib/risk-engine";

// Loose R4 typing on purpose: we want a valid JSON shape, not a full type system.
export type FhirCarePlan = Record<string, unknown> & {
  resourceType: "CarePlan";
  status: string;
  intent: string;
};

type CarePlanOptions = {
  userId: string;
  profileName?: string;
  effectiveDateTime?: string;
};

/**
 * Convert a RiskReport into a FHIR R4 CarePlan. Each flagged risk becomes a
 * CarePlan.activity entry; the aggregate score and a safety disclaimer ride
 * along as an extension and a note.
 */
export function toFhirCarePlan(
  risk: RiskReport,
  options: CarePlanOptions,
): FhirCarePlan {
  const { userId } = options;
  const effectiveDateTime = options.effectiveDateTime ?? new Date().toISOString();
  const profileName = options.profileName ?? "Synthetic Carl";
  // Stable, synthetic patient reference derived from the userId.
  const patientRef = `urn:uuid:${userId}`;

  const hasRisks = risk.risks.length > 0;

  return {
    resourceType: "CarePlan",
    id: randomUUID(),
    status: "active", // R4 required
    intent: "plan", // R4 required
    title: "Itadaki Health — dietary trend coaching plan",
    description: hasRisks
      ? "Rule-based coaching context generated from recent meal trends. Not a medical diagnosis."
      : "No dietary trend risks flagged from recent meals. Coaching context only, not a medical diagnosis.",
    category: [
      {
        text: "Dietary trend coaching",
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "182922004",
            display: "Dietary regime",
          },
        ],
      },
    ],
    subject: {
      reference: patientRef,
      display: profileName,
    },
    created: effectiveDateTime,
    period: { start: effectiveDateTime },
    // Aggregate 0–100 risk score carried as a vendor extension.
    extension: [
      {
        url: "https://itadaki.health/fhir/risk-score",
        valueInteger: risk.score,
      },
    ],
    // One activity per flagged risk. R4: activity.detail.status is required
    // when detail is present.
    activity: hasRisks
      ? risk.risks.map((description) => ({
          detail: {
            status: "not-started",
            kind: "ServiceRequest",
            description,
          },
        }))
      : [
          {
            detail: {
              status: "completed",
              kind: "ServiceRequest",
              description: "Continue current meal pattern; no trend risks flagged.",
            },
          },
        ],
    note: [
      {
        text: `Rule-based risk score ${risk.score}/100. Synthetic data. This is coaching context, not medical advice, diagnosis, or dosing guidance.`,
      },
    ],
  };
}
