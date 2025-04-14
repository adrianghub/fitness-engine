import { Link } from "@tanstack/react-router";

interface Challenge {
  id: string;
  title: string;
  progress: number;
}

interface UserInfo {
  displayName: string;
  level: string;
  fitnessGoals: string[];
  trainingFrequency: number;
}

interface DashboardProps {
  user: UserInfo;
  userChallenges: Challenge[];
}

// The Dashboard component will receive this data from the route loader
export function Dashboard() {
  // In a real app, we would use the useLoaderData hook to get data from the route loader
  // For now, we'll use mock data
  const mockData: DashboardProps = {
    user: {
      displayName: "John Doe",
      level: "intermediate",
      fitnessGoals: ["Strength", "Weight Loss"],
      trainingFrequency: 3,
    },
    userChallenges: [
      { id: "1", title: "30 Day Push-up Challenge", progress: 0.3 },
      { id: "2", title: "Weekly Running Goal", progress: 0.7 },
    ],
  };

  const { user, userChallenges } = mockData;

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Welcome, {user.displayName}!</h1>
      </div>

      {/* User Profile Summary */}
      <div className='bg-background shadow rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-semibold mb-4'>Your Profile</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <p className='text-muted-foreground'>Fitness Level</p>
            <p className='font-medium capitalize'>{user.level}</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Training Days</p>
            <p className='font-medium'>{user.trainingFrequency} days/week</p>
          </div>
          <div>
            <p className='text-muted-foreground'>Goals</p>
            <div className='flex flex-wrap gap-2 mt-1'>
              {user.fitnessGoals.map((goal, index) => (
                <span
                  key={index}
                  className='px-2 py-1 bg-accent-foreground text-background rounded text-sm'
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-semibold'>Your Challenges</h2>
          <Link
            to='/leaderboard'
            className='text-accent-foreground hover:text-accent-foreground/80'
          >
            View Leaderboard
          </Link>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {userChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className='bg-background shadow rounded-lg overflow-hidden'
            >
              <div className='p-6'>
                <h3 className='font-semibold text-lg mb-2'>
                  {challenge.title}
                </h3>
                <div className='w-full bg-border rounded-full h-2.5 mb-4'>
                  <div
                    className='bg-accent-foreground h-2.5 rounded-full'
                    style={{ width: `${challenge.progress * 100}%` }}
                  ></div>
                </div>
                <div className='flex justify-between items-center'>
                  <p className='text-muted-foreground'>
                    {Math.round(challenge.progress * 100)}% Complete
                  </p>
                  <Link
                    to='/challenges/$id'
                    params={{ id: challenge.id }}
                    className='px-4 py-2 bg-accent-foreground text-background rounded-md hover:bg-accent-foreground/80'
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
