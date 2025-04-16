import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import * as logger from "firebase-functions/logger";
import { genkit } from "genkit";
import { generateFitnessGoalsPrompt } from "../data/prompts/fitness-goals";
import { generateFitnessPlanPrompt } from "../data/prompts/fitness-plan";
import type { ChallengeTemplate } from "../types/models";
import type { PersonalizationData } from "../types/personalization-data";
import { parseAIResponse } from "../utils/parseAIResponse";

interface AIGeneratedGoals extends Record<string, unknown> {
  goals: string[];
}

interface AIGeneratedChallenges extends Record<string, unknown> {
  recommendedChallenges: string[];
}

function parseGoals(response: string): string[] | null {
  try {
    return parseAIResponse<AIGeneratedGoals>(response, {
      tag: "fitness-goals",
      key: "goals",
      maxItems: 3,
    });
  } catch (error) {
    logger.error("Error parsing goals:", error);
    return null;
  }
}

function parseChallenges(response: string): string[] | null {
  try {
    return parseAIResponse<AIGeneratedChallenges>(response, {
      tag: "fitness-plan",
      key: "recommendedChallenges",
      maxItems: 5,
    });
  } catch (error) {
    logger.error("Error parsing challenges:", error);
    return null;
  }
}

export async function generatePersonalizedGoals(
  data: PersonalizationData
): Promise<string[]> {
  try {
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

    const prompt = generateFitnessGoalsPrompt(data);
    logger.debug("Generating fitness goals with prompt:", prompt);

    const { text } = await ai.generate([
      {
        text: prompt,
        metadata: { temperature: 0.7 },
      },
    ]);

    logger.debug("Raw AI response for goals:", text);
    const goals = parseGoals(text);
    logger.info("Parsed goals:", goals);

    return goals || [];
  } catch (error) {
    logger.error("Error generating personalized goals:", error);
    throw error;
  }
}

export async function generatePersonalizedChallenges(
  data: PersonalizationData,
  availableChallenges: (ChallengeTemplate & { id: string })[]
): Promise<string[]> {
  try {
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

    const prompt = generateFitnessPlanPrompt(data, availableChallenges);
    logger.debug("Generating personalized challenges with prompt:", prompt);

    const { text } = await ai.generate([
      {
        text: prompt,
        metadata: { temperature: 0.7 },
      },
    ]);

    logger.debug("Raw AI response for challenges:", text);
    const challenges = parseChallenges(text);
    logger.info("Parsed challenges:", challenges);

    return challenges || [];
  } catch (error) {
    logger.error("Error generating personalized challenges:", error);
    throw error;
  }
}
