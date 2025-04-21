import { Quote, fetchRandomQuote } from "@/services/quotes";
import { useCallback, useEffect, useState } from "react";

const FALLBACK_QUOTES: Quote[] = [
  { q: "The only bad workout is the one that didn't happen.", a: "Unknown" },
  {
    q: "Strength does not come from the body. It comes from the will.",
    a: "Mahatma Gandhi",
  },
  {
    q: "The difference between try and triumph is a little umph.",
    a: "Marvin Phillips",
  },
  {
    q: "The hard days are the best because that's when champions are made.",
    a: "Gabrielle Reece",
  },
  {
    q: "Success is usually the culmination of controlling failure.",
    a: "Sylvester Stallone",
  },
];

interface UseQuoteResult {
  quote: Quote | null;
  isLoading: boolean;
  error: boolean;
  refreshQuote: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing motivational quotes
 *
 * If the API fails, it will use a random fallback quote from a predefined list.
 *
 * @returns Object containing quote data, loading state, error state, and a refresh function
 */
export function useQuote(): UseQuoteResult {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchQuote = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const newQuote = await fetchRandomQuote();
      setQuote(newQuote);
    } catch (err) {
      console.error("Error in useQuote:", err);
      setError(true);

      // Use a fallback quote if the API call fails
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      setQuote(FALLBACK_QUOTES[randomIndex]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch quote on initial mount
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return {
    quote,
    isLoading,
    error,
    refreshQuote: fetchQuote,
  };
}
