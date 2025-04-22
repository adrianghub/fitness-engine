import { Progress } from "@/components/ui/progress";
import { parseTimeString, timestampToDate } from "@/lib/date-utils";
import { useUserChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { useChallengeTimer } from "@/modules/challenges/hooks/useChallengeTimer";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Dumbbell, Flame, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
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
import { ChallengeSkeleton } from "./ChallengeSkeletons";

// Component to display a timer
function ChallengeTimer({
  challengeId,
  startedAt,
  expectedTimeInMinutes,
}: {
  challengeId: string;
  startedAt: Date;
  expectedTimeInMinutes: number;
}) {
  const { formattedTimeRemaining, progressPercentage } = useChallengeTimer({
    challengeId,
    expectedTimeInMinutes,
    startedAt,
  });

  return (
    <div className='mb-2'>
      <div className='flex justify-between items-center mb-1'>
        <div className='flex items-center'>
          <Clock className='h-4 w-4 mr-1 text-amber-500' />
          <span className='text-sm font-medium'>{formattedTimeRemaining}</span>
        </div>
        <div className='text-sm text-gray-500'>In progress</div>
      </div>
      <Progress value={progressPercentage} className='h-1.5' />
    </div>
  );
}

export function DailyChallenge() {
  const { data: challenges, isLoading } = useUserChallenges();
  const [hasInProgressChallenge, setHasInProgressChallenge] = useState(false);

  const dailyChallenge = challenges?.find(
    (challenge) => challenge.type === "daily"
  );

  // Check if any challenge is in progress
  useEffect(() => {
    const inProgressChallenge = challenges?.find(
      (challenge) => challenge.status === "in-progress"
    );
    setHasInProgressChallenge(!!inProgressChallenge);
  }, [challenges]);

  if (isLoading) {
    return <ChallengeSkeleton />;
  }

  if (!dailyChallenge) {
    return (
      <Card className='w-full mb-6 border-2 border-primary/30 bg-primary/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Flame className='text-primary' />
            <span>
              You have already completed your daily challenge for today!
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const isInProgress = dailyChallenge.status === "in-progress";

  // Prepare props for timer component if needed
  let timerProps = null;
  if (isInProgress && dailyChallenge.startedAt) {
    try {
      const startedAt = timestampToDate(dailyChallenge.startedAt);
      const expectedTimeInMinutes = dailyChallenge.challengeTemplate
        ?.expectedTime
        ? parseTimeString(dailyChallenge.challengeTemplate.expectedTime)
        : 30;

      timerProps = {
        challengeId: dailyChallenge.id,
        expectedTimeInMinutes,
        startedAt,
      };
    } catch (error) {
      console.error(
        `Failed to convert timestamp for daily challenge ${dailyChallenge.id}:`,
        error
      );
      timerProps = {
        challengeId: dailyChallenge.id,
        startedAt: new Date(),
        expectedTimeInMinutes: dailyChallenge.challengeTemplate?.expectedTime
          ? parseTimeString(dailyChallenge.challengeTemplate.expectedTime)
          : 30,
      };
    }
  }

  return (
    <Card className='metallic-card-daily w-full mb-6 overflow-hidden'>
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start mb-1'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-xl sm:text-2xl text-foreground'>
              {dailyChallenge.challengeTemplate?.title || ""}
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
            <Flame className='mr-1 h-4 w-4' />
            <span className='text-sm'>
              Exercise of the Day (+{dailyChallenge.points || 0} points)
            </span>
          </Badge>
        </div>

        <CardDescription className='text-base text-foreground/80'>
          {dailyChallenge.challengeTemplate?.description ||
            "No description available"}
        </CardDescription>
      </CardHeader>

      <CardContent className='pb-3'>
        <div className='flex flex-wrap gap-6 mb-3'>
          <div className='flex items-center gap-2 text-amber-600'>
            <Trophy size={18} />
            <span className='font-medium'>
              {dailyChallenge.points || 0} points
            </span>
          </div>

          {dailyChallenge.challengeTemplate?.expectedTime && (
            <div className='flex items-center gap-2 text-blue-800'>
              <Clock size={18} />
              <span className='font-medium'>
                {dailyChallenge.challengeTemplate.expectedTime}
              </span>
            </div>
          )}

          {dailyChallenge.challengeTemplate?.equipment &&
            dailyChallenge.challengeTemplate.equipment.length > 0 && (
              <div className='flex items-center gap-2 text-purple-800'>
                <Dumbbell size={18} />
                <span className='font-medium'>
                  {dailyChallenge.challengeTemplate.equipment.join(", ")}
                </span>
              </div>
            )}
        </div>

        {timerProps && <ChallengeTimer {...timerProps} />}
      </CardContent>

      <CardFooter>
        {isInProgress ? (
          <Link
            to='/challenges/$id'
            params={{ id: dailyChallenge.id }}
            className='w-full'
          >
            <Button
              className='w-full gap-2 py-6 text-lg font-medium'
              variant='default'
            >
              Continue Challenge
              <ArrowRight size={16} />
            </Button>
          </Link>
        ) : (
          <Link
            to='/challenges/$id'
            params={{ id: dailyChallenge.id }}
            className='w-full'
            disabled={
              hasInProgressChallenge && dailyChallenge.status !== "in-progress"
            }
          >
            <Button
              className='w-full gap-2 py-6 text-lg font-medium'
              disabled={
                hasInProgressChallenge &&
                dailyChallenge.status !== "in-progress"
              }
            >
              Start Exercise
              <ArrowRight size={16} />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
