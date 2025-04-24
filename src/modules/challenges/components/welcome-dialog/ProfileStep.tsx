import { Button } from "@/components/ui/button";
import { useAuth } from "@/useAuth";
import { ArrowRight, Trophy, User as UserIcon } from "lucide-react";
import { motion } from "motion/react";

export function ProfileStep({ handleNext }: { handleNext: () => void }) {
  const { userData } = useAuth();

  const userLevel = userData?.level || "";
  const userEquipment = userData?.equipment?.join(", ") || "";
  const fitnessGoals = userData?.fitnessGoals || [];

  return (
    <motion.div
      key='welcome'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className='space-y-6'
    >
      <div className='flex items-center justify-center'>
        <Trophy className='w-10 h-10 text-blue-500' />
      </div>

      <h2 className='text-2xl font-bold text-center'>
        Welcome to Your Fitness Journey!
      </h2>

      <p className='text-gray-500 text-center'>
        Your future self will thank you for starting today.
      </p>

      <div className='bg-blue-50 p-6 rounded-lg space-y-4'>
        <div className='flex items-center space-x-3'>
          <UserIcon className='text-blue-500 h-6 w-6' />
          <h3 className='font-semibold text-lg'>Your Profile</h3>
        </div>

        <div className='space-y-2'>
          <p>
            Level: <span className='font-medium'>{userLevel}</span>
          </p>
          <p>
            Equipment: <span className='font-medium'>{userEquipment}</span>
          </p>
          <p>
            Fitness Goals:{" "}
            <span className='font-medium'>{fitnessGoals.join(", ")}</span>
          </p>
        </div>
      </div>

      <div className='pt-4 flex justify-end'>
        <Button onClick={handleNext} className='px-6'>
          Next <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </motion.div>
  );
}
