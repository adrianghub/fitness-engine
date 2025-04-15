import { Dumbbell } from "lucide-react";
import { motion } from "motion/react";

interface LoadingScreenProps {
  messages: string[];
  currentMessageIndex: number;
}

export function LoadingScreen({
  messages,
  currentMessageIndex,
}: LoadingScreenProps) {
  return (
    <div className='fixed inset-0 bg-gradient-to-br from-secondary/50 to-primary/50 flex items-center justify-center'>
      <div className='max-w-md w-full mx-4'>
        <div className='text-center'>
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className='inline-block mb-8'
          >
            <Dumbbell className='w-12 h-12 text-foreground' />
          </motion.div>

          <div className='space-y-4'>
            {messages.map((message, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: index <= currentMessageIndex ? 1 : 0,
                  y: index <= currentMessageIndex ? 0 : 10,
                }}
                transition={{ duration: 0.5 }}
                className='text-foreground text-lg font-medium'
              >
                {message}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
