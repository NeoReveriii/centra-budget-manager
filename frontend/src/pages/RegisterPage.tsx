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
import {
  validateEmailAddress,
  validatePassword,
  validateRequiredValue,
} from "@/lib/auth-form-validation";
import { cn } from "@/lib/utils";

interface RegisterFieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  terms?: string;
}

export default function RegisterPage() {
  const { register, loginWithSocial } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const nextFieldErrors: RegisterFieldErrors = {
      firstName: validateRequiredValue(firstName, "Enter your first name."),
      lastName: validateRequiredValue(lastName, "Enter your last name."),
      email: validateEmailAddress(email),
      password: validatePassword(password, 8),
      terms: acceptedTerms ? "" : "Review and accept the Terms of Use and Privacy Notice to continue.",
    };
    setFieldErrors(nextFieldErrors);

    const firstInvalidId = [
      [nextFieldErrors.firstName, "register-first-name"],
      [nextFieldErrors.lastName, "register-last-name"],
      [nextFieldErrors.email, "register-email"],
      [nextFieldErrors.password, "register-password"],
      [nextFieldErrors.terms, "register-terms"],
    ].find(([message]) => Boolean(message))?.[1];

    if (firstInvalidId) {
      document.getElementById(firstInvalidId)?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const result = await register(fullName, email.trim(), password);
      if (result.success) navigate("/dashboard", { replace: true });
      else setError(result.error || "We could not create your account. Check your details and try again.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We could not create your account. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocial(provider: "google" | "apple") {
    setError("");
    if (!acceptedTerms) {
      setFieldErrors((current) => ({
        ...current,
        terms: "Review and accept the Terms of Use and Privacy Notice to continue.",
      }));
      document.getElementById("register-terms")?.focus();
      return;
    }
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
      mode="register"
      title="Create your account"
      subtitle="Set up your Centra workspace today."
    >
      {error && (
        <div role="alert" className="mb-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
          <span>{error}</span>
        </div>
      )}

      <SocialAuthButtons onSocial={handleSocial} disabled={isLoading || !acceptedTerms} />

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-300" />
        <span className="text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">
          Or continue with email
        </span>
        <div className="h-px flex-1 bg-slate-300" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="register-first-name" className="text-sm font-bold text-slate-800">First name</Label>
            <Input
              id="register-first-name"
              value={firstName}
              onChange={(event) => {
                const value = event.target.value;
                setFirstName(value);
                if (fieldErrors.firstName) {
                  setFieldErrors((current) => ({
                    ...current,
                    firstName: validateRequiredValue(value, "Enter your first name."),
                  }));
                }
              }}
              placeholder="Enter your first name"
              autoComplete="given-name"
              required
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? "register-first-name-error" : undefined}
              className={cn(
                "h-12 rounded-lg border-[#aebbb5] bg-white text-slate-950 placeholder:text-slate-400 dark:border-[#343434]",
                fieldErrors.firstName && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
              )}
            />
            <FieldError id="register-first-name-error" message={fieldErrors.firstName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-last-name" className="text-sm font-bold text-slate-800">Last name</Label>
            <Input
              id="register-last-name"
              value={lastName}
              onChange={(event) => {
                const value = event.target.value;
                setLastName(value);
                if (fieldErrors.lastName) {
                  setFieldErrors((current) => ({
                    ...current,
                    lastName: validateRequiredValue(value, "Enter your last name."),
                  }));
                }
              }}
              placeholder="Enter your last name"
              autoComplete="family-name"
              required
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? "register-last-name-error" : undefined}
              className={cn(
                "h-12 rounded-lg border-[#aebbb5] bg-white text-slate-950 placeholder:text-slate-400 dark:border-[#343434]",
                fieldErrors.lastName && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
              )}
            />
            <FieldError id="register-last-name-error" message={fieldErrors.lastName} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-sm font-bold text-slate-800">Email address</Label>
          <Input
            id="register-email"
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
            aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
            className={cn(
              "h-12 rounded-lg border-[#aebbb5] bg-white text-slate-950 placeholder:text-slate-400 dark:border-[#343434]",
              fieldErrors.email && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
            )}
          />
          <FieldError id="register-email-error" message={fieldErrors.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-sm font-bold text-slate-800">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              value={password}
              onChange={(event) => {
                const value = event.target.value;
                setPassword(value);
                if (fieldErrors.password) {
                  setFieldErrors((current) => ({ ...current, password: validatePassword(value, 8) }));
                }
              }}
              placeholder="Choose a secure password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "register-password-error" : "register-password-help"}
              className={cn(
                "h-12 rounded-lg border-[#aebbb5] bg-white pr-12 text-slate-950 placeholder:text-slate-400 dark:border-[#343434]",
                fieldErrors.password && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
              )}
            />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md bg-transparent text-slate-600 transition-[color,transform] duration-200 hover:bg-transparent hover:text-primary active:scale-[0.96] focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30">
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
          <FieldError id="register-password-error" message={fieldErrors.password} />
          {!fieldErrors.password && (
            <p id="register-password-help" className="text-xs font-medium leading-5 text-slate-500">
              Use at least 8 characters.
            </p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-lg font-bold">
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="mt-5 rounded-xl border border-slate-300 bg-slate-50 p-4">
        <label htmlFor="register-terms" className="flex cursor-pointer items-start gap-3 text-sm font-medium leading-6 text-slate-700">
          <input
            id="register-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => {
              setAcceptedTerms(event.target.checked);
              if (event.target.checked) {
                setFieldErrors((current) => ({ ...current, terms: "" }));
              }
            }}
            aria-invalid={Boolean(fieldErrors.terms)}
            aria-describedby={fieldErrors.terms ? "register-terms-error" : undefined}
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
          />
          <span>
            I have read and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-extrabold text-primary underline underline-offset-4">Terms of Use</a>
            {" "}and acknowledge the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-extrabold text-primary underline underline-offset-4">Privacy Notice</a>, including Kwarta AI processing.
          </span>
        </label>
        <FieldError id="register-terms-error" message={fieldErrors.terms} />
      </div>

      <p className="mt-5 text-center text-sm font-medium text-slate-600">
        Already have an account?
        <Link to="/login" className="ml-1 inline-block font-bold text-primary transition-[color,transform] duration-200 hover:-translate-y-px hover:text-primary-container hover:underline motion-reduce:transition-none motion-reduce:hover:translate-y-0">Sign in</Link>
      </p>
    </AuthPageShell>
  );
}
