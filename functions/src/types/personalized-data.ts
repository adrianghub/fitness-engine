import type { User } from "@/types/models";

export interface PersonalizationData {
  displayName: string;
  level: User["level"];
  equipment: string[];
  goalsDescription?: string;
}
