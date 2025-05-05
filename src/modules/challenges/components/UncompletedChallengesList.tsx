import { Button } from "@/components/ui/button";
import { useChallengeActions } from "@/modules/challenges/hooks/useChallengeActions";
import { useUncompletedChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { useHasChallengeInProgress } from "@/modules/challenges/hooks/useHasChallengeInProgress";
import { AlertCircle, X } from "lucide-react";
import { ChallengeCard } from "./ChallengeCard";
import { UserChallengesListSkeleton } from "./ChallengeSkeletons";

export function UncompletedChallengesList() {
  const { data: challenges = [], isLoading } = useUncompletedChallenges();
  const { hasInProgressChallenge } = useHasChallengeInProgress();
  const { restartChallenge } = useChallengeActions();

  if (challenges.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold flex items-center gap-2'>
        <X /> Uncompleted Challenges
      </h2>
      {isLoading ? (
        <UserChallengesListSkeleton />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {challenges.map((challenge) => {
            const retriesCount = challenge.retriesLeft || 0;
            const hasRetriesLeft = retriesCount > 0;
            const retriesText = hasRetriesLeft
              ? `Attempts left: ${retriesCount}/3`
              : "No more attempts available today";

            return (
              <ChallengeCard
                key={challenge.id}
                id={challenge.id}
                title={challenge.challengeTemplate?.title || "Challenge"}
                description={
                  challenge.challengeTemplate?.description ||
                  "No description available"
                }
                points={challenge.points || 0}
                expectedTime={challenge.challengeTemplate?.expectedTime}
                equipment={challenge.challengeTemplate?.equipment}
                level={challenge.challengeTemplate?.level || ""}
                status='uncompleted'
                isDisabled={hasInProgressChallenge || !hasRetriesLeft}
                footerContent={
                  hasRetriesLeft ? (
                    <div className='space-y-2 w-full'>
                      <div className='text-xs text-foreground text-right'>
                        {retriesText}
                      </div>
                      <Button
                        className='w-full gap-2 py-6 text-lg font-medium'
                        onClick={() => restartChallenge.mutate(challenge.id)}
                        disabled={hasInProgressChallenge}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-2 w-full'>
                      <div className='flex items-center justify-center gap-2 py-4 text-amber-600 border border-amber-200 rounded-md bg-amber-50'>
                        <AlertCircle size={18} />
                        <span className='text-sm font-medium'>
                          Maximum attempts reached for today
                        </span>
                      </div>
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
