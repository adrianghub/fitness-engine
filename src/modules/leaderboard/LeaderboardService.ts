import { db } from "@/lib/firebase";
import { COLLECTIONS, FirestoreService } from "@/lib/firestore";
import { logger } from "@/lib/logger";
import type {
  Leaderboard as LeaderboardDoc,
  Opponent,
  User,
  UserLevel,
} from "@/types/models";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

// Define the structure returned by the service, including the fetched name
export interface LeaderboardEntry {
  id: string; // Leaderboard document ID
  entityId: string; // User or Opponent ID
  name: string; // Fetched name
  points: number;
  rank: number;
  isUser: boolean;
  // Add other fields if needed by the component, e.g., level
  level?: UserLevel;
  entityType: "user" | "opponent";
}

/**
 * Service for working with leaderboard data
 */
export class LeaderboardService extends FirestoreService<LeaderboardDoc> {
  private userService: FirestoreService<User>;
  private opponentService: FirestoreService<Opponent>;

  constructor() {
    super(COLLECTIONS.LEADERBOARD);
    this.userService = new FirestoreService<User>(COLLECTIONS.USERS);
    this.opponentService = new FirestoreService<Opponent>(
      COLLECTIONS.OPPONENTS
    );
  }

  /**
   * Fetches leaderboard entries relevant to a specific user:
   * - The user's own entry.
   * - All opponent entries associated with that user.
   * Sorted by points descending.
   *
   * @param userId The ID of the user whose leaderboard context to fetch.
   * @returns A promise resolving to an array of LeaderboardEntry objects.
   */
  async getLeaderboard(userId: string): Promise<LeaderboardEntry[]> {
    if (!userId) {
      logger.warn("LeaderboardService", "getLeaderboard called without userId");
      return [];
    }
    logger.info(
      "LeaderboardService",
      `Fetching leaderboard for user: ${userId}`
    );

    // 1. Fetch current user data first
    let currentUserData: User | null = null;
    try {
      currentUserData = await this.userService.getById(userId);
      if (!currentUserData) {
        logger.warn(
          "LeaderboardService",
          `Current user data not found for ID: ${userId}`
        );
        // Decide if we should return empty or proceed without user
        // For leaderboard, it makes sense to proceed and potentially show only opponents
      }
    } catch (userError) {
      logger.error(
        "LeaderboardService",
        `Error fetching current user data for ${userId}:`,
        userError
      );
      // Proceed, maybe leaderboard entry exists without user doc error
    }
    const currentUserName = currentUserData?.displayName || "You";
    const currentUserLevel = currentUserData?.level || "beginner";
    const currentUserPoints = currentUserData?.points || 0;

    try {
      // 2. Fetch leaderboard entries (opponents + potentially user's existing entry)
      const q = query(
        collection(db, COLLECTIONS.LEADERBOARD),
        where("userId", "==", userId),
        orderBy("points", "desc")
      );
      const snapshot = await getDocs(q);

      let userFoundInLeaderboard = false;

      // 3. Process fetched entries (mostly opponents)
      const processedEntries = await Promise.all(
        snapshot.docs.map(async (doc): Promise<LeaderboardEntry | null> => {
          const data = doc.data();
          const entityId = data.entityId;
          let name = "Unknown";
          let level: UserLevel | undefined = data.level;
          let isUser = false;

          try {
            if (data.entityType === "user" && entityId === userId) {
              // Use already fetched user data
              name = currentUserName;
              level = currentUserLevel;
              isUser = true;
              userFoundInLeaderboard = true;
              // Ensure points are up-to-date from user doc
              data.points = currentUserPoints;
            } else if (data.entityType === "opponent") {
              const opponent = await this.opponentService.getById(entityId);
              name = opponent?.name || "Opponent";
              level = opponent?.level;
            } else {
              // Skip entries that are not user or opponent, or user mismatch
              logger.warn(
                "LeaderboardService",
                `Skipping unexpected leaderboard entry: ${doc.id}`,
                data
              );
              return null;
            }
          } catch (error) {
            logger.error(
              "LeaderboardService",
              `Error fetching details for entity ${entityId}:`,
              error
            );
            return null; // Exclude entries with fetch errors
          }

          return {
            id: doc.id, // Leaderboard document ID
            entityId: entityId || "",
            name: name,
            points: data.points || 0,
            rank: 0, // Rank is calculated later
            isUser: isUser,
            level: level || "beginner",
            entityType: data.entityType || "opponent",
          };
        })
      );

      // Filter out nulls (entries skipped due to errors or mismatch)
      const combinedEntries = processedEntries.filter(
        (entry) => entry !== null
      ) as LeaderboardEntry[];

      // 5. Add user entry if not found in leaderboard collection
      if (!userFoundInLeaderboard && currentUserData) {
        const defaultUserEntry: LeaderboardEntry = {
          id: userId, // Use user ID as a stable identifier
          entityId: userId,
          name: currentUserName,
          points: currentUserPoints,
          rank: 0, // Calculated later
          isUser: true,
          level: currentUserLevel,
          entityType: "user",
        };
        combinedEntries.push(defaultUserEntry);
      }

      // 7. Sort combined list
      combinedEntries.sort((a, b) => b.points - a.points);

      // 8. Recalculate ranks
      const rankedEntries = combinedEntries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      logger.info(
        "LeaderboardService",
        `Successfully fetched ${rankedEntries.length} leaderboard entries for user: ${userId}`
      );
      return rankedEntries;
    } catch (error) {
      logger.error(
        "LeaderboardService",
        `Error fetching leaderboard for user ${userId}:`,
        error
      );
      throw new Error("Failed to fetch leaderboard data."); // Re-throw for React Query
    }
  }
}

export const leaderboardService = new LeaderboardService();
