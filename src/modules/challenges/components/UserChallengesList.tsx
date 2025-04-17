import { useUserChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { ArrowRight, Clock, Dumbbell, Trophy } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { UserChallengesListSkeleton } from "./ChallengeSkeletons";

export function UserChallengesList() {
  const { data: challenges = [], isLoading } = useUserChallenges();

  if (isLoading) {
    return (
      <div className='mt-8'>
        <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
          <Dumbbell className='text-gray-400' /> Regular Exercises
        </h2>
        <UserChallengesListSkeleton />
      </div>
    );
  }

  if (challenges.length === 0) {
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
        <Dumbbell /> Regular Exercises
      </h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {challenges.map((challenge) => (
          <Card key={challenge.id} className='overflow-hidden'>
            <CardHeader>
              <div className='flex justify-between items-start mb-1'>
                <div className='flex items-center gap-2'>
                  <CardTitle className='text-xl'>
                    {challenge.challengeTemplate?.title || "Challenge"}
                  </CardTitle>
                </div>
                {challenge.challengeTemplate?.level && (
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-800 border-green-200'
                  >
                    {challenge.challengeTemplate.level}
                  </Badge>
                )}
              </div>

              <CardDescription className='text-base text-gray-600'>
                {challenge.challengeTemplate?.description ||
                  "No description available"}
              </CardDescription>
            </CardHeader>

            <CardContent className='pb-3'>
              <div className='flex flex-wrap gap-6'>
                <div className='flex items-center gap-2 text-amber-600'>
                  <Trophy size={18} />
                  <span className='font-medium'>
                    {challenge.points ||
                      challenge.challengeTemplate?.points ||
                      0}{" "}
                    points
                  </span>
                </div>

                {challenge.challengeTemplate?.expectedTime && (
                  <div className='flex items-center gap-2 text-blue-600'>
                    <Clock size={18} />
                    <span className='font-medium'>
                      {challenge.challengeTemplate.expectedTime}
                    </span>
                  </div>
                )}

                {challenge.challengeTemplate?.equipment &&
                  challenge.challengeTemplate.equipment.length > 0 && (
                    <div className='flex items-center gap-2 text-purple-600'>
                      <Dumbbell size={18} />
                      <span className='font-medium'>
                        {challenge.challengeTemplate.equipment.join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className='w-full gap-2 py-6 text-lg font-medium'
                disabled={challenge.status === "in-progress"}
              >
                {challenge.status === "in-progress"
                  ? "In progress"
                  : "Start Exercise"}
                <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
