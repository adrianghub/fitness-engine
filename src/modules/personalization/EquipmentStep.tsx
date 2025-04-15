import { Label } from "@/components/ui/label";
import { AVAILABLE_EQUIPMENT } from "@/modules/personalization/constants";
import type { usePersonalizationForm } from "@/modules/personalization/usePersonalizationForm";
import type { Equipment } from "@/types/models";

export function EquipmentStep({
  form,
}: {
  form: ReturnType<typeof usePersonalizationForm>;
}) {
  return (
    <div className='space-y-4'>
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
          <div>
            <Label>Available Equipment</Label>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-2'>
              {AVAILABLE_EQUIPMENT.map((item) => (
                <div
                  key={item.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    (field.state.value as Equipment[]).includes(item.value)
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                  onClick={() => {
                    const currentEquipment = [
                      ...(field.state.value as Equipment[]),
                    ];
                    if (currentEquipment.includes(item.value)) {
                      field.handleChange(
                        currentEquipment.filter((e) => e !== item.value)
                      );
                    } else {
                      field.handleChange([...currentEquipment, item.value]);
                    }
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
            {field.state.meta.errors && field.state.meta.errors.length > 0 && (
              <p className='text-sm text-destructive mt-1'>
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>
    </div>
  );
}
