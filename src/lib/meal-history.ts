// Health Risk Intelligence Layer — meal history store.
//
// Additive, hackathon-safe in-memory store. Keeps the last N meals per user so
// the rule-based risk engine can look at a short trend. This does NOT touch the
// existing meal analysis or FHIR observation logic — it is a separate side store.
//
// In-memory is the simplest working option for a demo. State is stashed on
// globalThis so it survives Next.js dev hot-reloads within a single server
// process. It is intentionally not durable: restart the server and it resets.

export type MealRecord = {
  userId: string;
  calories: number; // kcal
  protein: number; // g
  sugar: number; // g
  timestamp: string; // ISO-8601
};

const MAX_MEALS_PER_USER = 5;

type MealStore = Map<string, MealRecord[]>;

// Reuse one store across hot reloads / route invocations in the same process.
const globalForMeals = globalThis as unknown as { __itadakiMealStore?: MealStore };
const store: MealStore = globalForMeals.__itadakiMealStore ?? new Map();
globalForMeals.__itadakiMealStore = store;

/**
 * Record a meal for a user and return that user's recent history (newest last),
 * capped at the most recent MAX_MEALS_PER_USER entries.
 */
export function recordMeal(meal: MealRecord): MealRecord[] {
  const history = store.get(meal.userId) ?? [];
  history.push(meal);
  // Keep only the last N meals.
  const trimmed = history.slice(-MAX_MEALS_PER_USER);
  store.set(meal.userId, trimmed);
  return trimmed;
}

/**
 * Return up to `limit` of the user's most recent meals (newest last).
 */
export function getRecentMeals(userId: string, limit = MAX_MEALS_PER_USER): MealRecord[] {
  const history = store.get(userId) ?? [];
  return history.slice(-limit);
}

/** Clear one user's history, or the whole store. Useful for local testing. */
export function resetMealHistory(userId?: string): void {
  if (userId) {
    store.delete(userId);
  } else {
    store.clear();
  }
}
