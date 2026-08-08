import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FieldError from "../components/FieldError";
import AuthPageShell from "../components/AuthPageShell";
import { resetPasswordWithToken } from "../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePassword } from "@/lib/auth-form-validation";
import { cn } from "@/lib/utils";

interface ResetPasswordFieldErrors {
  password?: string;
  confirmPassword?: string;
}

function validateConfirmation(password: string, confirmation: string) {
  if (!confirmation) return "Re-enter your new password to confirm it.";
  if (password !== confirmation) {
    return "The passwords do not match. Enter the same password in both fields.";
  }
  return "";
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const hasValidToken = Boolean(token && token !== "INVALID_TOKEN");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!hasValidToken) {
      setError("This reset link is invalid or has expired. Please request a new one.");
    }
  }, [hasValidToken]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!hasValidToken || !token) {
      setError("This reset link is invalid or has expired. Please request a new one.");
      return;
    }

    const nextFieldErrors: ResetPasswordFieldErrors = {
      password: validatePassword(password, 8),
      confirmPassword: validateConfirmation(password, confirmPassword),
    };
    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.password || nextFieldErrors.confirmPassword) {
      const firstInvalidId = nextFieldErrors.password ? "reset-password" : "reset-confirm-password";
      document.getElementById(firstInvalidId)?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordWithToken(password, token);
      if (result.success) {
        setSuccessMessage("Your password has been updated. You can now sign in with your new password.");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Set a new password"
      subtitle="Choose a strong password for your Centra account."
      footer={
        <>
          <span className="text-sm font-medium text-slate-600">Need a new link?</span>
          <Link to="/forgot-password" className="ml-2 text-sm font-bold text-primary hover:underline">
            Request again
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
            {error}
          </div>
        )}

        {successMessage && (
          <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check_circle</span>
            {successMessage}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reset-password" className="text-sm font-bold text-slate-800">
            New password
          </Label>
          <div className="relative">
            <Input
              id="reset-password"
              value={password}
              onChange={(event) => {
                const value = event.target.value;
                setPassword(value);
                if (fieldErrors.password || fieldErrors.confirmPassword) {
                  setFieldErrors({
                    password: validatePassword(value, 8),
                    confirmPassword: validateConfirmation(value, confirmPassword),
                  });
                }
              }}
              placeholder="Enter your new password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={!hasValidToken || Boolean(successMessage)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "reset-password-error" : "reset-password-help"}
              className={cn(
                "h-12 rounded-lg border-[#aebbb5] bg-white pr-12 text-slate-950 placeholder:text-slate-400",
                fieldErrors.password && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
              )}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
              className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-emerald-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          <FieldError id="reset-password-error" message={fieldErrors.password} />
          {!fieldErrors.password && (
            <p id="reset-password-help" className="text-xs font-medium leading-5 text-slate-500">
              Use at least 8 characters.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-confirm-password" className="text-sm font-bold text-slate-800">
            Confirm password
          </Label>
          <Input
            id="reset-confirm-password"
            value={confirmPassword}
            onChange={(event) => {
              const value = event.target.value;
              setConfirmPassword(value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((current) => ({
                  ...current,
                  confirmPassword: validateConfirmation(password, value),
                }));
              }
            }}
            placeholder="Re-enter your new password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={!hasValidToken || Boolean(successMessage)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={fieldErrors.confirmPassword ? "reset-confirm-password-error" : undefined}
            className={cn(
              "h-12 rounded-lg border-[#aebbb5] bg-white text-slate-950 placeholder:text-slate-400",
              fieldErrors.confirmPassword && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
            )}
          />
          <FieldError id="reset-confirm-password-error" message={fieldErrors.confirmPassword} />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !hasValidToken || Boolean(successMessage)}
          className="h-12 w-full rounded-lg bg-primary font-bold text-white shadow-[0_8px_20px_rgba(0,53,39,0.14)] hover:bg-primary-container"
        >
          {isLoading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
