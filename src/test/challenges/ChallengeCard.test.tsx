import { ChallengeCard } from "@/modules/challenges/components/ChallengeCard";
import { Timestamp } from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../utils/render";

vi.mock("@/modules/challenges/hooks/useChallengeTimer", () => ({
  useChallengeTimer: vi.fn().mockReturnValue({
    formattedTimeRemaining: "4:35",
    progressPercentage: 25,
    isExpired: false,
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    to: string | { pathname: string; params?: Record<string, string> };
    params?: Record<string, string>;
    disabled?: boolean;
    className?: string;
  }) => (
    <a
      href={typeof to === "string" ? to : "/mocked-link"}
      data-testid='router-link'
      className={className}
      aria-disabled={disabled}
    >
      {children}
    </a>
  ),
  createRootRoute: vi.fn(),
  createRoute: vi.fn(),
  createRouter: vi.fn(),
  createFileRoute: vi.fn(),
  lazyRouteComponent: vi.fn(),
  Outlet: vi.fn().mockImplementation(() => null),
  RouterProvider: vi.fn().mockImplementation(({ children }) => children),
}));

// Mock the routeTree to avoid router initialization
vi.mock("../../routeTree.gen", () => ({
  routeTree: {
    _addFileChildren: vi.fn().mockReturnThis(),
    _addFileTypes: vi.fn().mockReturnThis(),
  },
}));

describe("ChallengeCard", () => {
  it("displays basic challenge information", () => {
    render(
      <ChallengeCard
        id='challenge-1'
        title='20 Push-ups'
        description='Complete 20 push-ups in proper form'
        points={50}
        type='daily'
        status='not-started'
        level='intermediate'
        expectedTime='5m'
      />
    );

    expect(screen.getByText("20 Push-ups")).toBeInTheDocument();
    expect(
      screen.getByText("Complete 20 push-ups in proper form")
    ).toBeInTheDocument();
    expect(screen.getByText("50 points")).toBeInTheDocument();
    expect(screen.getByText("5m")).toBeInTheDocument();
    expect(screen.getByText("intermediate")).toBeInTheDocument();
  });

  it('displays "Start Exercise" button for a challenge with not-started status', () => {
    render(
      <ChallengeCard
        id='challenge-1'
        title='20 Push-ups'
        description='Complete 20 push-ups in proper form'
        points={50}
        type='daily'
        status='not-started'
        level='intermediate'
      />
    );

    expect(screen.getByText("Start Exercise")).toBeInTheDocument();
  });

  it('displays "Continue Challenge" button for a challenge in progress', () => {
    const startedAt = Timestamp.fromDate(new Date());

    render(
      <ChallengeCard
        id='challenge-1'
        title='20 Push-ups'
        description='Complete 20 push-ups in proper form'
        points={50}
        type='daily'
        status='in-progress'
        startedAt={startedAt}
        expectedTime='5m'
        level='intermediate'
      />
    );

    expect(screen.getByText("Continue Challenge")).toBeInTheDocument();
  });

  it("displays timer for a challenge in progress", () => {
    const startedAt = Timestamp.fromDate(new Date());

    render(
      <ChallengeCard
        id='challenge-1'
        title='20 Push-ups'
        description='Complete 20 push-ups in proper form'
        points={50}
        type='daily'
        status='in-progress'
        startedAt={startedAt}
        expectedTime='5m'
        level='intermediate'
      />
    );

    expect(screen.getByText("4:35")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("displays custom component in footer when footerContent is provided", () => {
    const footerContent = (
      <button data-testid='custom-button'>Custom Action</button>
    );

    render(
      <ChallengeCard
        id='challenge-1'
        title='20 Push-ups'
        description='Complete 20 push-ups in proper form'
        points={50}
        type='daily'
        status='not-started'
        level='intermediate'
        footerContent={footerContent}
      />
    );

    expect(screen.getByTestId("custom-button")).toBeInTheDocument();
    expect(screen.queryByText("Start Exercise")).not.toBeInTheDocument();
  });

  it("displays badge for difficulty level", () => {
    render(
      <ChallengeCard
        id='challenge-1'
        title='20 Push-ups'
        description='Complete 20 push-ups in proper form'
        points={50}
        type='daily'
        status='not-started'
        level='advanced'
      />
    );

    expect(screen.getByText("advanced")).toBeInTheDocument();
  });

  it("displays custom badge when provided", () => {
    const customBadge = <span data-testid='custom-badge'>Special</span>;

    render(
      <ChallengeCard
        id='challenge-1'
        title='20 Push-ups'
        description='Complete 20 push-ups in proper form'
        points={50}
        type='daily'
        status='not-started'
        customBadge={customBadge}
      />
    );

    expect(screen.getByTestId("custom-badge")).toBeInTheDocument();
  });
});
