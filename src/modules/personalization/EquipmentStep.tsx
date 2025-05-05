import { Label } from "@/components/ui/label";
import type { usePersonalizationForm } from "@/modules/personalization/usePersonalizationForm";
import { motion } from "motion/react";
import { AVAILABLE_EQUIPMENT } from "./constants";
export function EquipmentStep({
  form,
}: {
  form: ReturnType<typeof usePersonalizationForm>;
}) {
  const toggleEquipment = (equipmentId: string) => {
    const current = form.getFieldValue("equipment");
    const updated = current.includes(equipmentId)
      ? current.filter((id: string) => id !== equipmentId)
      : [...current, equipmentId];
    form.setFieldValue("equipment", updated);
  };

  return (
    <div className='space-y-4' data-testid='equipment-step'>
      <form.Field
        name='equipment'
        validators={{
          onChange: ({ value }) =>
            Array.isArray(value) && value.length === 0
              ? "Select at least one equipment type"
              : undefined,
        }}
      >
        {(field) => (
          <div className='space-y-4'>
            <Label>Select Your Available Equipment</Label>
            <div
              className='grid grid-cols-2 md:grid-cols-3 gap-4'
              data-testid='equipment-grid'
            >
              {AVAILABLE_EQUIPMENT.map((equipment) => {
                const Icon = equipment.icon;
                const isSelected = field.state.value.includes(equipment.value);
                return (
                  <motion.div
                    key={equipment.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleEquipment(equipment.value)}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleEquipment(equipment.value);
                      }
                    }}
                    className={`cursor-pointer rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all ${
                      isSelected
                        ? "bg-gradient-to-br from-foreground-muted to-foreground text-background shadow-lg"
                        : "bg-background border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    data-testid={`equipment-option-${equipment.value}`}
                  >
                    <Icon
                      className={`h-8 w-8 ${isSelected ? "text-background" : "text-foreground"}`}
                    />
                    <span className='font-medium text-center'>
                      {equipment.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            {field.state.meta.errors && field.state.meta.errors.length > 0 && (
              <p
                className='text-sm text-destructive mt-1'
                data-testid='equipment-error'
              >
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>
    </div>
  );
}
