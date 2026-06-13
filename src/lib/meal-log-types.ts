export type MealLogItem = {
  name: string;
  amount: string;
  confidence?: number;
};

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
  sodium?: number;
  imageLabel?: string;
  thumbnailDataUrl?: string;
  uncertainty?: string;
  audioBrief?: string;
  mode?: string;
  note?: string;
  calorieRange?: string;
  proteinRange?: string;
  carbsRange?: string;
  fatRange?: string;
  items?: MealLogItem[];
};

export type MealLogInput = Partial<Omit<MealLog, "id" | "timestamp">> & {
  timestamp?: string;
};
