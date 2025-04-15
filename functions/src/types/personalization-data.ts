import type { Equipment, FitnessGoal, UserLevel } from "@/types/models";

export interface PersonalizationData {
  displayName: string;
  level: UserLevel;
  equipment: Equipment[];
  fitnessGoals: FitnessGoal[];
  goalsDescription?: string;
}
