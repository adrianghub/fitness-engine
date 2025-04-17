import { useAuth } from "@/useAuth";
import { Link } from "@tanstack/react-router";
import { Dumbbell, Goal, Target, Trophy } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { CompletedChallengesList } from "./CompletedChallengesList";
import { DailyChallenge } from "./DailyChallenge";
import { UniversalChallengesList } from "./UniversalChallengesList";
import { UserChallengesList } from "./UserChallengesList";

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

export function Challenges() {
  const { userData, isLoading: userLoading } = useAuth();

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold'>
          {userLoading ? (
            <Skeleton className='h-9 w-64' />
          ) : (
            <>Today's Exercises</>
          )}
        </h1>
        <Link to='/leaderboard'>
          <Button variant='outline' className='gap-2 shadow-sm'>
            <Trophy size={16} className='text-amber-500' />
            View Leaderboard
          </Button>
        </Link>
      </div>

      {!userLoading && (
        <div className='mb-6 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 shadow-sm'>
          <div className='flex items-center gap-3'>
            <Dumbbell size={24} className='text-primary' />
            <p className='text-lg font-medium'>
              Welcome back, {userData?.displayName || "Fitness Enthusiast"}!
            </p>
          </div>

          {userData?.fitnessGoals && userData.fitnessGoals.length > 0 && (
            <div className='mt-2'>
              <div className='flex items-center gap-2 text-sm text-gray-600 mb-1.5'>
                <Goal size={16} />
                <span>Your fitness goals:</span>
              </div>
              <UserFitnessGoals goals={userData.fitnessGoals} />
            </div>
          )}
        </div>
      )}

      <div className='space-y-8'>
        <DailyChallenge />
        <UniversalChallengesList />
        <UserChallengesList />
        <CompletedChallengesList />
      </div>
    </div>
  );
}
