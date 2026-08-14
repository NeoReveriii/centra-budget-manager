import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthPageShell from "../components/AuthPageShell";
import FieldError from "../components/FieldError";
import { requestPasswordReset } from "../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateEmailAddress } from "@/lib/auth-form-validation";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const nextEmailError = validateEmailAddress(email);
    setEmailError(nextEmailError);
    if (nextEmailError) {
      document.getElementById("forgot-email")?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestPasswordReset(email.trim());
      if (result.success) {
        setSuccessMessage(
          "If an account exists for that email, a password reset link has been sent.",
        );
        setEmail("");
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Forgot your password?"
      subtitle="Enter your email address and we will send you a link to reset your password."
      footer={
        <>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            Remember your password?
          </p>
          <Link
            to="/login"
            className="ml-sm font-label-caps text-label-caps text-primary hover:underline transition-all"
          >
            Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/20 rounded-lg text-error text-body-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-body-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">mail</span>
            {successMessage}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="forgot-email" className="text-sm font-bold text-slate-800">
            Email address
          </Label>
          <Input
            id="forgot-email"
            value={email}
            onChange={(event) => {
              const value = event.target.value;
              setEmail(value);
              if (emailError) setEmailError(validateEmailAddress(value));
            }}
            placeholder="Enter your email address"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "forgot-email-error" : undefined}
            className={cn(
              "h-12 rounded-lg border-[#aebbb5] bg-white text-slate-950 placeholder:text-slate-400 dark:border-[#343434]",
              emailError && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
            )}
          />
          <FieldError id="forgot-email-error" message={emailError} />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg font-bold"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
