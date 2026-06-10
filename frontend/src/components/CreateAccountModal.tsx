import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateAccountModalProps {
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const CreateAccountModal = ({
  onClose,
  onSwitchToLogin,
}: CreateAccountModalProps) => {
  const { register, loginWithSocial } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await register(username, email, password);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocialSignIn(provider: "google" | "apple") {
    setError("");
    setIsLoading(true);
    try {
      const res = await loginWithSocial(provider);
      if (!res.success) {
        if (res.error) setError(res.error);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Social sign-in failed");
      setIsLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[520px] p-0 gap-0 overflow-hidden border-0 shadow-2xl"
        showCloseButton
      >
        <DialogHeader className="px-8 pt-10 pb-4 text-center">
          <DialogTitle className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Create an account
          </DialogTitle>
          <DialogDescription className="sr-only">
            Register with email or social providers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/20 rounded-lg text-error text-body-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="font-label-caps text-label-caps text-secondary uppercase"
            >
              Username
            </Label>
            <Input
              id="username"
              className="rounded-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-label-caps text-label-caps text-secondary uppercase"
            >
              Email Address
            </Label>
            <Input
              id="email"
              className="rounded-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              type="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="font-label-caps text-label-caps text-secondary uppercase"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                className="rounded-full pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                className="absolute right-4 inset-y-0 flex items-center text-outline-variant hover:text-secondary transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full uppercase tracking-widest bg-primary-container text-on-primary font-bold hover:bg-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="flex items-center px-8 pb-6">
          <div className="flex-grow h-px bg-slate-200" />
          <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Or continue with
          </span>
          <div className="flex-grow h-px bg-slate-200" />
        </div>

        <div className="px-8 pb-8 space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("google")}
            disabled={isLoading}
            className="w-full rounded-full flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          <Button
            type="button"
            onClick={() => handleSocialSignIn("apple")}
            disabled={isLoading}
            className="w-full rounded-full bg-slate-900 hover:bg-slate-800"
          >
            Continue with Apple
          </Button>
        </div>

        <div className="bg-surface-container py-5 px-8 border-t border-outline-variant flex justify-center items-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            Already have an account?
          </p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="ml-2 font-label-caps text-label-caps text-primary hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccountModal;
