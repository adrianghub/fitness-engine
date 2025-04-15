import { Label } from "@/components/ui/label";
import {
  exercisesByLevel,
  FITNESS_LEVELS,
} from "@/modules/personalization/constants";
import type { usePersonalizationForm } from "@/modules/personalization/usePersonalizationForm";

export function FitnessLevelStep({
  form,
}: {
  form: ReturnType<typeof usePersonalizationForm>;
}) {
  return (
    <div className='space-y-4'>
      <form.Field
        name='level'
        validators={{
          onChange: ({ value }) =>
            !value ? "Please select your fitness level" : undefined,
        }}
      >
        {(field) => (
          <div>
            <Label>Fitness Level</Label>
            <div className='grid gap-4 mt-2'>
              {FITNESS_LEVELS.map((level) => (
                <div
                  key={level.value}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    field.state.value === level.value
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                  onClick={() => field.handleChange(level.value)}
                >
                  <div className='font-semibold text-lg mb-2'>
                    {level.label}
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    {exercisesByLevel[level.value].exercises.map(
                      (exercise, index) => (
                        <div
                          key={index}
                          className='text-sm text-muted-foreground'
                        >
                          • {exercise}
                        </div>
                      )
                    )}
                  </div>
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
