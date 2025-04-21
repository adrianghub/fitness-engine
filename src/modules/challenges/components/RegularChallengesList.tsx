import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { useHasChallengeInProgress } from "@/modules/challenges/hooks/useHasChallengeInProgress";
import { Dumbbell } from "lucide-react";
import { ChallengeCard } from "./ChallengeCard";
import { UserChallengesListSkeleton } from "./ChallengeSkeletons";

export function RegularChallengesList() {
  const { data: challenges = [], isLoading } = useUserChallenges();
  const { hasInProgressChallenge } = useHasChallengeInProgress();

  const regularChallenges = challenges.filter(
    (challenge) => challenge.type === "regular"
  );

  if (isLoading) {
    return (
      <div className='mt-8'>
        <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
          <Dumbbell className='text-gray-400' /> Regular Challenges
        </h2>
        <UserChallengesListSkeleton />
      </div>
    );
  }

  if (regularChallenges.length === 0) {
    return (
      <Card className='w-full mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <Dumbbell />
            No active challenges
          </CardTitle>
          <CardDescription>
            You've completed all your challenges for today! Check back later for
            new ones.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold flex items-center gap-2'>
        <Dumbbell /> Regular Challenges
      </h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {regularChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            id={challenge.id}
            title={challenge.challengeTemplate?.title || "Challenge"}
            description={challenge.challengeTemplate?.description}
            points={challenge.points || 0}
            expectedTime={challenge.challengeTemplate?.expectedTime}
            equipment={challenge.challengeTemplate?.equipment}
            level={challenge.challengeTemplate?.level}
            status={challenge.status}
            startedAt={challenge.startedAt || undefined}
            isDisabled={
              hasInProgressChallenge && challenge.status !== "in-progress"
            }
          />
        ))}
      </div>
    </div>
  );
}
