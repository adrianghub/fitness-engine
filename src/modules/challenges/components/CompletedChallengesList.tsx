import { Separator } from "@/components/ui/separator";
import { formatTimestamp } from "@/lib/date-utils";
import { useCompletedChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { Medal } from "lucide-react";
import { ChallengeCard } from "./ChallengeCard";
import { CompletedChallengesListSkeleton } from "./ChallengeSkeletons";

export function CompletedChallengesList() {
  const { data: challenges = [], isLoading } = useCompletedChallenges();

  if (challenges.length === 0) {
    return null;
  }

  return (
    <div className='mt-8 pt-4'>
      <Separator className='mb-6' />
      <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
        <Medal className='text-gray-500' /> Completed Challenges
      </h2>
      {isLoading ? (
        <CompletedChallengesListSkeleton />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {challenges.map((challenge) => (
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
              type={challenge.type}
              status='completed'
              footerContent={
                <div className='flex items-center gap-2 p-2 text-sm text-gray-500 w-full'>
                  <Medal size={14} />
                  <span>
                    Completed:{" "}
                    {challenge.finishedAt
                      ? formatTimestamp(challenge.finishedAt)
                      : "N/A"}
                  </span>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
