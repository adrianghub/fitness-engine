import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DisplayNameStep } from "@/modules/personalization/DisplayNameStep";
import { EquipmentStep } from "@/modules/personalization/EquipmentStep";
import { FitnessLevelStep } from "@/modules/personalization/FitnessLevelStep";
import { GoalsStep } from "@/modules/personalization/GoalsStep";
import { useStore } from "@tanstack/react-form";
import { motion } from "motion/react";
import { useState } from "react";
import { TOTAL_STEPS } from "./constants";
import { FormValidator } from "./FormValidator";
import { usePersonalizationForm } from "./usePersonalizationForm";

const loadingMessages = [
  "Analyzing your fitness preferences...",
  "Generating personalized challenge list...",
  "Setting up your competitors...",
  "Almost ready for your fitness journey!",
];

export function PersonalizationForm() {
  const form = usePersonalizationForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const progress = (currentStep / TOTAL_STEPS) * 100;
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const handleNext = () => {
    const nextStep = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
  };

  if (isLocalSubmitting || isSubmitting) {
    return (
      <LoadingScreen
        messages={loadingMessages}
        currentMessageIndex={loadingMessageIndex}
      />
    );
  }

  return (
    <Card className='w-full max-w-3xl mx-auto p-0'>
      <CardHeader className='bg-gradient-to-br from-primary to-secondary p-4 rounded-t-lg'>
        <CardTitle className='flex items-center gap-2 text-2xl'>
          <span className='text-background'>
            Personalize Your Fitness Journey
          </span>
        </CardTitle>
        <CardDescription className='text-md text-background'>
          Step {currentStep} of {TOTAL_STEPS}
        </CardDescription>
        <Progress value={progress} className='w-full' />
      </CardHeader>

      <CardContent className='p-6'>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (currentStep === TOTAL_STEPS) {
              setIsLocalSubmitting(true);
              const messageDelay = 1500;

              try {
                for (let i = 0; i < loadingMessages.length; i++) {
                  await new Promise((resolve) =>
                    setTimeout(resolve, messageDelay)
                  );
                  setLoadingMessageIndex(i);
                }

                await form.handleSubmit();
                await new Promise((resolve) => setTimeout(resolve, 500));
              } catch (error) {
                console.error("Form submission error:", error);
              } finally {
                setIsLocalSubmitting(false);
              }
            } else {
              handleNext();
            }
          }}
          className='space-y-6'
        >
          <FormValidator
            form={form}
            currentStep={currentStep}
            setIsNextDisabled={setIsNextDisabled}
          />

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <DisplayNameStep form={form} />}
            {currentStep === 2 && <FitnessLevelStep form={form} />}
            {currentStep === 3 && <EquipmentStep form={form} />}
            {currentStep === 4 && <GoalsStep form={form} />}
          </motion.div>

          <div className='flex justify-between gap-4 pt-4'>
            {currentStep > 1 && (
              <Button
                type='button'
                variant='outline'
                onClick={handleBack}
                className='flex-1'
              >
                Back
              </Button>
            )}

            <Button
              type='submit'
              className='flex-1'
              disabled={isLocalSubmitting || isSubmitting || isNextDisabled}
            >
              {isLocalSubmitting || isSubmitting
                ? "Saving..."
                : currentStep === TOTAL_STEPS
                  ? "Start Your Journey"
                  : "Next"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
