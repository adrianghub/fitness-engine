import { useEffect, useState } from "react";
import { useChallengeInvalidation } from "./useChallengeInvalidation";

const TOTAL_STEPS = 2;

/**
 * Hook to manage the welcome dialog state
 */
export function useWelcomeDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { invalidateAllChallengeQueries } = useChallengeInvalidation();

  const handleNext = () => {
    if (step === TOTAL_STEPS - 1) {
      completeWelcome();
    } else {
      setStep((currentStep) => currentStep + 1);
    }
  };

  useEffect(() => {
    if (
      !localStorage.getItem("hasSeenWelcome") ||
      localStorage.getItem("hasSeenWelcome") === "false"
    ) {
      setOpen(true);
    }
  }, []);

  const completeWelcome = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setOpen(false);

    console.log("Welcome completed, invalidating challenge queries...");

    invalidateAllChallengeQueries();
  };

  return {
    open,
    step,
    handleNext,
    completeWelcome,
  };
}
