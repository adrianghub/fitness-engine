import { CheckCircle, Clock, Dumbbell, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { useUncompletedChallenges } from "../hooks/useChallengesQuery";
import { CompletedChallengesListSkeleton } from "./ChallengeSkeletons";
export function UncompletedChallengesList() {
  const { data: challenges = [], isLoading } = useUncompletedChallenges();

  if (isLoading) {
    return (
      <div className='mt-8 pt-4'>
        <Separator className='mb-6' />
        <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
          <X className='text-gray-500' /> Uncompleted Challenges
        </h2>
        <CompletedChallengesListSkeleton />
      </div>
    );
  }

  if (challenges.length === 0) {
    return null;
  }

  return (
    <div className='mt-8 pt-4'>
      <Separator className='mb-6' />
      <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
        <X className='text-gray-500' /> Uncompleted Challenges
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
