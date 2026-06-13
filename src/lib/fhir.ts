import { randomUUID } from "node:crypto";
import type { MealAnalysis, NutritionMetric } from "@/lib/itadaki";

// Minimal FHIR R4 typing. We keep this loose on purpose: the goal is a valid
// JSON shape, not a full R4 type system. Validate output against a real
// validator (HAPI / inferno / validator.fhir.org) before trusting it.
type FhirResource = Record<string, unknown> & { resourceType: string };

type BundleEntry = {
  fullUrl: string;
  resource: FhirResource;
};

export type FhirBundle = {
  resourceType: "Bundle";
  type: "collection";
  timestamp: string;
  entry: BundleEntry[];
};

// LOINC where we are confident; otherwise text-only CodeableConcept (valid R4).
// UCUM units map directly from your NutritionMetric.unit.
const NUTRIENT_CODES: Record<
  keyof MealAnalysis["nutrition"],
  { loinc?: string; display: string }
> = {
  calories: { loinc: "9052-2", display: "Calorie intake total" },
  protein: { display: "Protein intake" },
  carbs: { display: "Carbohydrate intake" },
  fat: { display: "Fat intake" },
  sodium: { display: "Sodium intake" },
};

// "680-940" -> { low: 680, high: 940 }. Returns null if it isn't a clean range.
function parseRange(range: string): { low: number; high: number } | null {
  const match = range.match(/(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  return { low: Number(match[1]), high: Number(match[2]) };
}

function nutrientCode(key: keyof MealAnalysis["nutrition"]) {
  const def = NUTRIENT_CODES[key];
  return {
    text: def.display,
    ...(def.loinc
      ? {
          coding: [
            { system: "http://loinc.org", code: def.loinc, display: def.display },
          ],
        }
      : {}),
  };
}

function nutrientObservation(
  metric: NutritionMetric,
  key: keyof MealAnalysis["nutrition"],
  patientRef: string,
  effectiveDateTime: string,
): FhirResource {
  const range = parseRange(metric.range);
  return {
    resourceType: "Observation",
    status: "preliminary", // estimate, not measured -> not "final"
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "survey",
            display: "Survey",
          },
        ],
      },
    ],
    code: nutrientCode(key),
    subject: { reference: patientRef },
    effectiveDateTime,
    valueQuantity: {
      value: metric.value,
      unit: metric.unit,
      system: "http://unitsofmeasure.org",
      code: metric.unit, // kcal / g / mg are valid UCUM codes
    },
    ...(range
      ? {
          referenceRange: [
            {
              low: { value: range.low, unit: metric.unit, system: "http://unitsofmeasure.org", code: metric.unit },
              high: { value: range.high, unit: metric.unit, system: "http://unitsofmeasure.org", code: metric.unit },
              text: `Estimate range ${metric.range} ${metric.unit}`,
            },
          ],
        }
      : {}),
  };
}

/**
 * Deterministically convert internal MealAnalysis into a valid FHIR R4
 * collection Bundle. No LLM involved here -> output is always well-formed.
 */
export function toFhirBundle(
  analysis: MealAnalysis,
  effectiveDateTime: string = new Date().toISOString(),
): FhirBundle {
  const patientId = randomUUID();
  const patientUrn = `urn:uuid:${patientId}`;
  const entries: BundleEntry[] = [];

  // 1. Patient (synthetic profile)
  entries.push({
    fullUrl: patientUrn,
    resource: {
      resourceType: "Patient",
      id: patientId,
      active: true,
      name: [{ text: analysis.clinicalContext.profileName }],
    },
  });

  // 2. Consent — the "itadakimasu" intent moment
  entries.push({
    fullUrl: `urn:uuid:${randomUUID()}`,
    resource: {
      resourceType: "Consent",
      status: "active",
      scope: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/consentscope",
            code: "patient-privacy",
          },
        ],
      },
      category: [
        { coding: [{ system: "http://loinc.org", code: "59284-0", display: "Patient Consent" }] },
      ],
      patient: { reference: patientUrn },
      dateTime: effectiveDateTime,
      policyRule: { text: analysis.ritual },
    },
  });

  // 3. One Observation per nutrient, with estimate ranges
  (Object.keys(analysis.nutrition) as Array<keyof MealAnalysis["nutrition"]>).forEach((key) => {
    entries.push({
      fullUrl: `urn:uuid:${randomUUID()}`,
      resource: nutrientObservation(analysis.nutrition[key], key, patientUrn, effectiveDateTime),
    });
  });

  // 4. The meal itself as an Observation, food items as components
  entries.push({
    fullUrl: `urn:uuid:${randomUUID()}`,
    resource: {
      resourceType: "Observation",
      status: "preliminary",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "survey",
            },
          ],
        },
      ],
      code: { text: analysis.mealName },
      subject: { reference: patientUrn },
      effectiveDateTime,
      component: analysis.itemEstimate.map((item) => ({
        code: { text: item.name },
        valueString: item.amount,
        // confidence (0-1) carried as an extension on the component
        extension: [
          {
            url: "https://itadaki.health/fhir/confidence",
            valueDecimal: item.confidence,
          },
        ],
      })),
    },
  });

  // 5. Clinician question as a Communication
  entries.push({
    fullUrl: `urn:uuid:${randomUUID()}`,
    resource: {
      resourceType: "Communication",
      status: "preparation",
      subject: { reference: patientUrn },
      sent: effectiveDateTime,
      payload: [{ contentString: analysis.clinicianQuestion }],
    },
  });

  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: effectiveDateTime,
    entry: entries,
  };
}
