// Health Risk Intelligence Layer — integration glue.
//
// Single entry point that runs the additive pipeline:
//   store meal -> run risk engine -> generate FHIR R4 CarePlan
// It returns the pieces so callers can attach them to the demo response and
// later health-record export. It deliberately does NOT send events
// or touch the existing meal analysis or FHIR Observation logic.

import type { MealAnalysis } from "@/lib/itadaki";
import { recordMeal, type MealRecord } from "@/lib/meal-history";
import { assessRisk, type RiskReport } from "@/lib/risk-engine";
import { toFhirCarePlan, type FhirCarePlan } from "@/lib/careplan";

export const DEFAULT_USER_ID = "synthetic-carl";

// The existing MealAnalysis tracks carbs but not sugar specifically. For the
// demo we estimate sugar as a fraction of carbohydrates when an explicit value
// isn't supplied. Clearly a heuristic, not a measurement.
const SUGAR_FROM_CARBS_RATIO = 0.35;

export type RiskIntelligence = {
  meal: MealRecord;
  recentMeals: MealRecord[];
  risk: RiskReport;
  carePlan: FhirCarePlan;
};

/** Build a stored MealRecord from the existing analysis output. */
export function mealRecordFromAnalysis(
  analysis: MealAnalysis,
  userId: string = DEFAULT_USER_ID,
  sugarOverride?: number,
  timestamp: string = new Date().toISOString(),
): MealRecord {
  const { nutrition } = analysis;
  const sugar =
    typeof sugarOverride === "number"
      ? sugarOverride
      : Math.round(nutrition.carbs.value * SUGAR_FROM_CARBS_RATIO);
  return {
    userId,
    calories: nutrition.calories.value,
    protein: nutrition.protein.value,
    sugar,
    timestamp,
  };
}

/**
 * Run the full risk-intelligence pipeline for one meal and return the result.
 * `profileName` is used as the CarePlan subject display.
 */
export function runRiskIntelligence(
  meal: MealRecord,
  profileName?: string,
): RiskIntelligence {
  const recentMeals = recordMeal(meal);
  const risk = assessRisk(recentMeals);
  const carePlan = toFhirCarePlan(risk, {
    userId: meal.userId,
    profileName,
    effectiveDateTime: meal.timestamp,
  });
  return { meal, recentMeals, risk, carePlan };
}
