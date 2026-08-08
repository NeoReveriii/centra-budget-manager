import { CentraBrand } from "@/components/CentraBrand";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface AuthPageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  mode?: "login" | "register" | "utility";
}

export default function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  mode = "utility",
}: AuthPageShellProps) {
  const isRegister = mode === "register";

  return (
    <div className="min-h-[100dvh] bg-[#f7fbf9] text-on-surface">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <CentraBrand variant="text" to="/" size="nav" surface="light" />
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-slate-500 transition-colors hover:bg-[#eff8f3] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100dvh-72px)] w-full max-w-7xl lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <section className="relative hidden overflow-hidden bg-primary px-8 py-12 text-white lg:flex lg:min-h-[calc(100dvh-72px)] lg:flex-col lg:justify-between lg:px-14 lg:py-14">
          <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full border border-emerald-200/15" />
          <div className="absolute -bottom-48 -left-48 h-[34rem] w-[34rem] rounded-full border border-emerald-200/10" />
          <div className="absolute right-24 top-40 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative z-10 max-w-xl">
            <div className="mb-14 flex items-center gap-3 text-emerald-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/20 bg-white/10">
                <span className="material-symbols-outlined text-[21px]" aria-hidden="true">
                  account_balance
                </span>
              </span>
              <span className="text-sm font-bold tracking-[0.18em] uppercase">Centra</span>
            </div>

            <p className="mb-5 text-xs font-bold tracking-[0.2em] text-emerald-200 uppercase">
              Personal finance, clarified
            </p>
            <h2 className="max-w-lg text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
              {isRegister ? "Build a better relationship with your money." : "A calmer way to move money."}
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-emerald-50/75">
              {isRegister
                ? "Bring your accounts, goals, and everyday decisions into one clear place."
                : "See what matters, understand your momentum, and make your next decision with confidence."}
            </p>
          </div>

          <div className="relative z-10 mt-14 max-w-md rounded-3xl border border-white/15 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-emerald-100/70 uppercase">Your financial view</p>
                <p className="mt-2 text-lg font-bold text-white">Clearer by design</p>
              </div>
              <span className="material-symbols-outlined text-emerald-200" aria-hidden="true">north_east</span>
            </div>
            <div className="mt-5 flex items-end gap-2">
              <span className="h-12 w-3 rounded-full bg-emerald-200/35" />
              <span className="h-20 w-3 rounded-full bg-emerald-200/45" />
              <span className="h-16 w-3 rounded-full bg-emerald-200/30" />
              <span className="h-28 w-3 rounded-full bg-emerald-200/70" />
              <span className="h-24 w-3 rounded-full bg-emerald-200/50" />
              <span className="h-36 w-3 rounded-full bg-emerald-200" />
              <div className="ml-auto self-end text-right">
                <p className="text-xs text-emerald-100/65">A more intentional next step</p>
                <p className="mt-1 text-sm font-semibold text-white">Always within reach</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 lg:hidden">
              <CentraBrand variant="text" to="/" size="nav" surface="light" />
            </div>
            <div className="mb-8">
              <p className="mb-3 text-xs font-bold tracking-[0.18em] text-secondary uppercase">
                {isRegister ? "Start with Centra" : "Welcome back"}
              </p>
              <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">{title}</h1>
              {subtitle && <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{subtitle}</p>}
            </div>

            {children}

            {footer && <div className="mt-8 border-t border-slate-200 pt-6">{footer}</div>}

            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">verified_user</span>
              <span>Secure account access with privacy-first defaults.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
