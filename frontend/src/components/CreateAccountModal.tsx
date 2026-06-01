import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateAccountModalProps {
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const CreateAccountModal = ({ onClose, onSwitchToLogin }: CreateAccountModalProps) => {
  const { register, loginWithSocial } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await register(username, email, password);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocialSignIn(provider: 'google' | 'apple') {
    setError('');
    setIsLoading(true);
    try {
      const res = await loginWithSocial(provider);
      if (!res.success) {
        if (res.error) setError(res.error);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Social sign-in failed');
      setIsLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[520px] p-0 gap-0 overflow-hidden border-0 shadow-2xl" showCloseButton>
        <DialogHeader className="px-8 pt-10 pb-4 text-center">
          <DialogTitle className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Create an account
          </DialogTitle>
          <DialogDescription className="sr-only">Register with email or social providers</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/20 rounded-lg text-error text-body-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="font-label-caps text-label-caps text-secondary uppercase">
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
            <Label htmlFor="email" className="font-label-caps text-label-caps text-secondary uppercase">
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
            <Label htmlFor="password" className="font-label-caps text-label-caps text-secondary uppercase">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                className="rounded-full pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-secondary transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full uppercase tracking-widest bg-primary-container hover:bg-primary"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="flex items-center px-8 pb-6">
          <div className="flex-grow h-px bg-slate-200" />
          <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
          <div className="flex-grow h-px bg-slate-200" />
        </div>

        <div className="px-8 pb-8 space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn('google')}
            disabled={isLoading}
            className="w-full rounded-full"
          >
            Continue with Google
          </Button>
          <Button
            type="button"
            onClick={() => handleSocialSignIn('apple')}
            disabled={isLoading}
            className="w-full rounded-full bg-slate-900 hover:bg-slate-800"
          >
            Continue with Apple
          </Button>
        </div>

        <div className="bg-surface-container py-5 px-8 border-t border-outline-variant flex justify-center items-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Already have an account?</p>
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
