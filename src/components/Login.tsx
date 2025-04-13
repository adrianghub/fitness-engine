import { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", email);

    // Mock authentication - in a real app, this would call an auth service
    localStorage.setItem("auth", "true");
    window.location.href = "/personalization";
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");

    // Mock Google authentication
    localStorage.setItem("auth", "true");
    window.location.href = "/personalization";
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-3xl font-extrabold tracking-tight'>
            Fitness Engine
          </h1>
          <p className='mt-2 text-muted-foreground'>Sign in to your account</p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleLogin}>
          <div className='rounded-md shadow-sm space-y-4'>
            <div>
              <label htmlFor='email' className='sr-only'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='appearance-none relative block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-accent-foreground focus:border-accent-foreground'
                placeholder='Email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='appearance-none relative block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-accent-foreground focus:border-accent-foreground'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-background bg-accent-foreground hover:bg-accent-foreground/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-foreground'
            >
              Sign in
            </button>
          </div>
        </form>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-background text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>

          <div className='mt-6'>
            <button
              onClick={handleGoogleLogin}
              className='w-full flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent-foreground hover:text-background'
            >
              <svg className='h-5 w-5 mr-2' viewBox='0 0 24 24'>
                <path
                  d='M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.139-2.701-6.735-2.701-5.522 0-10.001 4.478-10.001 10s4.479 10 10.001 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.081z'
                  fill='currentColor'
                />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
