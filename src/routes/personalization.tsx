import { createProtectedLoader } from "@/lib/protected-route";
import { PersonalizationForm } from "@/modules/personalization/PersonalizationForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/personalization")({
  component: PersonalizationView,
  loader: createProtectedLoader(),
});

function PersonalizationView() {
  return (
    <div className='flex justify-center items-center min-h-[80vh]'>
      <PersonalizationForm />
    </div>
  );
}
