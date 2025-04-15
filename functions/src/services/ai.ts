import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import * as logger from "firebase-functions/logger";
import { genkit } from "genkit";
import { generateFitnessPlanPrompt } from "../data/prompts/fitness-plan";
import type { ChallengeTemplate } from "../types/models";
import type { PersonalizationData } from "../types/personalized-data";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

const modelMetadata = {
  model: gemini15Flash,
  temperature: 0.7,
};

interface AIGeneratedPlan {
  goals: string[];
  recommendedChallenges: string[];
}

export async function generatePersonalizedPlan(
  data: PersonalizationData,
  availableChallenges: ChallengeTemplate[]
): Promise<AIGeneratedPlan> {
  try {
    const prompt = generateFitnessPlanPrompt(data, availableChallenges);

    const { text } = await ai.generate([
      {
        text: prompt,
        metadata: modelMetadata,
      },
    ]);

    const plan = JSON.parse(
      text.match(/<fitness-plan>(.*?)<\/fitness-plan>/)?.[1] ?? "{}"
    ) as AIGeneratedPlan;

    if (
      !Array.isArray(plan.goals) ||
      !Array.isArray(plan.recommendedChallenges)
    ) {
      throw new Error("Invalid AI response format");
    }

    plan.goals = plan.goals.slice(0, 3);
    plan.recommendedChallenges = plan.recommendedChallenges.slice(0, 10);

    return plan;
  } catch (error) {
    logger.error("Error generating personalized plan:", error);
    throw error;
  }
}
