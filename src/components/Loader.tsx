import { Dumbbell } from "lucide-react";
import { motion } from "motion/react";

export function Loader() {
  return (
    <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
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
    </div>
  );
}
