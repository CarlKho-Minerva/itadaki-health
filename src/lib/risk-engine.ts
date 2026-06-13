// Health Risk Intelligence Layer — rule-based risk engine.
//
// Pure, deterministic, NO LLM and NO medical diagnosis. It inspects the last
// 3–5 meals for a user and flags simple dietary trends. This is coaching
// context only, in line with the project's safety note.
//
// Output contract: { risks: string[]; score: number }

import type { MealRecord } from "@/lib/meal-history";

export type RiskReport = {
  risks: string[];
  score: number; // 0–100, higher = more flagged trends
};

// Demo thresholds. Tuned so the sample scenarios in the repo can trip them
// across a short streak of meals. These are heuristics, not clinical cutoffs.
export const RISK_THRESHOLDS = {
  highCalorieAvg: 700, // avg kcal across the window
  lowProteinAvg: 25, // avg g protein across the window
  highSugarAvg: 50, // avg g sugar across the window
  consecutiveHighCalorie: 750, // a single meal counts as "high calorie"
  consecutiveCount: 2, // this many in a row trips the repeated pattern rule
};

// Per-rule contribution to the 0–100 score.
const RISK_WEIGHTS = {
  highCalorie: 30,
  lowProtein: 25,
  repeatedPattern: 30,
  highSugar: 15,
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Longest run of consecutive meals at/above the high-calorie threshold. */
function longestHighCalorieStreak(meals: MealRecord[]): number {
  let longest = 0;
  let current = 0;
  for (const meal of meals) {
    if (meal.calories >= RISK_THRESHOLDS.consecutiveHighCalorie) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

/**
 * Analyze the most recent meals (expects 3–5; works with fewer) and return the
 * flagged risks plus an aggregate score.
 */
export function assessRisk(meals: MealRecord[]): RiskReport {
  const risks: string[] = [];
  let score = 0;

  if (meals.length === 0) {
    return { risks, score };
  }

  const avgCalories = average(meals.map((m) => m.calories));
  const avgProtein = average(meals.map((m) => m.protein));
  const avgSugar = average(meals.map((m) => m.sugar));

  if (avgCalories > RISK_THRESHOLDS.highCalorieAvg) {
    risks.push(
      `High calorie trend: average ${Math.round(avgCalories)} kcal across last ${meals.length} meals (threshold ${RISK_THRESHOLDS.highCalorieAvg}).`,
    );
    score += RISK_WEIGHTS.highCalorie;
  }

  if (avgProtein < RISK_THRESHOLDS.lowProteinAvg) {
    risks.push(
      `Low protein trend: average ${Math.round(avgProtein)} g across last ${meals.length} meals (threshold ${RISK_THRESHOLDS.lowProteinAvg}).`,
    );
    score += RISK_WEIGHTS.lowProtein;
  }

  const streak = longestHighCalorieStreak(meals);
  if (streak >= RISK_THRESHOLDS.consecutiveCount) {
    risks.push(
      `Repeated unhealthy pattern: ${streak} consecutive meals at/above ${RISK_THRESHOLDS.consecutiveHighCalorie} kcal.`,
    );
    score += RISK_WEIGHTS.repeatedPattern;
  }

  if (avgSugar > RISK_THRESHOLDS.highSugarAvg) {
    risks.push(
      `High sugar trend: average ${Math.round(avgSugar)} g across last ${meals.length} meals (threshold ${RISK_THRESHOLDS.highSugarAvg}).`,
    );
    score += RISK_WEIGHTS.highSugar;
  }

  return { risks, score: Math.min(100, score) };
}
