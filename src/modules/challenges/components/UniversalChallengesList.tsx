import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useCompleteChallenge } from "@/modules/challenges/hooks/useChallengeMutations";
import { useUniversalChallenges } from "@/modules/challenges/hooks/useChallengesQuery";
import { CheckCircle, Star, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
  const completeMutation = useCompleteChallenge();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null
  );

  const handleComplete = async () => {
    if (!selectedChallengeId) return;

    try {
      const result = await completeMutation.mutateAsync(selectedChallengeId);
      toast.success("Challenge completed successfully!", {
        description: result.wasPromoted
          ? "Congratulations! You've been promoted to the next level!"
          : "Keep up the good work!",
      });
    } catch {
      toast.error("Failed to complete challenge", {
        description: "Please try again later.",
      });
    } finally {
      setSelectedChallengeId(null);
    }
  };

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
          <Card key={challenge.id} className='relative overflow-hidden'>
            {challenge.finishedAt && (
              <div className='absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center'>
                <div className='bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg flex flex-col items-center gap-1'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle size={20} />
                    <span className='font-semibold'>Completed</span>
                  </div>
                </div>
              </div>
            )}
            <CardHeader>
              <div className='flex justify-between items-start'>
                <CardTitle>{challenge.universalChallenge?.title}</CardTitle>
                <div
                  className={`flex items-center gap-1 font-bold ${
                    challenge.finishedAt ? "text-gray-400" : "text-yellow-500"
                  }`}
                >
                  <Trophy size={18} />
                  <span>{challenge.points}</span>
                </div>
              </div>
              <CardDescription className='mt-1'>
                {challenge.universalChallenge?.description}
              </CardDescription>
            </CardHeader>

            {!challenge.finishedAt && (
              <CardFooter className='flex justify-end'>
                <ConfirmationDialog
                  title='Complete Challenge'
                  description='Are you sure you want to mark this challenge as completed? This action cannot be undone.'
                  trigger={
                    <Button
                      className='gap-2'
                      size='sm'
                      onClick={() => setSelectedChallengeId(challenge.id)}
                      disabled={completeMutation.isPending}
                    >
                      {completeMutation.isPending &&
                      selectedChallengeId === challenge.id
                        ? "Completing..."
                        : "Mark as done"}
                      <CheckCircle size={14} />
                    </Button>
                  }
                  onConfirm={handleComplete}
                  onCancel={() => setSelectedChallengeId(null)}
                  confirmText='Complete'
                  isLoading={
                    completeMutation.isPending &&
                    selectedChallengeId === challenge.id
                  }
                />
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
