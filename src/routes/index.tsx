import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/firebase";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const currentUser = await getCurrentUser();

    return {
      currentUser,
    };
  },
});

function Home() {
  const { currentUser } = Route.useLoaderData();

  return (
    <div className='container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 space-y-8'>
      <div className='flex flex-col items-center space-y-4 text-center'>
        <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl'>
          Transform Your Fitness Journey
        </h1>
        <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
          Join our community of fitness enthusiasts and take on personalized
          challenges that match your goals and skill level.
        </p>
      </div>
      <Link to={currentUser ? "/dashboard" : "/login"}>
        <Button size='lg' className='h-12 px-8'>
          {currentUser ? "Go to Dashboard" : "Get Started"}
        </Button>
      </Link>
    </div>
  );
}
