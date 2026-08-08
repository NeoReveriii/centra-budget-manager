import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthPageShell from "../components/AuthPageShell";
import SocialAuthButtons from "../components/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const { register, loginWithSocial } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
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

      <SocialAuthButtons onSocial={handleSocial} disabled={isLoading} />

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase">
          Or continue with email
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="register-first-name" className="text-sm font-semibold text-slate-700">First name</Label>
            <Input id="register-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" autoComplete="given-name" required className="h-12 rounded-lg border-slate-300 bg-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-last-name" className="text-sm font-semibold text-slate-700">Last name</Label>
            <Input id="register-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" autoComplete="family-name" required className="h-12 rounded-lg border-slate-300 bg-white" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-sm font-semibold text-slate-700">Email address</Label>
          <Input id="register-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" required className="h-12 rounded-lg border-slate-300 bg-white" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-sm font-semibold text-slate-700">Password</Label>
          <div className="relative">
            <Input id="register-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Choose a secure password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required className="h-12 rounded-lg border-slate-300 bg-white pr-12" />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-2 flex w-11 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-lg bg-primary font-bold text-white shadow-[0_8px_20px_rgba(0,53,39,0.14)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-primary-container hover:shadow-[0_12px_26px_rgba(0,53,39,0.2)]">
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-slate-400">
        By continuing, you agree to our <a href="/views/terms.html" className="font-semibold text-slate-600 hover:underline">Terms</a> and <a href="/views/privacy.html" className="font-semibold text-slate-600 hover:underline">Privacy Policy</a>.
      </p>
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?
        <Link to="/login" className="ml-1 font-bold text-primary hover:underline">Sign in</Link>
      </p>
    </AuthPageShell>
  );
}
