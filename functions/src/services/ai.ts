import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import * as logger from "firebase-functions/logger";
import { genkit } from "genkit";
import { generateFitnessPlanPrompt } from "../data/prompts/fitness-plan";
import type { ChallengeTemplate } from "../types/models";
import type { PersonalizationData } from "../types/personalization-data";

interface AIGeneratedPlan {
  goals: string[];
  recommendedChallenges: string[];
}

export async function generatePersonalizedPlan(
  data: PersonalizationData,
  availableChallenges: (ChallengeTemplate & { id: string })[]
): Promise<AIGeneratedPlan> {
  try {
    const prompt = generateFitnessPlanPrompt(data, availableChallenges);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const ai = genkit({
      plugins: [
        googleAI({
          apiKey: process.env.GEMINI_API_KEY,
        }),
      ],
      model: gemini15Flash,
    });

    const modelMetadata = {
      temperature: 0.7,
    };

    const { text } = await ai.generate([
      {
        text: prompt,
        metadata: modelMetadata,
      },
    ]);

    const plan = parseFitnessPlan(text);

    if (!plan) {
      throw new Error("Invalid plan format");
    }

    return plan;
  } catch (error) {
    logger.error("Error generating personalized plan:", error);
    throw error;
  }
}

function parseFitnessPlan(response: string): AIGeneratedPlan | null {
  const match = response.match(/<fitness-plan>([\s\S]*?)<\/fitness-plan>/);

  if (match && match[1]) {
    const jsonString = match[1].trim();
    try {
      const plan = JSON.parse(jsonString) as AIGeneratedPlan;

      if (
        plan &&
        Array.isArray(plan.goals) &&
        Array.isArray(plan.recommendedChallenges)
      ) {
        plan.goals = plan.goals.slice(0, 3);
        plan.recommendedChallenges = plan.recommendedChallenges.slice(0, 10);

        return plan;
      } else {
        console.error(
          "Parsed plan has invalid structure (goals, recommendedChallenges).",
          plan
        );
        return null;
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      console.error("String that was attempted to be parsed:", jsonString);
      return null;
    }
  } else {
    console.error("Content not found between <fitness-plan> tags.");
    return null;
  }
}
