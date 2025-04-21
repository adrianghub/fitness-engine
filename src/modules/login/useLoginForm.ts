import { signInWithGoogle } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function useLoginForm(redirectUrl?: string) {
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const getRedirectUrl = () => {
    if (redirectUrl) return redirectUrl;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("redirect") || "/dashboard";
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      navigate({ to: getRedirectUrl() });
    } catch (err) {
      setError("Generic error");
      logger.error(
        "Google login error:",
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    error,
    googleLoading,
    handleGoogleSignIn,
  };
}
