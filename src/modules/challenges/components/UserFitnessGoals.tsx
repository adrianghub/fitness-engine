import { Target } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

export function UserFitnessGoals({ goals = [] }: { goals?: string[] }) {
  if (!goals || goals.length === 0) return null;

  return (
    <div className='mt-4 flex flex-wrap gap-2'>
      {goals.map((goal, index) => (
        <Badge
          key={index}
          variant='outline'
          className='bg-primary/5 text-primary border-primary/20 px-3 py-1 font-medium'
        >
          <Target className='w-3.5 h-3.5 mr-1.5' />
          {goal}
        </Badge>
      ))}
    </div>
  );
}
