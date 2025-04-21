/**
 * Service for fetching motivational quotes using Firebase Functions
 */
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

export interface Quote {
  q: string;
  a: string;
}

/**
 * Fetches a random motivational quote using Firebase Functions
 * This approach prevents CORS issues by calling the ZenQuotes API from our server
 *
 * @returns A promise that resolves to a Quote object
 * @throws Error if the quote cannot be fetched
 */
export async function fetchRandomQuote(): Promise<Quote> {
  try {
    const getMotivationalQuote = httpsCallable(
      functions,
      "getMotivationalQuote"
    );
    const result = await getMotivationalQuote();

    const response = result.data as { quotes: Quote[] };

    if (!response.quotes || response.quotes.length === 0) {
      throw new Error("No quotes returned from API");
    }

    return response.quotes[0];
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw new Error("Failed to fetch motivational quote");
  }
}
