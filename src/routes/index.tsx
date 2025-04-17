import { Button } from "@/components/ui/button";
import { useAuth } from "@/useAuth";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { userData } = useAuth();

  return (
    <div className='flex flex-col items-center justify-center px-4 gap-8 min-h-[80vh]'>
      <div className='flex flex-col items-center space-y-4 text-center'>
        <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl'>
          Transform Your Fitness Journey
        </h1>
        <p className='max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
          Join our community of fitness enthusiasts and take on personalized
          challenges that match your goals and skill level.
        </p>
      </div>
      <Link
        to={userData?.isProfileComplete ? "/dashboard" : "/personalization"}
      >
        <Button size='lg' className='h-12 px-8'>
          {userData?.isProfileComplete ? "Go to Dashboard" : "Get Started"}
        </Button>
      </Link>
    </div>
  );
}
