import { auth, functions } from "@/lib/firebase";
import type { PersonalizationData } from "@/types/personalization-data";
import { httpsCallable } from "firebase/functions";

export async function completeUserProfile(
  data: PersonalizationData
): Promise<void> {
  const completeUserProfileFn = httpsCallable(functions, "completeUserProfile");
  await completeUserProfileFn(data);
}

export async function completeChallenge(
  challengeId: string
): Promise<{ wasPromoted: boolean }> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const completeFn = httpsCallable<
    { challengeId: string; userId: string },
    { wasPromoted: boolean }
  >(functions, "completeChallengeEndpoint");

  const result = await completeFn({ challengeId, userId });
  return result.data;
}

export async function resignChallenge(challengeId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const resignFn = httpsCallable<{ challengeId: string; userId: string }, void>(
    functions,
    "resignChallengeEndpoint"
  );

  await resignFn({ challengeId, userId });
}
