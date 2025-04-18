import type { Timestamp } from "firebase/firestore";

export function formatTimestamp(timestamp: Timestamp | undefined): string {
  if (!timestamp) return "Unknown date";

  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
