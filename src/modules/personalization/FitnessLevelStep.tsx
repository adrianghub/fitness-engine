import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { exercisesByLevel } from "@/modules/personalization/constants";
import type { usePersonalizationForm } from "@/modules/personalization/usePersonalizationForm";
import type { UserLevel } from "@/types/models";
import { motion } from "motion/react";

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
          <div className='space-y-4'>
            <Label>Choose Your Experience Level</Label>
            <RadioGroup
              onValueChange={(value) => field.handleChange(value as UserLevel)}
              defaultValue={field.state.value}
              className='grid gap-4'
            >
              {Object.entries(exercisesByLevel).map(
                ([
                  level,
                  { icon: Icon, color, borderColor, bgColor, exercises },
                ]) => (
                  <motion.div
                    key={level}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => field.handleChange(level as UserLevel)}
                    className='w-full cursor-pointer'
                  >
                    <div
                      className={`p-6 rounded-lg border-2 transition-all ${
                        field.state.value === level
                          ? `${borderColor} ${bgColor} shadow-lg`
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className='flex items-center gap-2 mb-4'>
                        <Icon className={`h-6 w-6 ${color}`} />
                        <span className='font-semibold text-xl'>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        {exercises.map((exercise, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className='flex items-center gap-2 text-gray-600'
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${color.replace("text", "bg")}`}
                            />
                            {exercise}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </RadioGroup>
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
