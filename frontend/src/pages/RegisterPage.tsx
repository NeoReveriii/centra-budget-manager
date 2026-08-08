import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthPageShell from "../components/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const { register, loginWithSocial } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
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
      const result = await register(username.trim(), email.trim(), password);
      if (result.success) navigate("/dashboard", { replace: true });
      else setError(result.error || "We could not create your account.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We could not create your account.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocial(provider: "google" | "apple") {
    setError("");
    setIsLoading(true);
    try {
      const result = await loginWithSocial(provider);
      if (!result.success) setError(result.error || "Social sign-in failed.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Social sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell mode="register" title="Create your Centra account" subtitle="Start with a clearer view of the money that matters to you.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>{error}</div>}
        <div className="space-y-2"><Label htmlFor="register-name" className="text-sm font-semibold text-slate-700">Your name</Label><Input id="register-name" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="How should we call you?" autoComplete="name" required className="h-12 rounded-xl bg-white" /></div>
        <div className="space-y-2"><Label htmlFor="register-email" className="text-sm font-semibold text-slate-700">Email address</Label><Input id="register-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" required className="h-12 rounded-xl bg-white" /></div>
        <div className="space-y-2"><Label htmlFor="register-password" className="text-sm font-semibold text-slate-700">Password</Label><div className="relative"><Input id="register-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required className="h-12 rounded-xl bg-white pr-12" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-3 flex w-10 items-center justify-center text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">{showPassword ? "visibility_off" : "visibility"}</span></button></div><p className="text-xs text-slate-400">Use at least 8 characters.</p></div>
        <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-xl bg-primary font-bold shadow-[0_8px_20px_rgba(0,53,39,0.14)] hover:-translate-y-0.5 hover:bg-primary-container hover:shadow-[0_12px_26px_rgba(0,53,39,0.2)]">{isLoading ? "Creating your account..." : "Create account"}</Button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-slate-400">By continuing, you agree to Centra’s terms and privacy policy.</p>
      <div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">Or use another account</span><div className="h-px flex-1 bg-slate-200" /></div>
      <div className="space-y-3"><Button type="button" variant="outline" onClick={() => handleSocial("google")} disabled={isLoading} className="w-full rounded-xl border-slate-200 bg-white"><span className="text-base font-extrabold text-[#4285F4]" aria-hidden="true">G</span>Continue with Google</Button><Button type="button" onClick={() => handleSocial("apple")} disabled={isLoading} className="w-full rounded-xl bg-slate-950 hover:bg-slate-800">Continue with Apple</Button></div>
      <div className="mt-7 text-center text-sm text-slate-500"><span>Already have an account?</span><Link to="/login" className="ml-1 font-bold text-primary hover:text-primary-container hover:underline">Sign in</Link></div>
    </AuthPageShell>
  );
}
