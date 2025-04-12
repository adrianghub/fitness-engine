import { Link } from "@tanstack/react-router";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: string[];
}

// The ChallengeDetail component would receive challenge data from the route loader
export function ChallengeDetail() {
  // In a real app, we would use the useLoaderData hook to get data from the route loader
  // For now, we'll use mock data
  const mockChallenge: Challenge = {
    id: "1",
    title: "30 Day Push-up Challenge",
    description: "Build upper body strength with increasing push-ups each day",
    difficulty: "intermediate",
    duration: 30,
    exercises: ["Push-ups", "Tricep dips", "Planks"],
  };

  const { title, description, difficulty, duration, exercises } = mockChallenge;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex items-center mb-6'>
        <Link
          to='/dashboard'
          className='text-indigo-600 hover:text-indigo-800 mr-4'
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className='bg-white shadow-lg rounded-lg overflow-hidden'>
        <div className='p-6'>
          <h1 className='text-3xl font-bold mb-2'>{title}</h1>
          <div className='flex flex-wrap gap-2 mb-4'>
            <span className='px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm'>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
              {duration} days
            </span>
          </div>

          <p className='text-gray-700 mb-6'>{description}</p>

          <div className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>Challenge Progress</h2>
            <div className='w-full bg-gray-200 rounded-full h-4 mb-2'>
              <div
                className='bg-indigo-600 h-4 rounded-full'
                style={{ width: "30%" }}
              ></div>
            </div>
            <p className='text-gray-600'>9 days completed (30%)</p>
          </div>

          <div>
            <h2 className='text-xl font-semibold mb-4'>Exercises Included</h2>
            <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {exercises.map((exercise, index) => (
                <li key={index} className='flex items-center'>
                  <span className='w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-800 rounded-full mr-3'>
                    {index + 1}
                  </span>
                  <span>{exercise}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className='mt-8 flex justify-between'>
            <button className='px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'>
              Start Today's Workout
            </button>

            <Link
              to='/leaderboard'
              className='px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50'
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
