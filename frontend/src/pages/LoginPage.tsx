import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthPageShell from "../components/AuthPageShell";
import FieldError from "../components/FieldError";
import SocialAuthButtons from "../components/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateEmailAddress, validatePassword } from "@/lib/auth-form-validation";
import { cn } from "@/lib/utils";

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { login, loginWithSocial } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const nextFieldErrors: LoginFieldErrors = {
      email: validateEmailAddress(email),
      password: validatePassword(password),
    };
    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.password) {
      const firstInvalidId = nextFieldErrors.email ? "login-email" : "login-password";
      document.getElementById(firstInvalidId)?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);
      if (result.success) navigate("/dashboard", { replace: true });
      else setError(result.error || "We could not sign you in. Check your details and try again.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We could not sign you in. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocial(provider: "google" | "apple") {
    setError("");
    setIsLoading(true);

    try {
      const result = await loginWithSocial(provider);
      if (!result.success) setError(result.error || "Social sign-in failed. Try again.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Social sign-in failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell
      mode="login"
      title="Welcome back"
      subtitle="Sign in to continue to your Centra workspace."
    >
      {error && (
        <div role="alert" className="mb-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
          <span>{error}</span>
        </div>
      )}

      <SocialAuthButtons onSocial={handleSocial} disabled={isLoading} />

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-300" />
        <span className="text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">
          Or continue with email
        </span>
        <div className="h-px flex-1 bg-slate-300" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-sm font-bold text-slate-800">Email address</Label>
          <Input
            id="login-email"
            value={email}
            onChange={(event) => {
              const value = event.target.value;
              setEmail(value);
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: validateEmailAddress(value) }));
              }
            }}
            placeholder="Enter your email address"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className={cn(
              "h-12 rounded-lg border-[#aebbb5] bg-white text-slate-950 shadow-[0_2px_8px_rgba(15,23,42,0.05)] placeholder:text-slate-400",
              fieldErrors.email && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
            )}
          />
          <FieldError id="login-email-error" message={fieldErrors.email} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-sm font-bold text-slate-800">Password</Label>
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              value={password}
              onChange={(event) => {
                const value = event.target.value;
                setPassword(value);
                if (fieldErrors.password) {
                  setFieldErrors((current) => ({ ...current, password: validatePassword(value) }));
                }
              }}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
              className={cn(
                "h-12 rounded-lg border-[#aebbb5] bg-white pr-12 text-slate-950 shadow-[0_2px_8px_rgba(15,23,42,0.05)] placeholder:text-slate-400",
                fieldErrors.password && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
              )}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md bg-transparent text-slate-600 transition-[color,transform] duration-200 hover:bg-transparent hover:text-primary active:scale-[0.96] focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
            >
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          <FieldError id="login-password-error" message={fieldErrors.password} />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg bg-primary font-bold text-white shadow-[0_8px_20px_rgba(0,53,39,0.14)] hover:bg-primary-container hover:shadow-[0_12px_26px_rgba(0,53,39,0.2)]"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs font-medium leading-5 text-slate-500">
        By continuing, you agree to our{" "}
        <a href="/views/terms.html" className="font-bold text-slate-700 hover:text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/views/privacy.html" className="font-bold text-slate-700 hover:text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>

      <p className="mt-5 text-center text-sm font-medium text-slate-600">
        New to Centra?
        <Link to="/register" className="ml-1 font-bold text-primary hover:underline">Create an account</Link>
      </p>
    </AuthPageShell>
  );
}
