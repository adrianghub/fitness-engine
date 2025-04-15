import type { Equipment, UserLevel } from "@/types/models";
import type { PersonalizationData } from "@/types/personalization-data";
import {
  Dumbbell,
  Flame,
  PersonStanding,
  Space,
  Sparkles,
  Spline,
  TextCursor,
  Trophy,
  Weight,
  type LucideIcon,
} from "lucide-react";

export const TOTAL_STEPS = 4;

export const FITNESS_LEVELS: { value: UserLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const AVAILABLE_EQUIPMENT: {
  value: Equipment;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "bodyweight", label: "Bodyweight Only", icon: PersonStanding },
  { value: "resistance-bands", label: "Resistance Bands", icon: Spline },
  { value: "barbell", label: "Barbell", icon: Weight },
  { value: "dumbbells", label: "Dumbbells", icon: Dumbbell },
  { value: "pull-up-bar", label: "Pull-up Bar", icon: Space },
  { value: "dip-bars", label: "Dip Bars", icon: TextCursor },
];

export const exercisesByLevel = {
  beginner: {
    icon: Flame,
    color: "text-blue-500",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    exercises: [
      "Bodyweight Squats",
      "Push-ups (Modified)",
      "Walking or Light Jogging",
      "Basic Planks",
    ],
  },
  intermediate: {
    icon: Trophy,
    color: "text-purple-500",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
    exercises: [
      "Barbell Squats",
      "Pull-ups",
      "HIIT Training",
      "Advanced Core Work",
    ],
  },
  advanced: {
    icon: Sparkles,
    color: "text-amber-500",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50",
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
