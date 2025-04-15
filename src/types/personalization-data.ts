import type { FitnessGoal, UserLevel } from "@/types/models";

import type { Equipment } from "@/types/models";

export interface PersonalizationData {
  displayName: string;
  level: UserLevel;
  equipment: Equipment[];
  fitnessGoals: FitnessGoal[];
  goalsDescription: string;
}
