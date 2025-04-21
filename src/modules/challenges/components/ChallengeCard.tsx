import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { parseTimeString, timestampToDate } from "@/lib/date-utils";
import type { ChallengeStatus } from "@/types/models";
import { Link } from "@tanstack/react-router";
import { Timestamp } from "firebase/firestore";
import { ArrowRight, Clock, Dumbbell, Trophy } from "lucide-react";
import { ReactNode } from "react";
import { useChallengeTimer } from "../hooks/useChallengeTimer";

interface ChallengeTimerProps {
  challengeId: string;
  startedAt: Date;
  expectedTimeInMinutes: number;
}

export function ChallengeTimer({
  challengeId,
  startedAt,
  expectedTimeInMinutes,
}: ChallengeTimerProps) {
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

export interface ChallengeCardProps {
  id: string;
  title: string;
  description?: string;
  points: number;
  expectedTime?: string;
  equipment?: string[];
  level?: string;
  type?: string;
  status: ChallengeStatus;
  startedAt?: Timestamp;
  isDisabled?: boolean;
  customBadge?: ReactNode;
  footerContent?: ReactNode;
}

export function ChallengeCard({
  id,
  title,
  description,
  points,
  expectedTime,
  equipment,
  level,
  type,
  status,
  startedAt,
  isDisabled = false,
  customBadge,
  footerContent,
}: ChallengeCardProps) {
  const isInProgress = status === "in-progress";

  let timerProps: ChallengeTimerProps | null = null;
  if (isInProgress && startedAt) {
    try {
      const startedAtDate = timestampToDate(startedAt);
      const expectedTimeInMinutes = expectedTime
        ? parseTimeString(expectedTime)
        : 30;

      timerProps = {
        challengeId: id,
        expectedTimeInMinutes,
        startedAt: startedAtDate,
      };
    } catch (error) {
      console.error(`Failed to convert timestamp for challenge ${id}:`, error);
    }
  }

  return (
    <Card className='overflow-hidden metallic-card'>
      <CardHeader>
        <div className='flex justify-between items-start mb-1'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-xl'>{title}</CardTitle>
          </div>
          {level ? (
            <Badge
              variant='outline'
              className='bg-green-50 text-green-800 border-green-200'
            >
              {level}
            </Badge>
          ) : (
            customBadge
          )}
        </div>

        <CardDescription className='text-base text-primary/80'>
          {description || "No description available"}
        </CardDescription>
      </CardHeader>

      <CardContent className='pb-3'>
        <div className='flex flex-wrap gap-6 mb-3'>
          <div className='flex items-center gap-2 text-amber-600'>
            <Trophy size={18} />
            <span className='font-medium'>{points} points</span>
          </div>

          {expectedTime && (
            <div className='flex items-center gap-2 text-blue-800'>
              <Clock size={18} />
              <span className='font-medium'>{expectedTime}</span>
            </div>
          )}

          {equipment && equipment.length > 0 && (
            <div className='flex items-center gap-2 text-purple-800'>
              <Dumbbell size={18} />
              <span className='font-medium'>{equipment.join(", ")}</span>
            </div>
          )}

          {type && (
            <div className='flex items-center gap-2 text-blue-800'>
              <span className='font-medium'>{type}</span>
            </div>
          )}
        </div>

        {timerProps && <ChallengeTimer {...timerProps} />}
      </CardContent>

      <CardFooter className='mt-auto'>
        {footerContent ? (
          footerContent
        ) : (
          <Link
            to='/challenges/$id'
            params={{ id }}
            className='w-full'
            disabled={isDisabled}
          >
            <Button
              className='w-full gap-2 py-6 text-lg font-medium'
              disabled={isDisabled}
            >
              {isInProgress ? "Continue Challenge" : "Start Exercise"}
              <ArrowRight size={16} />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
