import { UserGreetings } from "@/modules/challenges/components/UserGreetings";
import { useAuth } from "@/useAuth";
import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { CompletedChallengesList } from "./CompletedChallengesList";
import { DailyChallenge } from "./DailyChallenge";
import { UniversalChallengesList } from "./UniversalChallengesList";
import { UserChallengesList } from "./UserChallengesList";

export function Dashboard() {
  const { isLoading: userLoading } = useAuth();

  return (
    <>
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

      <UserGreetings />

      <div className='space-y-8'>
        <DailyChallenge />
        <UniversalChallengesList />
        <UserChallengesList />
        <CompletedChallengesList />
      </div>
    </>
  );
}
