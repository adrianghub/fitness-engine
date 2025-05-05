import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUGGESTED_GOALS } from "@/modules/personalization/constants";
import type { usePersonalizationForm } from "@/modules/personalization/usePersonalizationForm";
import { Target } from "lucide-react";
import { motion } from "motion/react";

export function GoalsStep({
  form,
}: {
  form: ReturnType<typeof usePersonalizationForm>;
}) {
  return (
    <div className='space-y-6' data-testid='goals-step'>
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
                data-testid='goals-textarea'
              />
              {field.state.meta.errors &&
                field.state.meta.errors.length > 0 && (
                  <p
                    className='text-sm text-destructive mt-1'
                    data-testid='goals-error'
                  >
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
            </div>

            <div className='space-y-2' data-testid='suggested-goals-section'>
              <h3 className='text-lg font-medium flex items-center gap-2'>
                <Target className='h-5 w-5 text-blue-500' />
                Suggested Goals
              </h3>
              <div className='space-y-2'>
                {SUGGESTED_GOALS.map((goal) => (
                  <div
                    key={goal}
                    className='p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors'
                    onClick={() => field.handleChange(goal)}
                    data-testid={`suggested-goal-${goal.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <motion.div
                      key={goal}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      {goal}
                    </motion.div>
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
