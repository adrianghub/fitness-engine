import { logger } from "@/lib/logger";
import { completeUserProfile } from "@/services/cloud-functions";
import type { Equipment, FitnessGoal } from "@/types/models";
import { useAuth } from "@/useAuth";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function usePersonalizationForm() {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const form = useForm({
    defaultValues: {
      displayName: userData?.displayName || "",
      level: userData?.level || "beginner",
      equipment: (userData?.equipment as Equipment[]) || [],
      fitnessGoals: (userData?.fitnessGoals as FitnessGoal[]) || [],
      goalsDescription: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await completeUserProfile(value);
        navigate({ to: "/dashboard" });
        toast.success("Profile completed successfully");
      } catch (error: unknown) {
        logger.error(
          "Personalization",
          "Error saving user profile:",
          error instanceof Error ? error.message : String(error)
        );
        throw new Error("Failed to save profile. Please try again.");
      }
    },
  });

  return form;
}
