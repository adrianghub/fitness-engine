import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLoginForm } from "@/modules/login/useLoginForm";

export function LoginForm() {
  const {
    email,
    password,
    error,
    loading,
    googleLoading,
    validationErrors,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleSignIn,
  } = useLoginForm();

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Login</CardTitle>
        <CardDescription className='text-md text-muted-foreground'>
          Login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={handleEmailChange}
              placeholder='Email'
              required
            />
            {validationErrors.email && (
              <p className='text-sm text-destructive'>
                {validationErrors.email}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={handlePasswordChange}
              placeholder='••••••••'
              required
            />
            {validationErrors.password && (
              <p className='text-sm text-destructive'>
                {validationErrors.password}
              </p>
            )}
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className='flex flex-col space-y-4'>
        <div className='relative w-full'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>
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
              <img src='/google.svg' alt='Google' className='w-4 h-4' />
              Sign in with Google
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
