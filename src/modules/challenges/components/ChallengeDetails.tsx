import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChallengeDetails } from "@/modules/challenges/hooks/useChallengeDetails";
import { UserChallenge } from "@/types/models";
import {
  useNavigate,
  useParams,
  useRouteContext,
} from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Check, Trophy, X } from "lucide-react";
import { ChallengeDetailsCard } from "./ChallengeDetailsCard";

export function ChallengeDetails() {
  const { id } = useParams({ from: "/challenges/$id" });
  const navigate = useNavigate();
  const { challenge: preloadedChallenge } = useRouteContext({
    from: "/challenges/$id",
  }) as {
    challenge?: UserChallenge & { id: string };
    notFound?: boolean;
    error?: string;
  };

  const {
    challenge,
    isLoadingChallenge,
    quote,
    isLoadingQuote,
    showConfirmation,
    confirmationType,
    isActuallyExpired,
    isExpired,
    handleComplete,
    handleResign,
    handleConfirm,
    handleCancelConfirm,
    startChallenge,
  } = useChallengeDetails(id, preloadedChallenge);

  // Handle back button click
  const handleBackClick = () => {
    navigate({ to: "/dashboard" });
  };

  if (isLoadingChallenge) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p>Loading challenge...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Challenge not found. Please return to the dashboard.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBackClick} className='mt-4'>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const renderFooter = () => {
    if (
      challenge.status === "in-progress" &&
      !isExpired &&
      !isActuallyExpired
    ) {
      return (
        <div className='flex justify-end space-x-2 w-full'>
          <Button variant='outline' onClick={handleResign}>
            <X className='mr-2 h-4 w-4' /> Give Up
          </Button>
          <Button onClick={handleComplete}>
            <Check className='mr-2 h-4 w-4' /> Complete Challenge
          </Button>
        </div>
      );
    }

    if (challenge.status === "uncompleted") {
      const retriesCount = challenge.retriesLeft || 0;
      const hasRetriesLeft = retriesCount > 0;

      if (hasRetriesLeft) {
        return (
          <div className='space-y-2 w-full'>
            <div className='text-xs text-gray-500 text-right'>
              Attempts left: {retriesCount}/3
            </div>
            <Button
              className='w-full'
              onClick={() => startChallenge.mutate(challenge.id)}
            >
              Try Again
            </Button>
          </div>
        );
      } else {
        return (
          <div className='space-y-2 w-full'>
            <div className='flex items-center justify-center gap-2 py-4 text-amber-600 border border-amber-200 rounded-md bg-amber-50'>
              <AlertTriangle size={18} />
              <span className='text-sm font-medium'>
                Maximum attempts reached for today
              </span>
            </div>
          </div>
        );
      }
    }

    if (challenge.status === "completed") {
      return (
        <Button
          className='ml-auto'
          onClick={() => navigate({ to: "/leaderboard" })}
        >
          <Trophy className='mr-2 h-4 w-4' /> View Leaderboard
        </Button>
      );
    }

    return null;
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <Button variant='ghost' onClick={handleBackClick} className='mb-4'>
        <ArrowLeft className='mr-2 h-4 w-4' /> Back to Dashboard
      </Button>

      <ChallengeDetailsCard
        challenge={challenge}
        quote={quote || undefined}
        isLoadingQuote={isLoadingQuote}
        isExpired={isExpired}
        isActuallyExpired={isActuallyExpired}
        footer={renderFooter()}
      />

      {showConfirmation && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <Card className='max-w-md w-full'>
            <CardHeader>
              <CardTitle>
                {confirmationType === "complete"
                  ? "Complete Challenge?"
                  : "Give Up?"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confirmationType === "complete" ? (
                <p>
                  Are you sure you've completed this challenge? You'll earn{" "}
                  {challenge.points} points.
                </p>
              ) : (
                <div className='space-y-3'>
                  <p>Are you sure you want to give up on this challenge?</p>
                  {challenge?.retriesLeft && (
                    <div className='mt-2 p-3 bg-gray-50 rounded-md'>
                      <p className='text-sm text-gray-600'>
                        <span className='font-medium'>Retry information: </span>
                        {challenge.retriesLeft === 1 ? (
                          <>
                            This is your last attempt for today. If you give up,
                            you won't be able to retry this challenge.
                          </>
                        ) : (
                          <>
                            You have {challenge.retriesLeft}/3 attempts left.
                            After giving up, you'll have{" "}
                            {challenge.retriesLeft - 1}/3 attempts left today.
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className='flex justify-end space-x-2'>
              <Button variant='outline' onClick={handleCancelConfirm}>
                Cancel
              </Button>
              <Button
                variant={
                  confirmationType === "complete" ? "default" : "destructive"
                }
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
