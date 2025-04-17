import { useDailyChallenge } from "@/modules/challenges/hooks/useChallengesQuery";
import { ArrowRight, Clock, Dumbbell, Flame, Trophy } from "lucide-react";
import { Loader } from "../../../components/Loader";
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

export function DailyChallenge() {
  const { data: dailyChallenge, isLoading } = useDailyChallenge();

  if (isLoading) {
    return (
      <Card className='w-full mb-6 border-2 border-primary/30 bg-primary/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Flame className='text-primary' />
            <span>Loading your daily challenge...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='h-24 relative'>
          <Loader />
        </CardContent>
      </Card>
    );
  }

  if (!dailyChallenge) {
    return (
      <Card className='w-full mb-6 border-2 border-primary/30 bg-primary/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Flame className='text-primary' />
            <span>No daily challenge available</span>
          </CardTitle>
          <CardDescription>
            Your new daily challenge will be available soon!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className='w-full mb-6 border-2 border-primary/30 overflow-hidden'>
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start mb-1'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-xl sm:text-2xl'>
              {dailyChallenge.challengeTemplate?.title || "Daily Challenge"}
            </CardTitle>
          </div>

          {dailyChallenge.challengeTemplate?.level && (
            <Badge
              variant='outline'
              className='bg-green-50 text-green-800 border-green-200'
            >
              {dailyChallenge.challengeTemplate.level}
            </Badge>
          )}
        </div>

        <div className='flex flex-wrap gap-2 mb-2'>
          <Badge
            variant='secondary'
            className='bg-amber-100 text-amber-800 border-0'
          >
            <Flame className='mr-1 h-3 w-3' />
            Exercise of the Day (+
            {dailyChallenge.points ||
              dailyChallenge.challengeTemplate?.points ||
              0}{" "}
            points)
          </Badge>
        </div>

        <CardDescription className='text-base text-gray-600'>
          {dailyChallenge.challengeTemplate?.description ||
            "No description available"}
        </CardDescription>
      </CardHeader>

      <CardContent className='pb-3'>
        <div className='flex flex-wrap gap-6'>
          <div className='flex items-center gap-2 text-amber-600'>
            <Trophy size={18} />
            <span className='font-medium'>
              {dailyChallenge.points ||
                dailyChallenge.challengeTemplate?.points ||
                0}{" "}
              points
            </span>
          </div>

          {dailyChallenge.challengeTemplate?.expectedTime && (
            <div className='flex items-center gap-2 text-blue-600'>
              <Clock size={18} />
              <span className='font-medium'>
                {dailyChallenge.challengeTemplate.expectedTime}
              </span>
            </div>
          )}

          {dailyChallenge.challengeTemplate?.equipment &&
            dailyChallenge.challengeTemplate.equipment.length > 0 && (
              <div className='flex items-center gap-2 text-purple-600'>
                <Dumbbell size={18} />
                <span className='font-medium'>
                  {dailyChallenge.challengeTemplate.equipment.join(", ")}
                </span>
              </div>
            )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className='w-full gap-2 py-6 text-lg font-medium'
          disabled={dailyChallenge.status === "in-progress"}
        >
          {dailyChallenge.status === "in-progress"
            ? "In progress"
            : "Start Exercise"}
          <ArrowRight size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}
