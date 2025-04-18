import { useUniversalChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { CheckCircle, Star, Trophy } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { UniversalChallengesListSkeleton } from "./ChallengeSkeletons";

export function UniversalChallengesList() {
  const { data: challenges = [], isLoading } = useUniversalChallenges();

  if (isLoading) {
    return (
      <div className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Star className='text-yellow-500' /> Universal Challenges
        </h2>
        <UniversalChallengesListSkeleton />
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className='w-full mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <Star className='text-yellow-500' />
            No universal challenges
          </CardTitle>
          <CardDescription>
            Universal challenges will be added soon!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Star className='text-yellow-500' /> Universal Challenges
        </h2>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <CheckCircle className='text-green-500' />
              All universal challenges completed
            </CardTitle>
            <CardDescription>
              Great job! You've completed all available universal challenges.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className='mb-8'>
      <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
        <Star className='text-yellow-500' /> Universal Challenges
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <CardTitle
                  className={challenge.finishedAt ? "line-through" : ""}
                >
                  {challenge.universalChallenge?.title}
                </CardTitle>
                <div
                  className={`flex items-center gap-1 font-bold ${
                    challenge.finishedAt ? "text-gray-400" : "text-yellow-500"
                  }`}
                >
                  <Trophy size={18} />
                  <span>{challenge.points}</span>
                </div>
              </div>
              <CardDescription
                className={`mt-1 ${
                  challenge.finishedAt ? "line-through text-gray-400" : ""
                }`}
              >
                {challenge.universalChallenge?.description}
              </CardDescription>
            </CardHeader>

            {!challenge.finishedAt && (
              <CardFooter className='flex justify-end'>
                <Button className='gap-2' size='sm'>
                  Mark as done <CheckCircle size={14} />
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
