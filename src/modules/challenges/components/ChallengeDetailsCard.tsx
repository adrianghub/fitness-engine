import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { parseTimeString, timestampToDate } from "@/lib/date-utils";
import { UserChallenge } from "@/types/models";
import { AlertTriangle, Check, Clock, Quote, Trophy, X } from "lucide-react";
import { ReactNode } from "react";
import { useChallengeTimer } from "../hooks/useChallengeTimer";

interface ChallengeDetailsCardProps {
  challenge: UserChallenge & {
    id: string;
    challengeTemplate?: {
      title?: string;
      description?: string;
      expectedTime?: string;
      level?: string;
      equipment?: string[];
    };
  };
  quote?: { q: string; a: string };
  isLoadingQuote?: boolean;
  isExpired?: boolean;
  isActuallyExpired?: boolean;
  footer?: ReactNode;
}

export function ChallengeDetailsCard({
  challenge,
  quote,
  isLoadingQuote = false,
  isExpired = false,
  isActuallyExpired = false,
  footer,
}: ChallengeDetailsCardProps) {
  const startedAtDate = challenge?.startedAt
    ? timestampToDate(challenge.startedAt)
    : undefined;

  // Extract expected time in minutes from the challenge
  const expectedTimeInMinutes = challenge?.challengeTemplate?.expectedTime
    ? parseTimeString(challenge.challengeTemplate.expectedTime)
    : 30; // Default to 30 minutes

  // Use the timer hook if challenge is in progress
  const { formattedTimeRemaining, progressPercentage } = useChallengeTimer({
    challengeId: challenge.id,
    expectedTimeInMinutes,
    startedAt: startedAtDate,
    userId: challenge.userId,
  });

  return (
    <Card className='mb-8 metallic-card'>
      <CardHeader>
        <CardTitle className='text-lg sm:text-2xl font-semibold'>
          {challenge.challengeTemplate?.title || ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mb-6'>
          <p className='text-gray-700 dark:text-gray-300 mb-4'>
            {challenge.challengeTemplate?.description ||
              "No description available."}
          </p>

          {challenge.status === "in-progress" && (
            <div>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center'>
                  <Clock className='h-4 w-4 mr-2 text-amber-500' />
                  <span className='font-medium'>{formattedTimeRemaining}</span>
                </div>
                <div>
                  <span className='text-sm text-primary font-semibold'>
                    Expected time:{" "}
                    {challenge.challengeTemplate?.expectedTime || "unknown"}
                  </span>
                </div>
              </div>
              <Progress value={progressPercentage} className='h-2' />

              {/* Motivational quote for in-progress challenges */}
              {quote && (
                <div className='mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg flex gap-3 items-start'>
                  <Quote className='h-5 w-5 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <p className='italic text-sm mb-2'>"{quote.q}"</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      — {quote.a}
                    </p>
                  </div>
                </div>
              )}

              {isLoadingQuote && (
                <div className='mt-6'>
                  <Skeleton className='h-20 w-full' />
                </div>
              )}
            </div>
          )}

          {(isExpired || isActuallyExpired) &&
            challenge.status !== "completed" && (
              <Alert variant='destructive' className='mt-4'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Time Expired</AlertTitle>
                <AlertDescription>
                  The time limit for this challenge has expired.
                  {challenge.status === "uncompleted"
                    ? " You can try again if it's still the same day."
                    : " The challenge is being marked as uncompleted."}
                </AlertDescription>
              </Alert>
            )}

          {challenge.status === "completed" && (
            <Alert className='mt-4 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800'>
              <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
              <AlertTitle>Challenge Completed!</AlertTitle>
              <AlertDescription>
                You've successfully completed this challenge and earned{" "}
                {challenge.points} points!
              </AlertDescription>
            </Alert>
          )}

          {challenge.status === "uncompleted" && (
            <Alert variant='destructive' className='mt-4'>
              <X className='h-4 w-4' />
              <AlertTitle>Challenge Uncompleted</AlertTitle>
              <AlertDescription>
                You were unable to complete this challenge in time. You can try
                again if it's still within the same day.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center gap-2'>
          <Trophy className='h-4 w-4 text-amber-500' />
          <p>
            Complete this challenge to earn{" "}
            <strong>{challenge.points} points</strong>!
          </p>
        </div>
      </CardContent>

      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
