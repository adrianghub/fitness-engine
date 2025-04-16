import { useAuth } from "@/useAuth";

export function Dashboard() {
  const { userData } = useAuth();

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>
          Welcome, {userData?.displayName}!
        </h1>
      </div>
    </div>
  );
}
