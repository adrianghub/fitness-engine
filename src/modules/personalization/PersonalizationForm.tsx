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
import { useState } from "react";
import { TOTAL_STEPS } from "./constants";
import { FormValidator } from "./FormValidator";
import { usePersonalizationForm } from "./usePersonalizationForm";

export function PersonalizationForm() {
  const form = usePersonalizationForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const progress = (currentStep / TOTAL_STEPS) * 100;
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const handleNext = () => {
    const nextStep = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          Personalize Your Fitness Journey
        </CardTitle>
        <CardDescription className='text-md text-muted-foreground'>
          Step {currentStep} of {TOTAL_STEPS}
        </CardDescription>
        <Progress value={progress} className='w-full' />
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (currentStep === TOTAL_STEPS) {
              form.handleSubmit();
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

          {currentStep === 1 && <DisplayNameStep form={form} />}
          {currentStep === 2 && <FitnessLevelStep form={form} />}
          {currentStep === 3 && <EquipmentStep form={form} />}
          {currentStep === 4 && <GoalsStep form={form} />}

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
              disabled={isSubmitting || isNextDisabled}
            >
              {isSubmitting
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
