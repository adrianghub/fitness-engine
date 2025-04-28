import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerate = vi.fn();
vi.mock("genkit", () => ({
  genkit: vi.fn(() => ({
    generate: mockGenerate,
  })),
}));

vi.mock("@genkit-ai/googleai", () => ({
  googleAI: vi.fn(),
  gemini15Flash: "mock-model-name",
}));

vi.mock("firebase-functions/logger", () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

import * as parseUtils from "../../utils/parseAIResponse";

import * as aiService from "../../services/ai";
import type { ChallengeTemplate } from "../../types/models";
import type { PersonalizationData } from "../../types/personalization-data";

describe("AI Service (services/ai.ts)", () => {
  const mockPersonalizationData: PersonalizationData = {
    level: "beginner",
    equipment: ["none", "resistance_bands"],
    fitnessGoals: ["weight_loss", "increase_stamina"],
    goalsDescription: "Chcę schudnąć i poprawić kondycję.",
    displayName: "Test User",
  };

  const mockAvailableChallenges: (ChallengeTemplate & { id: string })[] = [
    {
      id: "ch1",
      title: "Podstawowe Pompki",
      description: "Wykonać 3 serie po 10 pompek.",
      level: "beginner",
      equipment: ["none"],
      expectedTime: "5min",
    },
    {
      id: "ch2",
      title: "Przysiady z Obciążeniem",
      description: "3 serie po 12 przysiadów z lekkim obciążeniem.",
      level: "beginner",
      equipment: ["dumbbells", "kettlebell"], // Example equipment
      expectedTime: "10min",
    },
    {
      id: "ch3",
      title: "Intensywny Bieg Interwałowy",
      description: "Bieg interwałowy 5x400m.",
      level: "intermediate",
      equipment: ["none"],
      expectedTime: "20min",
    },
  ];

  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  // --- Tests for generatePersonalizedGoals ---
  describe("generatePersonalizedGoals", () => {
    it("should throw error if GEMINI_API_KEY is not set", async () => {
      const tempApiKey = process.env.GEMINI_API_KEY;
      // @ts-expect-error - Linter might complain
      delete process.env.GEMINI_API_KEY;
      await expect(
        aiService.generatePersonalizedGoals(mockPersonalizationData)
      ).rejects.toThrow("GEMINI_API_KEY is not set");
      process.env.GEMINI_API_KEY = tempApiKey;
    });

    it("should call ai.generate with the correct prompt content", async () => {
      mockGenerate.mockResolvedValueOnce({
        text: "Goals Prompt Test Response",
      });
      await aiService.generatePersonalizedGoals(mockPersonalizationData);
      expect(mockGenerate).toHaveBeenCalledOnce();
      const generateArgs = mockGenerate.mock.calls[0][0];
      const promptText = generateArgs[0].text;

      expect(promptText).toContain(
        `Poziom Doświadczenia: ${mockPersonalizationData.level}`
      );
      expect(promptText).toContain(
        `Dostępny Sprzęt: ${mockPersonalizationData.equipment.join(", ")}`
      );
      expect(promptText).toContain(
        `Opis Celów: ${mockPersonalizationData.goalsDescription}`
      );
      expect(generateArgs[0].metadata).toEqual({ temperature: 0.7 });
    });

    it("should return parsed goals when parsing is successful", async () => {
      const expectedGoals = ["Goal 1", "Goal 2"];
      const parseSpy = vi
        .spyOn(parseUtils, "parseAIResponse")
        .mockReturnValue(expectedGoals);
      mockGenerate.mockResolvedValueOnce({
        text: "AI Response for Successful Goal Parsing",
      });
      const result = await aiService.generatePersonalizedGoals(
        mockPersonalizationData
      );
      expect(result).toEqual(expectedGoals);
      expect(parseSpy).toHaveBeenCalled();
    });

    it("should return an empty array when parsing fails (returns null)", async () => {
      const parseSpy = vi
        .spyOn(parseUtils, "parseAIResponse")
        .mockReturnValue(null);
      mockGenerate.mockResolvedValueOnce({
        text: "AI Response for Null Goal Parsing",
      });
      const result = await aiService.generatePersonalizedGoals(
        mockPersonalizationData
      );
      expect(result).toEqual([]);
      expect(parseSpy).toHaveBeenCalled();
    });

    it("should return an empty array when parsing throws an error", async () => {
      const parseSpy = vi
        .spyOn(parseUtils, "parseAIResponse")
        .mockImplementation(() => {
          throw new Error("Parsing failed");
        });
      mockGenerate.mockResolvedValueOnce({
        text: "AI Response for Error Goal Parsing",
      });
      const result = await aiService.generatePersonalizedGoals(
        mockPersonalizationData
      );
      expect(result).toEqual([]);
      expect(parseSpy).toHaveBeenCalled();
    });

    it("should throw error passed from ai.generate if it fails", async () => {
      const generateError = new Error("AI generation failed");
      const parseSpy = vi
        .spyOn(parseUtils, "parseAIResponse")
        .mockReturnValue(null);
      mockGenerate.mockRejectedValue(generateError);
      await expect(
        aiService.generatePersonalizedGoals(mockPersonalizationData)
      ).rejects.toThrow(generateError);
      expect(parseSpy).not.toHaveBeenCalled();
    });
  });

  // --- Tests for generatePersonalizedChallenges ---
  describe("generatePersonalizedChallenges", () => {
    it("should throw error if GEMINI_API_KEY is not set", async () => {
      const tempApiKey = process.env.GEMINI_API_KEY;
      // @ts-expect-error - Linter might complain
      delete process.env.GEMINI_API_KEY;
      await expect(
        aiService.generatePersonalizedChallenges(
          mockPersonalizationData,
          mockAvailableChallenges
        )
      ).rejects.toThrow("GEMINI_API_KEY is not set");
      process.env.GEMINI_API_KEY = tempApiKey;
    });

    it("should call ai.generate with the correct prompt content including available challenges", async () => {
      mockGenerate.mockResolvedValueOnce({
        text: "Challenges Prompt Test Response",
      });
      await aiService.generatePersonalizedChallenges(
        mockPersonalizationData,
        mockAvailableChallenges
      );
      expect(mockGenerate).toHaveBeenCalledOnce();
      const generateArgs = mockGenerate.mock.calls[0][0];
      const promptText = generateArgs[0].text;

      expect(promptText).toContain("spersonalizowany plan treningowy");
      expect(promptText).toContain(
        `Poziom Doświadczenia: ${mockPersonalizationData.level}`
      );
      expect(promptText).toContain(
        `Dostępny Sprzęt: ${mockPersonalizationData.equipment.join(", ")}`
      );
      expect(promptText).toContain(
        `Cele: ${mockPersonalizationData.fitnessGoals?.join(", ")}`
      );
      expect(promptText).toContain("<available-challenges>");
      expect(promptText).toContain(
        `- ${mockAvailableChallenges[0].id}: ${mockAvailableChallenges[0].title}`
      );
      expect(promptText).toContain(
        `- ${mockAvailableChallenges[1].id}: ${mockAvailableChallenges[1].title}`
      );
      expect(promptText).toContain(
        `- ${mockAvailableChallenges[2].id}: ${mockAvailableChallenges[2].title}`
      );
      expect(promptText).toContain("</available-challenges>");
      expect(generateArgs[0].metadata).toEqual({ temperature: 0.7 });
    });

    it("should return parsed challenge IDs when parsing is successful", async () => {
      const expectedChallengeIds = ["ch1", "ch2"];
      const parseSpy = vi
        .spyOn(parseUtils, "parseAIResponse")
        .mockReturnValue(expectedChallengeIds);
      mockGenerate.mockResolvedValueOnce({
        text: "AI Response for Successful Challenge Parsing",
      });
      const result = await aiService.generatePersonalizedChallenges(
        mockPersonalizationData,
        mockAvailableChallenges
      );
      expect(result).toEqual(expectedChallengeIds);
      expect(parseSpy).toHaveBeenCalled();
    });

    it("should return an empty array when parsing fails (returns null)", async () => {
      const parseSpy = vi
        .spyOn(parseUtils, "parseAIResponse")
        .mockReturnValue(null);
      mockGenerate.mockResolvedValueOnce({
        text: "AI Response for Null Challenge Parsing",
      });
      const result = await aiService.generatePersonalizedChallenges(
        mockPersonalizationData,
        mockAvailableChallenges
      );
      expect(result).toEqual([]);
      expect(parseSpy).toHaveBeenCalled();
    });

    it("should return an empty array when parsing throws an error", async () => {
      const parseSpy = vi
        .spyOn(parseUtils, "parseAIResponse")
        .mockImplementation(() => {
          throw new Error("Parsing failed");
        });
      mockGenerate.mockResolvedValueOnce({
        text: "AI Response for Error Challenge Parsing",
      });
      const result = await aiService.generatePersonalizedChallenges(
        mockPersonalizationData,
        mockAvailableChallenges
      );
      expect(result).toEqual([]);
      expect(parseSpy).toHaveBeenCalled();
    });

    it("should throw error passed from ai.generate if it fails", async () => {
      const generateError = new Error("AI generation failed");
      const parseSpy = vi
        .spyOn(parseUtils, "parseAIResponse")
        .mockReturnValue(null);
      mockGenerate.mockRejectedValue(generateError);
      await expect(
        aiService.generatePersonalizedChallenges(
          mockPersonalizationData,
          mockAvailableChallenges
        )
      ).rejects.toThrow(generateError);
      expect(parseSpy).not.toHaveBeenCalled();
    });
  });
});
