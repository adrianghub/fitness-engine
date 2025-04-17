import { COLLECTIONS, FirestoreService } from "@/lib/firestore";
import type {
  ChallengeTemplate,
  UniversalChallenge,
  UserChallenge,
} from "@/types/models";
import { orderBy, where } from "firebase/firestore";

// Create an extended COLLECTIONS object with universalChallenges
const EXTENDED_COLLECTIONS = {
  ...COLLECTIONS,
  UNIVERSAL_CHALLENGES: "universalChallenges",
};

interface UserChallengeWithId extends UserChallenge {
  id: string;
  challengeTemplate?: ChallengeTemplate;
  universalChallenge?: UniversalChallenge;
}

export class ChallengeService {
  private userChallengeService: FirestoreService<UserChallengeWithId>;
  private challengeTemplateService: FirestoreService<ChallengeTemplate>;
  private universalChallengeService: FirestoreService<UniversalChallenge>;

  constructor() {
    this.userChallengeService = new FirestoreService<UserChallengeWithId>(
      COLLECTIONS.USER_CHALLENGES
    );
    this.challengeTemplateService = new FirestoreService<ChallengeTemplate>(
      COLLECTIONS.CHALLENGE_TEMPLATES
    );
    this.universalChallengeService = new FirestoreService<UniversalChallenge>(
      EXTENDED_COLLECTIONS.UNIVERSAL_CHALLENGES
    );
  }

  async getDailyChallengeForUser(
    userId: string
  ): Promise<UserChallengeWithId | null> {
    const constraints = [
      where("userId", "==", userId),
      where("type", "==", "daily"),
      where("status", "in", ["not-started", "in-progress"]),
    ];

    const challenges = await this.userChallengeService.query(constraints);

    if (challenges.length === 0) {
      return null;
    }

    const challenge = challenges[0];

    if (challenge.challengeId) {
      const templateData = await this.challengeTemplateService.getById(
        challenge.challengeId
      );
      if (templateData) {
        challenge.challengeTemplate = templateData;
      }
    }

    return challenge;
  }

  async getUserChallenges(userId: string): Promise<UserChallengeWithId[]> {
    const constraints = [
      where("userId", "==", userId),
      where("type", "==", "regular"),
      where("status", "in", ["not-started", "in-progress"]),
      orderBy("assignedDate", "desc"),
    ];

    const challenges = await this.userChallengeService.query(constraints);

    const challengesWithDetails = await Promise.all(
      challenges.map(async (challenge) => {
        if (challenge.challengeId) {
          const templateData = await this.challengeTemplateService.getById(
            challenge.challengeId
          );
          if (templateData) {
            challenge.challengeTemplate = templateData;
          }
        }
        return challenge;
      })
    );

    return challengesWithDetails;
  }

  async getCompletedChallenges(userId: string): Promise<UserChallengeWithId[]> {
    const constraints = [
      where("userId", "==", userId),
      where("status", "==", "completed"),
      orderBy("finishedAt", "desc"),
    ];

    const challenges = await this.userChallengeService.query(constraints);

    const challengesWithDetails = await Promise.all(
      challenges.map(async (challenge) => {
        if (challenge.challengeId) {
          const templateData = await this.challengeTemplateService.getById(
            challenge.challengeId
          );
          if (templateData) {
            challenge.challengeTemplate = templateData;
          }
        }
        return challenge;
      })
    );

    return challengesWithDetails;
  }

  async getUserUniversalChallenges(
    userId: string
  ): Promise<UserChallengeWithId[]> {
    const constraints = [
      where("userId", "==", userId),
      where("type", "==", "universal"),
      where("status", "in", ["not-started", "in-progress"]),
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
}

export const challengeService = new ChallengeService();
