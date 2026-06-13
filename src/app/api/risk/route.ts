// Health Risk Intelligence Layer — standalone test / simulation endpoint.
//
// Additive route. Lets you seed raw meals directly and inspect the rule-based
// risk report + generated FHIR R4 CarePlan without going through xAI meal
// analysis. Useful because a trend needs several meals, while one
// /api/analyze-meal call only stores one. Does not touch existing logic.
//
//   GET  /api/risk?userId=synthetic-carl        -> current report for a user
//   POST /api/risk { userId, calories, protein, sugar, timestamp? }
//                                               -> ingest one meal, get report
//   POST /api/risk { userId, reset: true }      -> clear a user's history

import {
  getRecentMeals,
  recordMeal,
  resetMealHistory,
  type MealRecord,
} from "@/lib/meal-history";
import { assessRisk } from "@/lib/risk-engine";
import { toFhirCarePlan } from "@/lib/careplan";
import { DEFAULT_USER_ID } from "@/lib/risk-intelligence";

export const runtime = "nodejs";

function report(userId: string) {
  const recentMeals = getRecentMeals(userId);
  const risk = assessRisk(recentMeals);
  const carePlan = toFhirCarePlan(risk, { userId });
  return { userId, recentMeals, risk, carePlan };
}

export async function GET(request: Request) {
  const userId =
    new URL(request.url).searchParams.get("userId") ?? DEFAULT_USER_ID;
  return Response.json(report(userId));
}

type RiskRequest = {
  userId?: string;
  calories?: number;
  protein?: number;
  sugar?: number;
  timestamp?: string;
  reset?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RiskRequest;
  const userId = body.userId ?? DEFAULT_USER_ID;

  if (body.reset) {
    resetMealHistory(userId);
    return Response.json({ ok: true, reset: userId });
  }

  const meal: MealRecord = {
    userId,
    calories: Number(body.calories ?? 0),
    protein: Number(body.protein ?? 0),
    sugar: Number(body.sugar ?? 0),
    timestamp: body.timestamp ?? new Date().toISOString(),
  };
  recordMeal(meal);

  return Response.json(report(userId));
}
