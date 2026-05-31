import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CreateAccountModalProps {
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const CreateAccountModal = ({ onClose, onSwitchToLogin }: CreateAccountModalProps) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await register(username, email, password);
      if (res.success) {
        onClose();
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Modal Content */}
      <main
        className={`w-full max-w-[520px] relative z-10 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
      >
        {/* The Minimalist Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors p-2 cursor-pointer z-50"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>

          {/* Modal Header */}
          <div className="px-xl pt-12 pb-6 text-center relative z-10">
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-xs">Create an account</h1>
          </div>

          {/* Modal Content (Inputs) */}
          <form onSubmit={handleSubmit} className="px-xl pb-6 space-y-lg relative z-10">

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/20 rounded-lg text-error text-body-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-secondary uppercase" htmlFor="username">Username</label>
              <input
                className="w-full bg-surface border border-outline-variant px-md py-3 font-body-md text-on-surface hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-300 outline-none shadow-sm"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. johndoe"
                type="text"
                required
              />
            </div>

            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-secondary uppercase" htmlFor="email">Email Address</label>
              <input
                className="w-full bg-surface border border-outline-variant px-md py-3 font-body-md text-on-surface hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-300 outline-none shadow-sm"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. you@example.com"
                type="email"
                required
              />
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-label-caps text-secondary uppercase" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <input
                  className="w-full bg-surface border border-outline-variant px-md py-3 font-body-md text-on-surface hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-300 outline-none shadow-sm"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <button
                  type="button"
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline-variant hover:text-secondary transition-colors cursor-pointer flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-container text-on-primary font-bold text-sm py-3 px-xl rounded-full flex items-center justify-center hover:bg-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 ease-out active:scale-[0.98] group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="uppercase tracking-widest">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </span>
            </button>
          </form>

          <div className="flex items-center px-xl pb-6 relative z-10">
            <div className="flex-grow h-px bg-slate-200"></div>
            <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow h-px bg-slate-200"></div>
          </div>

          <div className="px-xl pb-xl relative z-10 space-y-3">
            <button type="button" className="w-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors py-3 px-4 rounded-full flex items-center justify-center gap-3 font-semibold text-sm text-slate-700 shadow-sm cursor-pointer active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
              Continue with Google
            </button>
            <button type="button" className="w-full bg-slate-900 border border-slate-900 hover:bg-slate-800 transition-colors py-3 px-4 rounded-full flex items-center justify-center gap-3 font-semibold text-sm text-white shadow-sm cursor-pointer active:scale-[0.98]">
              Continue with Apple
            </button>
          </div>

          {/* Minimal Modal Footer */}
          <div className="bg-surface-container py-lg px-xl border-t border-outline-variant flex justify-center items-center">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Already have an account?</p>
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="ml-sm font-label-caps text-label-caps text-primary hover:underline cursor-pointer transition-all"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* System Status / Trust Markers */}
        <div className="mt-xl flex flex-col items-center gap-md opacity-60">
          <div className="flex items-center gap-lg text-white">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span className="font-label-caps text-[10px] uppercase tracking-tighter">Encrypted</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span className="font-label-caps text-[10px] uppercase tracking-tighter">Secure Connection</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateAccountModal;
