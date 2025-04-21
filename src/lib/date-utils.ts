import { logger } from "@/lib/logger";
import { Timestamp } from "firebase/firestore";

/**
 * Format a timestamp to a human-readable date string
 */
export function formatTimestamp(timestamp: Timestamp | undefined): string {
  if (!timestamp) return "Unknown date";

  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Parse time string (e.g., "30 minutes", "1 hour") to minutes
 */
export function parseTimeString(timeString: string): number {
  if (!timeString) return 30;

  const minutes = timeString.match(/(\d+)\s*min/i);
  if (minutes) {
    return parseInt(minutes[1], 10);
  }

  const hours = timeString.match(/(\d+)\s*hour/i);
  if (hours) {
    return parseInt(hours[1], 10) * 60;
  }

  // Default to 30 minutes if format is not recognized
  return 30;
}

export const timestampToDate = (
  timestamp:
    | Timestamp
    | { _seconds: number; _nanoseconds: number }
    | Date
    | unknown
): Date => {
  if (
    timestamp &&
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    return timestamp.toDate();
  }

  if (
    timestamp &&
    typeof timestamp === "object" &&
    "_seconds" in timestamp &&
    "_nanoseconds" in timestamp
  ) {
    return new Timestamp(
      (timestamp as { _seconds: number; _nanoseconds: number })._seconds,
      (timestamp as { _seconds: number; _nanoseconds: number })._nanoseconds
    ).toDate();
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }

  logger.warn(
    "Firestore",
    "Invalid timestamp format, returning current date",
    timestamp
  );
  return new Date();
};

export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
