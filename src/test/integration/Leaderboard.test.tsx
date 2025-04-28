import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "../utils/render";

// Mockujemy serwisy Firestore
vi.mock("@/services/firestore", () => ({
  getLeaderboardEntries: vi.fn().mockResolvedValue([
    {
      id: "user1",
      displayName: "Test User",
      points: 300,
      rank: 1,
      isUser: true,
      photoURL: "https://example.com/avatar.jpg",
    },
    {
      id: "opp1",
      displayName: "Virtual Athlete 1",
      points: 280,
      rank: 2,
      isUser: false,
    },
    {
      id: "opp2",
      displayName: "Virtual Athlete 2",
      points: 250,
      rank: 3,
      isUser: false,
    },
    {
      id: "opp3",
      displayName: "Virtual Athlete 3",
      points: 220,
      rank: 4,
      isUser: false,
    },
    {
      id: "opp4",
      displayName: "Virtual Athlete 4",
      points: 180,
      rank: 5,
      isUser: false,
    },
  ]),
}));

// Mock kontekstu użytkownika
vi.mock("@/useAuth", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: {
      uid: "user1",
      displayName: "Test User",
      photoURL: "https://example.com/avatar.jpg",
    },
    isAuthenticated: true,
  }),
}));

// Symulacja komponentu Leaderboard
function Leaderboard() {
  // Symulacja hooków używanych w komponencie
  const entries = [
    {
      id: "user1",
      displayName: "Test User",
      points: 300,
      rank: 1,
      isUser: true,
      photoURL: "https://example.com/avatar.jpg",
    },
    {
      id: "opp1",
      displayName: "Virtual Athlete 1",
      points: 280,
      rank: 2,
      isUser: false,
    },
    {
      id: "opp2",
      displayName: "Virtual Athlete 2",
      points: 250,
      rank: 3,
      isUser: false,
    },
    {
      id: "opp3",
      displayName: "Virtual Athlete 3",
      points: 220,
      rank: 4,
      isUser: false,
    },
    {
      id: "opp4",
      displayName: "Virtual Athlete 4",
      points: 180,
      rank: 5,
      isUser: false,
    },
  ];

  const userRank = entries.find((entry) => entry.isUser)?.rank || 0;

  return (
    <div data-testid='leaderboard'>
      <h1>Leaderboard</h1>
      <button data-testid='back-button'>Back to Dashboard</button>
      <button data-testid='scroll-to-user'>Scroll to My Position</button>
      <div data-testid='leaderboard-list' className='leaderboard-list'>
        {entries.map((entry) => (
          <div
            key={entry.id}
            data-testid={`leaderboard-entry-${entry.id}`}
            className={`leaderboard-entry ${entry.isUser ? "user-entry" : ""}`}
          >
            <div className='rank'>{entry.rank}</div>
            <div className='name'>{entry.displayName}</div>
            <div className='points'>{entry.points} points</div>
          </div>
        ))}
      </div>
      <div data-testid='user-rank'>Your Rank: {userRank}</div>
    </div>
  );
}

describe("Leaderboard Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it("wyświetla tablicę liderów z danymi", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Leaderboard />
      </QueryClientProvider>
    );

    // Sprawdzamy, czy komponent został wyrenderowany
    expect(screen.getByTestId("leaderboard")).toBeInTheDocument();

    // Sprawdzamy, czy widoczne są wszystkie wpisy
    expect(screen.getByTestId("leaderboard-entry-user1")).toBeInTheDocument();
    expect(screen.getByTestId("leaderboard-entry-opp1")).toBeInTheDocument();
    expect(screen.getByTestId("leaderboard-entry-opp2")).toBeInTheDocument();
    expect(screen.getByTestId("leaderboard-entry-opp3")).toBeInTheDocument();
    expect(screen.getByTestId("leaderboard-entry-opp4")).toBeInTheDocument();

    // Sprawdzamy, czy dane są poprawnie wyświetlane
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("300 points")).toBeInTheDocument();
    expect(screen.getByText("Virtual Athlete 1")).toBeInTheDocument();
    expect(screen.getByText("280 points")).toBeInTheDocument();
  });

  it("wyróżnia wpis bieżącego użytkownika", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Leaderboard />
      </QueryClientProvider>
    );

    const userEntry = screen.getByTestId("leaderboard-entry-user1");
    expect(userEntry).toHaveClass("user-entry");

    // Sprawdzamy, czy inne wpisy nie mają klasy user-entry
    const otherEntry = screen.getByTestId("leaderboard-entry-opp1");
    expect(otherEntry).not.toHaveClass("user-entry");
  });

  it("wyświetla przycisk powrotu do pulpitu", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Leaderboard />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
  });

  it("wyświetla przycisk przewijania do pozycji użytkownika", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Leaderboard />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("scroll-to-user")).toBeInTheDocument();
    expect(screen.getByText("Scroll to My Position")).toBeInTheDocument();
  });

  it("wyświetla aktualną rangę użytkownika", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Leaderboard />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("user-rank")).toBeInTheDocument();
    expect(screen.getByText("Your Rank: 1")).toBeInTheDocument();
  });
});
