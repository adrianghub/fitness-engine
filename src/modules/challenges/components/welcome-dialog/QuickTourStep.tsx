import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Target, Trophy } from "lucide-react";
import { motion } from "motion/react";

export function QuickTourStep({ handleNext }: { handleNext: () => void }) {
  return (
    <motion.div
      key='quick-tour'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className='space-y-6'
    >
      <h2 className='text-2xl font-bold text-center'>Quick Tour</h2>

      <p className='text-gray-500 text-center'>
        Let's explore what you can do in the app
      </p>

      <div className='space-y-6 mt-6'>
        <div className='flex items-start space-x-4'>
          <Trophy className='w-6 h-6 text-purple-500 flex-shrink-0 mt-1' />
          <div>
            <h4 className='font-semibold'>Challenge of the Day</h4>
            <p className='text-gray-600 text-sm'>
              Start with our featured workout designed specifically for your
              level.
            </p>
          </div>
        </div>

        <div className='flex items-start space-x-4'>
          <Target className='w-6 h-6 text-purple-500 flex-shrink-0 mt-1' />
          <div>
            <h4 className='font-semibold'>Daily Goals</h4>
            <p className='text-gray-600 text-sm'>
              Track your daily activities like water intake and steps to
              maintain a healthy lifestyle.
            </p>
          </div>
        </div>

        <div className='flex items-start space-x-4'>
          <Dumbbell className='w-6 h-6 text-purple-500 flex-shrink-0 mt-1' />
          <div>
            <h4 className='font-semibold'>Workout Challenges</h4>
            <p className='text-gray-600 text-sm'>
              Choose from various workouts tailored to your experience level and
              available equipment.
            </p>
          </div>
        </div>
      </div>

      <div className='pt-4 flex justify-end'>
        <Button onClick={handleNext} className='px-6'>
          Get Started <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </motion.div>
  );
}
