import { Loader } from "@/components/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLeaderboardQuery } from "@/modules/leaderboard/hooks/useLeaderboardQuery";
import { useScrollToUser } from "@/modules/leaderboard/hooks/useScrollToUser";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ArrowUp, Trophy } from "lucide-react";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const getInitials = (name: string): string => {
  if (!name) return "XX";
  const parts = name.split(" ");
  if (parts.length === 1) return name.substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const getMedalColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "text-yellow-400";
    case 2:
      return "text-gray-400";
    case 3:
      return "text-amber-800";
    default:
      return "text-gray-500";
  }
};

const MedalIcon = ({ rank }: { rank: number }) => {
  const color = getMedalColor(rank);

  if (rank > 3) {
    return <span className='text-xl font-bold text-gray-500'>{rank}</span>;
  }
  return <Trophy className={`w-8 h-8 ${color}`} />;
};

export function Leaderboard() {
  const { data: leaderboardEntries, isLoading, error } = useLeaderboardQuery();
  const userEntryRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { userInView } = useScrollToUser({
    isLoading,
    hasEntries: !!leaderboardEntries?.length,
    userEntryRef: userEntryRef as RefObject<HTMLElement>,
  });

  const handleNavigateToDashboard = useCallback(() => {
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  const handleScrollToTop = useCallback(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 300;
      setShowScrollButton(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive' className='my-4'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load leaderboard. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8' ref={topRef}>
      <div className='mb-6'>
        <Button
          variant='link'
          className='pl-0'
          onClick={handleNavigateToDashboard}
        >
          <ArrowLeft className='h-4 w-4 mr-2' /> Back to Dashboard
        </Button>

        <h1 className='text-3xl font-bold text-center my-6'>Leaderboard</h1>
      </div>

      <div className='max-w-md mx-auto'>
        <div className='space-y-4'>
          {leaderboardEntries?.map((entry) =>
            entry.isUser ? (
              <motion.div
                key={entry.id}
                ref={userEntryRef}
                initial={{ opacity: 0.9, scale: 0.98 }}
                animate={
                  userInView
                    ? {
                        opacity: 1,
                        scale: 1,
                        backgroundColor: "#f0f4ff",
                        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.4)",
                      }
                    : {
                        opacity: 0.9,
                        scale: 0.98,
                      }
                }
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                }}
                whileInView={
                  userInView
                    ? {
                        scale: [1, 1.02, 1],
                        transition: {
                          duration: 1.5,
                          times: [0, 0.5, 1],
                          repeat: 0,
                        },
                      }
                    : {}
                }
                className='bg-gray-50 rounded-lg p-4 shadow flex items-center border-l-4 border-accent-foreground'
              >
                <div className='flex-shrink-0 mr-4'>
                  <MedalIcon rank={entry.rank} />
                </div>

                <div className='flex-shrink-0 mr-4'>
                  <motion.div
                    className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold'
                    animate={
                      userInView
                        ? {
                            backgroundColor: ["#dbeafe", "#93c5fd", "#dbeafe"],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: 0,
                      ease: "easeInOut",
                    }}
                  >
                    {getInitials(entry.name)}
                  </motion.div>
                </div>

                <div className='flex-grow'>
                  <div className='font-medium'>
                    {entry.name}{" "}
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={userInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className='text-accent-foreground'
                    >
                      (You)
                    </motion.span>
                  </div>
                </div>

                <motion.div
                  className='flex-shrink-0 font-bold'
                  animate={
                    userInView
                      ? {
                          color: ["#6b7280", "#4f46e5", "#6b7280"],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: 0,
                    ease: "easeInOut",
                  }}
                >
                  {entry.points} points
                </motion.div>
              </motion.div>
            ) : (
              <div
                key={entry.id}
                className='bg-gray-50 rounded-lg p-4 shadow flex items-center'
              >
                <div className='flex-shrink-0 mr-4'>
                  <MedalIcon rank={entry.rank} />
                </div>

                <div className='flex-shrink-0 mr-4'>
                  <div className='w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold'>
                    {getInitials(entry.name)}
                  </div>
                </div>

                <div className='flex-grow'>
                  <div className='font-medium'>{entry.name}</div>
                </div>

                <div className='flex-shrink-0 font-bold'>
                  {entry.points} points
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {showScrollButton && (
        <div className='fixed bottom-6 right-6'>
          <Button
            size='icon'
            className='rounded-full shadow-lg h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90'
            onClick={handleScrollToTop}
          >
            <ArrowUp className='h-5 w-5' />
          </Button>
        </div>
      )}
    </div>
  );
}
