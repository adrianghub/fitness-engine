import { useCompletedChallenges } from "@/modules/challenges/hooks/useChallenges";
import { Timestamp } from "firebase/firestore";
import { CheckCircle, Clock, Dumbbell, Medal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { CompletedChallengesListSkeleton } from "./ChallengeSkeletons";

export function CompletedChallengesList() {
  const { data: challenges = [], isLoading } = useCompletedChallenges();

  if (isLoading) {
    return (
      <div className='mt-8 pt-4'>
        <Separator className='mb-6' />
        <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
          <Medal className='text-gray-500' /> Completed Exercises
        </h2>
        <CompletedChallengesListSkeleton />
      </div>
    );
  }

  if (challenges.length === 0) {
    return null; // Don't show anything if there are no completed challenges
  }

  return (
    <div className='mt-8 pt-4'>
      <Separator className='mb-6' />
      <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
        <Medal className='text-gray-500' /> Completed Exercises
      </h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {challenges.map((challenge) => (
          <Card
            key={challenge.id}
            className='overflow-hidden border border-gray-200 bg-gray-50/50'
          >
            <CardHeader className='pb-3'>
              <div className='flex justify-between items-start mb-1'>
                <div className='flex items-center gap-2'>
                  <Dumbbell size={20} className='text-gray-400' />
                  <CardTitle className='text-lg text-gray-700'>
                    {challenge.challengeTemplate?.title || "Challenge"}
                  </CardTitle>
                </div>

                <div className='flex items-center gap-1 text-gray-500'>
                  <CheckCircle size={16} />
                  <span className='text-sm font-medium'>
                    +
                    {challenge.points ||
                      challenge.challengeTemplate?.points ||
                      0}
                  </span>
                </div>
              </div>

              <CardDescription className='text-sm text-gray-500 line-clamp-2'>
                {challenge.challengeTemplate?.description ||
                  "No description available"}
              </CardDescription>
            </CardHeader>

            <CardContent className='pb-4 text-xs text-gray-500'>
              <div className='flex items-center gap-2'>
                <Medal size={14} />
                <span>Completed: {formatTimestamp(challenge.finishedAt)}</span>
              </div>

              {challenge.challengeTemplate?.expectedTime && (
                <div className='flex items-center gap-2 mt-1'>
                  <Clock size={14} />
                  <span>Time: {challenge.challengeTemplate.expectedTime}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: Timestamp | undefined): string {
  if (!timestamp) return "Unknown date";

  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
