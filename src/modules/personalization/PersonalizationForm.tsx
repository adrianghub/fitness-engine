import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserLevel, type FitnessGoal } from "@/types/models";
import { usePersonalizationForm } from "./usePersonalizationForm";

const PREDEFINED_FITNESS_GOALS: FitnessGoal[] = [
  "Strength Training",
  "Cardiovascular Fitness",
  "Flexibility & Mobility",
  "Weight Loss",
  "Muscle Gain",
  "Improved Endurance",
  "Better Balance",
  "Injury Recovery",
  "Sports Performance",
  "General Health",
];

const FITNESS_LEVELS: { value: UserLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function PersonalizationForm() {
  const form = usePersonalizationForm();

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          Welcome to FitnessEngine
        </CardTitle>
        <CardDescription className='text-md text-muted-foreground'>
          Let's personalize your fitness journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <form.Field
              name='displayName'
              validators={{
                onChange: ({ value }) =>
                  !value.trim() ? "Display name is required" : undefined,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Display Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder='Choose a unique nickname'
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldInfo
                    errors={field.state.meta.errors as string[]}
                    isValidating={field.state.meta.isValidating}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className='space-y-2'>
            <form.Field
              name='level'
              validators={{
                onChange: ({ value }) =>
                  !value ? "Please select your fitness level" : undefined,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Fitness Level</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as UserLevel)
                    }
                    onOpenChange={() => field.handleBlur()}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder='Select your fitness level' />
                    </SelectTrigger>
                    <SelectContent>
                      {FITNESS_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo
                    errors={field.state.meta.errors as string[]}
                    isValidating={field.state.meta.isValidating}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className='space-y-2'>
            <form.Field
              name='fitnessGoals'
              validators={{
                onChange: ({ value }) =>
                  value.length === 0
                    ? "Select at least one fitness goal"
                    : undefined,
              }}
            >
              {(field) => (
                <div>
                  <Label>Fitness Goals</Label>
                  <div className='grid grid-cols-2 gap-3 mt-2'>
                    {PREDEFINED_FITNESS_GOALS.map((goal) => {
                      const isSelected = field.state.value.includes(goal);
                      return (
                        <div
                          key={goal}
                          className={`flex items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected
                              ? "bg-primary/10 border-primary font-medium"
                              : "bg-background border-input"
                          }`}
                          onClick={() => {
                            const currentGoals = [...field.state.value];

                            if (isSelected) {
                              // Remove goal if already selected
                              field.handleChange(
                                currentGoals.filter((g) => g !== goal)
                              );
                            } else {
                              // Add goal if not selected
                              field.handleChange([...currentGoals, goal]);
                            }
                          }}
                        >
                          <span className='text-center'>{goal}</span>
                        </div>
                      );
                    })}
                  </div>
                  <FieldInfo
                    errors={field.state.meta.errors as string[]}
                    isValidating={field.state.meta.isValidating}
                  />
                </div>
              )}
            </form.Field>
          </div>

          {form.state.errors && (
            <p className='text-sm text-destructive'>{form.state.errors}</p>
          )}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                className='w-full'
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Start Your Fitness Journey"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldInfo({
  errors,
  isValidating,
}: {
  errors: string[];
  isValidating: boolean;
}) {
  if (isValidating) {
    return <p className='text-sm text-muted-foreground'>Validating...</p>;
  }

  if (errors.length > 0) {
    return <p className='text-sm text-destructive'>{errors.join(", ")}</p>;
  }

  return null;
}
