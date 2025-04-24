import { COLLECTIONS, FirestoreService } from "@/lib/firestore";
import { logger } from "@/lib/logger";
import type { Leaderboard, Opponent, User } from "@/types/models";
import { orderBy } from "firebase/firestore";

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  isUser: boolean;
}

/**
 * Service for working with leaderboard data
 */
export class LeaderboardService {
  private leaderboardService: FirestoreService<Leaderboard>;
  private userService: FirestoreService<User>;
  private opponentService: FirestoreService<Opponent>;

  constructor() {
    this.leaderboardService = new FirestoreService<Leaderboard>(
      COLLECTIONS.LEADERBOARD
    );
    this.userService = new FirestoreService<User>(COLLECTIONS.USERS);
    this.opponentService = new FirestoreService<Opponent>(
      COLLECTIONS.OPPONENTS
    );
  }

  /**
   * Get the leaderboard entries, sorted by points in descending order
   */
  async getLeaderboard(currentUserId: string): Promise<LeaderboardEntry[]> {
    try {
      const constraints = [orderBy("points", "desc")];
      const leaderboardEntries =
        await this.leaderboardService.getAll(constraints);

      if (!leaderboardEntries.length) {
        logger.warn("LeaderboardService", "No leaderboard entries found");
        return [];
      }

      const entries = await Promise.all(
        leaderboardEntries.map(async (entry, index) => {
          let name = "Unknown";

          try {
            if (entry.entityType === "user") {
              const user = await this.userService.getById(entry.entityId);
              name = user?.displayName || "User";
            } else if (entry.entityType === "opponent") {
              const opponent = await this.opponentService.getById(
                entry.entityId
              );
              name = opponent?.name || "Opponent";
            }
          } catch (error) {
            logger.error(
              "LeaderboardService",
              `Error getting name for ${entry.entityId}:`,
              error
            );
          }

          return {
            id: entry.entityId,
            name,
            points: entry.points,
            rank: entry.rank || index + 1,
            isUser:
              entry.entityType === "user" && entry.entityId === currentUserId,
          };
        })
      );

      // Sort by points (descending)
      return entries.sort((a, b) => b.points - a.points);
    } catch (error) {
      logger.error("LeaderboardService", "Error getting leaderboard:", error);
      throw error;
    }
  }
}

export const leaderboardService = new LeaderboardService();
