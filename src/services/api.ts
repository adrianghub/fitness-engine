import { functions } from "@/lib/firebase";
import type { PersonalizationData } from "@/types/personalization-data";
import { httpsCallable } from "firebase/functions";

export async function completeUserProfile(
  data: PersonalizationData
): Promise<void> {
  const completeUserProfileFn = httpsCallable(functions, "completeUserProfile");
  await completeUserProfileFn(data);
}
