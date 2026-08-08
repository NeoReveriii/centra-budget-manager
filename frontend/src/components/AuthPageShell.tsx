import { CentraBrand } from "@/components/CentraBrand";
import { ShaderBackground } from "@/components/ui/manu";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-[100dvh] bg-[#f2f6f4] text-slate-950">
      <header className="h-[68px] border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-full w-full max-w-[1560px] items-center justify-between px-5 sm:px-8">
          <div className="flex h-11 w-[184px] items-center overflow-hidden">
            <CentraBrand variant="text" to="/" size="nav" surface="light" className="shrink-0" />
          </div>

          <nav aria-label="Auth navigation" className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <Link to="/" className="transition-colors hover:text-primary">Home</Link>
            <a href="/views/privacy.html" className="transition-colors hover:text-primary">Privacy</a>
            <a href="/views/terms.html" className="transition-colors hover:text-primary">Terms</a>
          </nav>

          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#edf7f2] hover:text-primary hover:shadow-sm active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1560px] p-4 sm:p-6">
        <div className="grid min-h-[calc(100dvh-116px)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.09)] lg:grid-cols-[minmax(0,1.06fr)_minmax(430px,0.94fr)]">
          <section className="relative hidden min-h-[760px] overflow-hidden rounded-2xl bg-primary lg:flex lg:items-center lg:justify-center">
            <ShaderBackground className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,33,23,0.18)_0%,rgba(0,33,23,0.42)_58%,rgba(0,20,14,0.78)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[radial-gradient(ellipse_at_bottom,rgba(176,240,214,0.22),transparent_66%)]" />

            <div className="relative z-10 mx-auto flex w-full max-w-[620px] flex-col items-center px-12 text-center text-white">
              <div className="mb-10 flex h-14 w-[208px] items-center justify-center overflow-hidden">
                <CentraBrand variant="text" size="nav" surface="dark" align="center" className="shrink-0" />
              </div>
              <h2 className="max-w-[580px] text-[38px] font-extrabold leading-[1.14] tracking-[-0.045em] xl:text-[44px]">
                {isRegister
                  ? "Bring every money decision into focus."
                  : "See your money clearly, then move with confidence."}
              </h2>
              <p className="mt-6 max-w-[500px] text-base leading-7 text-emerald-50/80 xl:text-lg">
                {isRegister
                  ? "Create one secure place for your wallets, goals, income, and everyday spending."
                  : "Your wallets, goals, and recent activity stay organized in one calm financial workspace."}
              </p>
            </div>
          </section>

          <section className="flex min-h-[720px] items-center justify-center bg-[#fcfdfc] px-5 py-12 sm:px-10 lg:min-h-[760px] lg:border-l lg:border-slate-200/70 lg:px-14 lg:py-16 xl:px-20">
            <div className="w-full max-w-[520px]">
              <div className="mb-9 text-center">
                <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-slate-950 sm:text-[36px]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mx-auto mt-3 max-w-[440px] text-sm font-medium leading-6 text-slate-600 sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>

              {children}

              {footer && <div className="mt-7 border-t border-slate-200 pt-6 text-center">{footer}</div>}

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
