import * as logger from "firebase-functions/logger";

interface Quote {
  q: string; // quote
  a: string; // author
  h: string; // html format
}

/**
 * Fetches a random motivational quote from ZenQuotes API
 * This is used as a proxy to avoid CORS issues when fetching directly from the client
 */
export async function fetchMotivationalQuote(): Promise<Quote[]> {
  try {
    const response = await fetch("https://zenquotes.io/api/random");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch quote: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as Quote[];
    logger.info("Successfully fetched motivational quote");
    return data;
  } catch (error) {
    logger.error("Error fetching motivational quote:", error);
    throw error;
  }
}
