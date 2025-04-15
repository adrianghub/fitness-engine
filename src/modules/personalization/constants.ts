import type { Equipment, UserLevel } from "@/types/models";
import type { PersonalizationData } from "@/types/personalization-data";

export const TOTAL_STEPS = 4;

export const FITNESS_LEVELS: { value: UserLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const AVAILABLE_EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: "bodyweight", label: "Bodyweight Only" },
  { value: "resistance-bands", label: "Resistance Bands" },
  { value: "barbell", label: "Barbell" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "pull-up-bar", label: "Pull-up Bar" },
  { value: "dip-bars", label: "Dip Bars" },
];

export const exercisesByLevel = {
  beginner: {
    exercises: [
      "Bodyweight Squats",
      "Push-ups (Modified)",
      "Walking or Light Jogging",
      "Basic Planks",
    ],
  },
  intermediate: {
    exercises: [
      "Barbell Squats",
      "Pull-ups",
      "HIIT Training",
      "Advanced Core Work",
    ],
  },
  advanced: {
    exercises: [
      "Olympic Lifts",
      "Muscle-ups",
      "Complex Circuits",
      "Sport-specific Training",
    ],
  },
};

export const SUGGESTED_GOALS = [
  "Build basic strength and endurance",
  "Learn proper exercise form",
  "Establish consistent workout routine",
  "Improve overall fitness level",
];

export const STEP_FIELDS: Record<number, Array<keyof PersonalizationData>> = {
  1: ["displayName"],
  2: ["level"],
  3: ["equipment"],
  4: ["fitnessGoals", "goalsDescription"],
};
