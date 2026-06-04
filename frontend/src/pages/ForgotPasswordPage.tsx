import { useState } from "react";
import { Link } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";
import { requestPasswordReset } from "../lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
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
            to="/"
            className="ml-sm font-label-caps text-label-caps text-primary hover:underline transition-all"
          >
            Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-lg">
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

        <div className="space-y-xs">
          <label
            className="font-label-caps text-label-caps text-secondary uppercase"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            className="w-full bg-surface border border-outline-variant px-md py-3 font-body-md text-on-surface hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-300 outline-none shadow-sm"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. you@example.com"
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-container text-on-primary font-bold text-sm py-3 px-xl rounded-full flex items-center justify-center hover:bg-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="uppercase tracking-widest">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </span>
        </button>
      </form>
    </AuthPageShell>
  );
}
