import { signIn } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import { validateEmail, validatePassword } from "@/modules/login/validations";
import { useAuth } from "@/useAuth";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { FirebaseError } from "firebase/app";
import { useState } from "react";

type LoginFormData = {
  email: string;
  password: string;
};

export function useLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const getRedirectUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("redirect") || "/";
  };

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }: { value: LoginFormData }) => {
      setError(null);
      setLoading(true);

      try {
        await signIn(value.email, value.password);
      } catch (err) {
        if (err instanceof FirebaseError) {
          const errorMessage =
            err.code === "auth/invalid-credential"
              ? "Invalid credentials"
              : err.code === "auth/too-many-requests"
                ? "Too many attempts"
                : err.code === "auth/network-request-failed"
                  ? "Offline"
                  : "Generic error";
          setError(errorMessage);
        } else {
          setError("Generic error");
        }
        logger.error(
          "Login error:",
          err instanceof Error ? err.message : String(err)
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldValue("email", value);
    const emailError = validateEmail(value);
    setValidationErrors((prev) => ({ ...prev, email: emailError }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldValue("password", value);
    const passwordError = validatePassword(value);
    setValidationErrors((prev) => ({ ...prev, password: passwordError }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(form.getFieldValue("email"));
    const passwordError = validatePassword(form.getFieldValue("password"));

    setValidationErrors({
      email: emailError,
      password: passwordError,
    });

    if (!emailError && !passwordError) {
      form.handleSubmit();
    }
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
    email: form.getFieldValue("email"),
    password: form.getFieldValue("password"),
    error,
    loading,
    googleLoading,
    validationErrors,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleSignIn,
  };
}
