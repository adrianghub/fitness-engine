import { useState } from "react";

type FitnessLevel = "beginner" | "intermediate" | "advanced";
type FitnessGoal =
  | "strength"
  | "cardio"
  | "weightLoss"
  | "flexibility"
  | "muscleGain";

export function Personalization() {
  const [displayName, setDisplayName] = useState("");
  const [level, setLevel] = useState<FitnessLevel>("beginner");
  const [goals, setGoals] = useState<FitnessGoal[]>([]);

  const handleGoalToggle = (goal: FitnessGoal) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!displayName || goals.length === 0) {
      alert("Please fill out all required fields");
      return;
    }

    console.log("Saving personalization:", {
      displayName,
      level,
      goals,
    });

    // TODO: Save to a user profile in your database
    localStorage.setItem("personalized", "true");
    window.location.href = "/dashboard";
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='w-full max-w-2xl p-8 space-y-8 bg-background rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-3xl font-extrabold tracking-tight'>
            Welcome to Fitness Engine!
          </h1>
          <p className='mt-2 text-muted-foreground'>
            Let's personalize your experience
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor='displayName'
              className='block text-sm font-medium text-muted-foreground'
            >
              What should we call you?
            </label>
            <input
              id='displayName'
              name='displayName'
              type='text'
              required
              className='mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent-foreground focus:border-accent-foreground'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              Your current fitness level
            </label>
            <div className='mt-2 grid grid-cols-3 gap-2'>
              {["beginner", "intermediate", "advanced"].map((option) => (
                <button
                  key={option}
                  type='button'
                  className={`${
                    level === option
                      ? "bg-accent-foreground text-background"
                      : "bg-background text-muted-foreground hover:bg-accent-foreground hover:text-background"
                  } px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-foreground`}
                  onClick={() => setLevel(option as FitnessLevel)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Fitness Goals */}
          <div>
            <label className='block text-sm font-medium text-muted-foreground'>
              Fitness Goals (select at least one)
            </label>
            <div className='mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {[
                { id: "strength", label: "Strength" },
                { id: "cardio", label: "Cardio" },
                { id: "weightLoss", label: "Weight Loss" },
                { id: "flexibility", label: "Flexibility" },
                { id: "muscleGain", label: "Muscle Gain" },
              ].map((goal) => (
                <button
                  key={goal.id}
                  type='button'
                  className={`${
                    goals.includes(goal.id as FitnessGoal)
                      ? "bg-accent-foreground text-background"
                      : "bg-background text-muted-foreground hover:bg-accent-foreground hover:text-background"
                  } px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-foreground`}
                  onClick={() => handleGoalToggle(goal.id as FitnessGoal)}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-background bg-accent-foreground hover:bg-accent-foreground/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-foreground'
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
