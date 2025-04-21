import googleIcon from "@/assets/google.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLoginForm } from "@/modules/login/useLoginForm";

interface LoginFormProps {
  redirectUrl?: string;
}

export function LoginForm({ redirectUrl }: LoginFormProps) {
  const { error, googleLoading, handleGoogleSignIn } =
    useLoginForm(redirectUrl);

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Login Form</CardTitle>
        <CardDescription className='text-md text-muted-foreground'>
          Login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            "Signing in with Google..."
          ) : (
            <>
              <img src={googleIcon} alt='Google' className='w-4 h-4' />
              Sign in with Google
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className='flex flex-col space-y-4'>
        {error && <p className='text-sm text-destructive'>{error}</p>}
      </CardFooter>
    </Card>
  );
}
