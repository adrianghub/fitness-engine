export type ChallengeLevel = "beginner" | "intermediate" | "advanced" | "all";

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  level: ChallengeLevel;
  points: number;
  expectedTime: string;
}
