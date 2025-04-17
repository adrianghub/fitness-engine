import { useAuth } from "@/useAuth";
import { Link } from "@tanstack/react-router";
import { Dumbbell, Trophy } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { CompletedChallengesList } from "./CompletedChallengesList";
import { DailyChallenge } from "./DailyChallenge";
import { UniversalChallengesList } from "./UniversalChallengesList";
import { UserChallengesList } from "./UserChallengesList";

export function Challenges() {
  const { userData } = useAuth();

  return (
    <div>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold'>
          Hello, {userData?.displayName || ""}!
        </h1>
        <Link to='/leaderboard'>
          <Button variant='outline' className='gap-2 shadow-sm'>
            <Trophy size={16} className='text-amber-500' />
            View Leaderboard
          </Button>
        </Link>
      </div>

      <div className='mb-6 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 shadow-sm hidden sm:block'>
        <div className='flex items-center gap-3'>
          <Dumbbell size={24} className='text-primary' />
          <p className='text-lg font-medium'>
            Your today's challenges are waiting for you!
          </p>
        </div>
      </div>

      <div className='space-y-8'>
        <DailyChallenge />
        <UniversalChallengesList />
        <UserChallengesList />
        <CompletedChallengesList />
      </div>
    </div>
  );
}
