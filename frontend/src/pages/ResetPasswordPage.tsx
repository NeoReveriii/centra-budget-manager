import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthPageShell from '../components/AuthPageShell';
import { resetPasswordWithToken } from '../lib/auth-client';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token || token === 'INVALID_TOKEN') {
      setError('This reset link is invalid or has expired. Please request a new one.');
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError('This reset link is invalid or has expired. Please request a new one.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordWithToken(password, token);
      if (result.success) {
        setSuccessMessage('Your password has been updated. You can now sign in with your new password.');
        setTimeout(() => navigate('/', { replace: true }), 2500);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
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
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Need a new link?</p>
          <Link
            to="/forgot-password"
            className="ml-sm font-label-caps text-label-caps text-primary hover:underline transition-all"
          >
            Request again
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
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {successMessage}
          </div>
        )}

        <div className="space-y-xs">
          <label className="font-label-caps text-label-caps text-secondary uppercase" htmlFor="password">
            New Password
          </label>
          <div className="relative">
            <input
              className="w-full bg-surface border border-outline-variant px-md py-3 font-body-md text-on-surface hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-300 outline-none shadow-sm"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={!token || Boolean(successMessage)}
            />
            <button
              type="button"
              className="absolute right-md top-1/2 -translate-y-1/2 text-outline-variant hover:text-secondary transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-xs">
          <label className="font-label-caps text-label-caps text-secondary uppercase" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="w-full bg-surface border border-outline-variant px-md py-3 font-body-md text-on-surface hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-300 outline-none shadow-sm"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={!token || Boolean(successMessage)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !token || Boolean(successMessage)}
          className="w-full bg-primary-container text-on-primary font-bold text-sm py-3 px-xl rounded-full flex items-center justify-center hover:bg-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="uppercase tracking-widest">
            {isLoading ? 'Updating...' : 'Update Password'}
          </span>
        </button>
      </form>
    </AuthPageShell>
  );
}
