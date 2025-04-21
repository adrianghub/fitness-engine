import type { Timestamp } from "firebase-admin/firestore";

/**
 * Checks if two timestamps are from the same day
 */
export function isSameDayTimestamp(
  timestamp1: Timestamp,
  timestamp2: Timestamp
): boolean {
  const date1 = timestamp1.toDate();
  const date2 = timestamp2.toDate();

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
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
