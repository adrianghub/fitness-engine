import { auth, functions } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import type { PersonalizationData } from "@/types/personalization-data";
import { httpsCallable } from "firebase/functions";

const ENDPOINTS = {
  completeUserProfile: "completeUserProfileEndpoint",
  completeChallenge: "completeChallengeEndpoint",
  resignChallenge: "resignChallengeEndpoint",
  checkChallengeExpiration: "checkChallengeExpirationEndpoint",
};

/**
 * Completes the user's profile
 * @param data The data to complete the profile with
 */
export async function completeUserProfile(
  data: PersonalizationData
): Promise<void> {
  const completeUserProfileFn = httpsCallable(
    functions,
    ENDPOINTS.completeUserProfile
  );
  await completeUserProfileFn(data);
}

/**
 * Completes a challenge
 * @param challengeId The ID of the challenge to complete
 * @returns A promise that resolves to true if the challenge was completed
 */
export async function completeChallengeEndpoint(
  challengeId: string
): Promise<{ wasPromoted: boolean }> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const completeFn = httpsCallable<
    { challengeId: string; userId: string },
    { wasPromoted: boolean }
  >(functions, ENDPOINTS.completeChallenge);

  const result = await completeFn({ challengeId, userId });
  return result.data;
}

/**
 * Resigns from a challenge and counts it as a retry attempt
 * @param challengeId The ID of the challenge to resign from
 * @returns Promise with information about retry availability
 */
export async function resignChallengeEndpoint(
  challengeId: string
): Promise<{ canRetry: boolean }> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const resignFn = httpsCallable<
    { challengeId: string; userId: string },
    { canRetry: boolean }
  >(functions, ENDPOINTS.resignChallenge);

  const result = await resignFn({ challengeId, userId });
  return result.data;
}

/**
 * Checks if a challenge has expired (uses cloud function)
 * @param userId The ID of the user to check
 * @param challengeId The ID of the challenge to check
 * @returns A promise that resolves with challenge expiration status and retry availability
 */
export async function checkChallengeExpirationEndpoint(
  challengeId: string
): Promise<{ expired: boolean; canRetry: boolean }> {
  try {
    const checkChallengeExpirationCall = httpsCallable(
      functions,
      ENDPOINTS.checkChallengeExpiration
    );
    const result = await checkChallengeExpirationCall({
      challengeId,
    });

    const { expired, canRetry } = result.data as {
      expired: boolean;
      canRetry: boolean;
    };

    return { expired, canRetry };
  } catch (error) {
    logger.error(
      "ChallengeService",
      `Error checking challenge expiration for ${challengeId}:`,
      error
    );
    return { expired: false, canRetry: false };
  }
}
