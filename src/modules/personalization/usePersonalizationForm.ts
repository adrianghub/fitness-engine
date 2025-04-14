import { functions } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import { UserLevel } from "@/types/models";
import { useAuth } from "@/useAuth";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { getAuth } from "firebase/auth";
import { httpsCallable } from "firebase/functions";

export interface PersonalizationFormValues {
  displayName: string;
  level: UserLevel;
  fitnessGoals: string[];
}

export function usePersonalizationForm() {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const form = useForm({
    defaultValues: {
      displayName: userData?.displayName || "",
      level: "beginner" as UserLevel,
      fitnessGoals: userData?.fitnessGoals || [],
    },
    onSubmit: async ({ value }) => {
      try {
        const { displayName, level, fitnessGoals } = value;
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error("User not authenticated");
        }

        const completeUserProfile = httpsCallable(
          functions,
          "completeUserProfile"
        );

        await completeUserProfile({
          displayName,
          level,
          fitnessGoals,
        });

        navigate({ to: "/dashboard" });
        return { status: "success" };
      } catch (err) {
        logger.error("Personalization", "Error saving user profile:", err);
        return {
          status: "error",
          error: "Failed to save profile. Please try again.",
        };
      }
    },
  });

  return form;
}
