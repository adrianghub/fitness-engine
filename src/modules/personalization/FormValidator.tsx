import { STEP_FIELDS } from "@/modules/personalization/constants";
import type { usePersonalizationForm } from "@/modules/personalization/usePersonalizationForm";
import { useStore } from "@tanstack/react-form";
import { useEffect } from "react";

export function FormValidator({
  form,
  currentStep,
  setIsNextDisabled,
}: {
  form: ReturnType<typeof usePersonalizationForm>;
  currentStep: number;
  setIsNextDisabled: (disabled: boolean) => void;
}) {
  const displayName = useStore(form.store, (state) => state.values.displayName);
  const level = useStore(form.store, (state) => state.values.level);
  const equipment = useStore(form.store, (state) => state.values.equipment);
  const goalsDescription = useStore(
    form.store,
    (state) => state.values.goalsDescription
  );
  const fieldMeta = useStore(form.store, (state) => state.fieldMeta);

  useEffect(() => {
    const currentFields = STEP_FIELDS[currentStep];
    if (!currentFields) {
      setIsNextDisabled(true);
      return;
    }

    const hasErrors = currentFields.some((fieldName) => {
      if (fieldName === "displayName") {
        return !displayName || !String(displayName).trim();
      }
      if (fieldName === "level") {
        return !level;
      }
      if (fieldName === "equipment") {
        return !Array.isArray(equipment) || equipment.length === 0;
      }
      if (fieldName === "goalsDescription") {
        return !goalsDescription || !String(goalsDescription).trim();
      }
      const errors = fieldMeta[fieldName]?.errors;
      return Array.isArray(errors) && errors.length > 0;
    });

    setIsNextDisabled(hasErrors);
  }, [
    currentStep,
    displayName,
    level,
    equipment,
    goalsDescription,
    fieldMeta,
    setIsNextDisabled,
  ]);

  return null;
}
