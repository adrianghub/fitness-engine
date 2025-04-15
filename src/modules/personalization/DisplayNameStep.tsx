import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { usePersonalizationForm } from "@/modules/personalization/usePersonalizationForm";

export function DisplayNameStep({
  form,
}: {
  form: ReturnType<typeof usePersonalizationForm>;
}) {
  return (
    <div className='space-y-4'>
      <form.Field
        name='displayName'
        validators={{
          onChange: ({ value }) =>
            !value?.trim() ? "Display name is required" : undefined,
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
              className='text-lg p-4'
            />
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
