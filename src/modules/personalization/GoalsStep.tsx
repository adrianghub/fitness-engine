import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUGGESTED_GOALS } from "@/modules/personalization/constants";
import type { usePersonalizationForm } from "@/modules/personalization/usePersonalizationForm";

export function GoalsStep({
  form,
}: {
  form: ReturnType<typeof usePersonalizationForm>;
}) {
  return (
    <div className='space-y-6'>
      <form.Field
        name='goalsDescription'
        validators={{
          onChange: ({ value }) =>
            typeof value === "string" && !value.trim()
              ? "Please describe your fitness goals"
              : undefined,
        }}
      >
        {(field) => (
          <div className='space-y-4'>
            <div>
              <Label htmlFor={field.name}>
                Tell us about your fitness goals
              </Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value as string}
                placeholder='Describe what you want to achieve...'
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className='min-h-[120px] mt-2'
              />
              {field.state.meta.errors &&
                field.state.meta.errors.length > 0 && (
                  <p className='text-sm text-destructive mt-1'>
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
            </div>

            <div className='space-y-2'>
              <h3 className='text-lg font-medium flex items-center gap-2'>
                <span className='i-lucide-target w-5 h-5' />
                Suggested Goals
              </h3>
              <div className='space-y-2'>
                {SUGGESTED_GOALS.map((goal) => (
                  <div
                    key={goal}
                    className='p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors'
                    onClick={() => field.handleChange(goal)}
                  >
                    {goal}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </form.Field>
    </div>
  );
}
