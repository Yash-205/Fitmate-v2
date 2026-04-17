// ─────────────────────────────────────────────────────────
// Frontend types — Must mirror Zod + Mongoose schema exactly
// ─────────────────────────────────────────────────────────

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  intensity?: string;
  notes?: string;
}

export interface DayPlan {
  day: string;
  date: string;
  focus: string;
  isRestDay: boolean;
  dailyObjective?: string;
  warmup?: Exercise[];
  exercises: Exercise[];
  cooldown?: Exercise[];
}

export interface MesoPhase {
  name: string;
  goal: string;
  focus: string;
  durationWeeks: number;
  startDate: string;
  endDate: string;
}

export interface WorkoutPlan {
  _id: string;
  goal: string;
  splitType: string;
  experienceLevel: string;
  overarchingStrategy: string;
  currentPhase: string;
  weeklyFrequency: number;
  mesoPhases: MesoPhase[];
  schedule: DayPlan[];
  progressionRule: string;
  deloadStrategy: string;
  completedDays: number;
  createdAt: string;
}
