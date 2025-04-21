import { UserFitnessGoals } from "@/modules/challenges/components/UserFitnessGoals";
import { useAuth } from "@/useAuth";
import { Dumbbell, Goal } from "lucide-react";

export function UserGreetings() {
  const { userData, isLoading: userLoading } = useAuth();

  if (userLoading) return null;

  return (
    <div className='mb-6 bg-gradient-to-r from-secondary/80 to-primary/10 p-4 rounded-lg shadow-sm'>
      <div className='flex items-center gap-3'>
        <Dumbbell size={24} className='text-primary' />
        <p className='text-lg font-medium'>
          Welcome back,{" "}
          <span className='text-accent-foreground font-bold'>
            {userData?.displayName || ""}
          </span>
          !
        </p>
      </div>

      {userData?.fitnessGoals && userData.fitnessGoals.length > 0 && (
        <div className='mt-2'>
          <div className='flex items-center gap-2 text-sm text-primary/80 mb-1.5'>
            <Goal size={16} />
            <span>Your fitness goals:</span>
          </div>
          <UserFitnessGoals goals={userData.fitnessGoals} />
        </div>
      )}
    </div>
  );
}
