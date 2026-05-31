import { Link } from 'react-router-dom';
import centraLogo from '../assets/centraLogo.png';
import type { ReactNode } from 'react';

interface AuthPageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="w-full border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm shadow-emerald-900/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link to="/">
            <img src={centraLogo} alt="Centra" className="h-16 w-auto object-contain scale-[1.8] origin-left translate-y-1" />
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[520px]">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
            <div className="px-xl pt-12 pb-6 text-center relative z-10">
              <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-xs">{title}</h1>
              {subtitle && (
                <p className="text-body-sm text-slate-500 mt-2 max-w-sm mx-auto">{subtitle}</p>
              )}
            </div>

            <div className="px-xl pb-xl relative z-10">{children}</div>

            {footer && (
              <div className="bg-surface-container py-lg px-xl border-t border-outline-variant flex justify-center items-center">
                {footer}
              </div>
            )}
          </div>

          <div className="mt-xl flex flex-col items-center gap-md opacity-60">
            <div className="flex items-center gap-lg text-slate-500">
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
        </div>
      </main>
    </div>
  );
}
