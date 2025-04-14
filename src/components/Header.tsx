import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/firebase";
import { useAuth } from "@/useAuth";
import { Link, useNavigate } from "@tanstack/react-router";
import { Dumbbell, LogOut } from "lucide-react";

export function Header() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className='border-b'>
      <div className='flex h-16 items-center px-4'>
        <Link to='/' className='flex items-center space-x-2'>
          <Dumbbell className='h-6 w-6' />
          <span className='text-xl font-bold'>FitnessEngine</span>
        </Link>

        {currentUser && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleLogout}
            className='flex items-center gap-2 ml-auto'
          >
            <LogOut className='h-4 w-4' />
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
