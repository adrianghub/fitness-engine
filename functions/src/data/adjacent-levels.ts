import type { ChallengeLevel } from "@/types/models";

export const ADJACENT_LEVELS: Record<ChallengeLevel, ChallengeLevel[]> = {
  beginner: ["beginner", "intermediate"],
  intermediate: ["beginner", "intermediate", "advanced"],
  advanced: ["intermediate", "advanced"],
};
