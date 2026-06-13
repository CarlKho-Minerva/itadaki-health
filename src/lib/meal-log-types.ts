export type MealLog = {
  id: string;
  timestamp: string;
  source: string;
  status: "pending" | "logged";
  triggered: boolean;
  transcript: string;
  mealName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageLabel?: string;
  thumbnailDataUrl?: string;
  uncertainty?: string;
  mode?: string;
  note?: string;
};

export type MealLogInput = Partial<Omit<MealLog, "id" | "timestamp">> & {
  timestamp?: string;
};
