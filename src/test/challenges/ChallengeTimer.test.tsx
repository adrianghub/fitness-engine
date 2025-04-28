import { useChallengeTimer } from "@/modules/challenges/hooks/useChallengeTimer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock date-utils
vi.mock("@/lib/date-utils", () => ({
  formatTime: vi.fn().mockImplementation((ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }),
}));

// Mock Cloud Functions
vi.mock("@/services/cloud-functions", () => ({
  checkChallengeExpirationEndpoint: vi.fn().mockResolvedValue({
    expired: true,
    canRetry: true,
  }),
}));

// Create a wrapper with QueryClientProvider for the tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Tests
describe("useChallengeTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock Date.now to return a consistent value
    vi.spyOn(Date, "now").mockImplementation(() =>
      new Date("2023-01-01T00:00:00Z").getTime()
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("correctly calculates remaining time and progress", () => {
    // 2 minutes ago (create a fixed date 2 minutes before our mocked Date.now)
    const fixedNow = new Date("2023-01-01T00:00:00Z").getTime();
    const twoMinutesAgo = new Date(fixedNow - 2 * 60 * 1000);

    const { result } = renderHook(
      () =>
        useChallengeTimer({
          challengeId: "challenge-1",
          expectedTimeInMinutes: 5, // 5 minutes
          startedAt: twoMinutesAgo,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.formattedTimeRemaining).toBe("3:00"); // 3 minutes should remain
    // In the actual implementation, progress is (remaining/total * 100)
    // So with 3 minutes remaining out of 5, it's 3/5 * 100 = 60%
    expect(result.current.progressPercentage).toBe(60);
    expect(result.current.isExpired).toBe(false);
  });

  it("marks challenge as expired when time runs out", () => {
    // 10 minutes ago (more than expected time)
    const fixedNow = new Date("2023-01-01T00:00:00Z").getTime();
    const tenMinutesAgo = new Date(fixedNow - 10 * 60 * 1000);

    const { result } = renderHook(
      () =>
        useChallengeTimer({
          challengeId: "challenge-1",
          expectedTimeInMinutes: 5, // 5 minutes
          startedAt: tenMinutesAgo,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.formattedTimeRemaining).toBe("0:00");
    expect(result.current.progressPercentage).toBe(0); // In real implementation, it's 0 when expired
    expect(result.current.isExpired).toBe(true);
  });

  it("updates remaining time as time passes", () => {
    // Use a specific fixed time
    const baseTime = new Date("2023-01-01T00:00:00Z").getTime();
    vi.spyOn(Date, "now").mockImplementation(() => baseTime);

    // Start time is the same as now (just started)
    const startTime = new Date(baseTime);

    const { result } = renderHook(
      () =>
        useChallengeTimer({
          challengeId: "challenge-1",
          expectedTimeInMinutes: 5, // 5 minutes
          startedAt: startTime,
        }),
      { wrapper: createWrapper() }
    );

    // Initial values
    expect(result.current.formattedTimeRemaining).toBe("5:00");
    expect(result.current.progressPercentage).toBe(100);

    // First, clear any existing intervals from the effect
    act(() => {
      vi.runOnlyPendingTimers();
    });

    // Now advance time by 1 minute and update the mock
    act(() => {
      // Update the mock of Date.now before running timers
      const oneMinuteLater = baseTime + 60 * 1000;
      vi.spyOn(Date, "now").mockImplementation(() => oneMinuteLater);

      // Run all timers - this should trigger the interval callback
      vi.runOnlyPendingTimers();
    });

    // After time has advanced
    expect(result.current.formattedTimeRemaining).toBe("4:00");
    expect(result.current.progressPercentage).toBe(80);
  });

  it("handles edge cases when startedAt is not provided", () => {
    const { result } = renderHook(
      () =>
        useChallengeTimer({
          challengeId: "challenge-1",
          expectedTimeInMinutes: 5,
          startedAt: undefined,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.formattedTimeRemaining).toBe("--:--");
    expect(result.current.progressPercentage).toBe(0);
    expect(result.current.isExpired).toBe(false);
  });
});
