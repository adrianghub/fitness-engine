import { COLLECTIONS, FirestoreService } from "@/lib/firestore";
import { logger } from "@/lib/logger";
import type {
  ChallengeTemplate,
  UniversalChallenge,
  UserChallenge,
} from "@/types/models";
import { orderBy, where } from "firebase/firestore";

interface UserChallengeWithTemplate extends UserChallenge {
  id: string;
  challengeTemplate?: ChallengeTemplate;
  universalChallenge?: UniversalChallenge;
}

interface ChallengeTemplateWithId extends ChallengeTemplate {
  id: string;
}

export class ChallengeService {
  private userChallengeService: FirestoreService<UserChallengeWithTemplate>;
  private challengeTemplateService: FirestoreService<ChallengeTemplateWithId>;
  private universalChallengeService: FirestoreService<UniversalChallenge>;

  constructor() {
    this.userChallengeService = new FirestoreService<UserChallengeWithTemplate>(
      COLLECTIONS.USER_CHALLENGES
    );
    this.challengeTemplateService =
      new FirestoreService<ChallengeTemplateWithId>(
        COLLECTIONS.CHALLENGE_TEMPLATES
      );
    this.universalChallengeService = new FirestoreService<UniversalChallenge>(
      COLLECTIONS.UNIVERSAL_CHALLENGES
    );
  }

  /**
   * Get all active challenges for a specific user (not-started or in-progress)
   */
  async getUserChallenges(
    userId: string
  ): Promise<UserChallengeWithTemplate[]> {
    const constraints = [
      where("userId", "==", userId),
      where("status", "in", ["not-started", "in-progress"]),
    ];

    const challenges = await this.userChallengeService.query(constraints);

    console.log("Challenges:", challenges);

    return this.enrichChallengesWithTemplates(challenges);
  }

  /**
   * Get all completed challenges for a specific user
   */
  async getCompletedChallenges(
    userId: string
  ): Promise<UserChallengeWithTemplate[]> {
    const constraints = [
      where("userId", "==", userId),
      where("status", "==", "completed"),
      where("type", "in", ["regular", "daily"]),
      orderBy("finishedAt", "desc"),
    ];

    const challenges = await this.userChallengeService.query(constraints);

    const challengesWithDetails =
      await this.enrichChallengesWithTemplates(challenges);

    return challengesWithDetails;
  }

  /**
   * Get all uncompleted challenges for a specific user
   */
  async getUncompletedChallenges(
    userId: string
  ): Promise<UserChallengeWithTemplate[]> {
    const constraints = [
      where("userId", "==", userId),
      where("status", "in", ["uncompleted"]),
    ];

    const challenges = await this.userChallengeService.query(constraints);

    const challengesWithDetails =
      await this.enrichChallengesWithTemplates(challenges);

    console.log("Challenges with details:", challengesWithDetails);

    return challengesWithDetails;
  }

  /**
   * Get all universal challenges for a specific user
   */
  async getUserUniversalChallenges(
    userId: string
  ): Promise<UserChallengeWithTemplate[]> {
    const constraints = [
      where("userId", "==", userId),
      where("type", "==", "universal"),
    ];

    const userChallenges = await this.userChallengeService.query(constraints);

    const challengesWithDetails = await Promise.all(
      userChallenges.map(async (userChallenge) => {
        if (userChallenge.challengeId) {
          const universalChallengeData =
            await this.universalChallengeService.getById(
              userChallenge.challengeId
            );
          if (universalChallengeData) {
            userChallenge.universalChallenge = universalChallengeData;
          }
        }
        return userChallenge;
      })
    );

    return challengesWithDetails;
  }

  /**
   * Get a single challenge with its template, ensuring it belongs to the specified user
   */
  async getChallengeWithTemplate(
    challengeId: string,
    userId: string
  ): Promise<UserChallengeWithTemplate | null> {
    try {
      const challenge = await this.userChallengeService.getById(challengeId);

      if (!challenge) {
        logger.warn("ChallengeService", `Challenge ${challengeId} not found`);
        return null;
      }

      // Only validate user if both IDs are present and don't match
      // Skip check for dev/testing purposes if userId is empty
      if (userId && challenge.userId && challenge.userId !== userId) {
        logger.warn(
          "ChallengeService",
          `Challenge ${challengeId} does not belong to user ${userId}`
        );
        return null;
      }

      if (challenge.challengeId) {
        try {
          const template = await this.challengeTemplateService.getById(
            challenge.challengeId
          );

          if (template) {
            challenge.challengeTemplate = template;
          } else {
            logger.warn(
              "ChallengeService",
              `Template ${challenge.challengeId} not found for challenge ${challengeId}`
            );
          }
        } catch (error) {
          logger.error(
            "ChallengeService",
            `Error fetching template for challenge ${challengeId}:`,
            error
          );
        }
      } else {
        logger.warn(
          "ChallengeService",
          `Challenge ${challengeId} has no associated template ID`
        );
      }

      return challenge;
    } catch (error) {
      logger.error(
        "ChallengeService",
        `Error in getChallengeWithTemplate for ${challengeId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Add templates to challenges
   */
  private async enrichChallengesWithTemplates(
    challenges: UserChallengeWithTemplate[]
  ): Promise<UserChallengeWithTemplate[]> {
    const challengeIds = challenges
      .map((challenge) => challenge.challengeId)
      .filter(Boolean) as string[];

    if (!challengeIds.length) return challenges;

    const templates = await Promise.all(
      challengeIds.map((id) => this.challengeTemplateService.getById(id))
    );

    const templateMap = new Map<string, ChallengeTemplateWithId>();
    templates.forEach((template) => {
      if (template && template.id) {
        templateMap.set(template.id, template);
      }
    });

    return challenges.map((challenge) => {
      if (challenge.challengeId && templateMap.has(challenge.challengeId)) {
        return {
          ...challenge,
          challengeTemplate: templateMap.get(challenge.challengeId),
        };
      }
      return challenge;
    });
  }
}

export const challengeService = new ChallengeService();
