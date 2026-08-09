import { useState, type RefObject } from "react";
import { ArrowLeft, ArrowRight, Contrast, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { CentraBrand } from "@/components/CentraBrand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

interface SiteHeaderProps {
  mode: "landing" | "auth";
  headerRef?: RefObject<HTMLElement | null>;
  shellRef?: RefObject<HTMLDivElement | null>;
}

export default function SiteHeader({ mode, headerRef, shellRef }: SiteHeaderProps) {
  const isLanding = mode === "landing";
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <header
      ref={headerRef}
      className={cn(
        "z-50",
        isLanding
          ? "fixed inset-x-0 top-0 px-3 py-3 sm:px-0 sm:py-0"
          : "relative h-[68px] bg-transparent",
      )}
      aria-label={isLanding ? "Landing navigation" : "Auth navigation"}
    >
      <div
        ref={shellRef}
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] items-center md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
          "mx-auto h-[60px] w-full max-w-none rounded-xl border border-transparent bg-transparent px-3 shadow-none backdrop-blur-none sm:h-[68px] sm:px-8 lg:px-12",
        )}
      >
        <Link
          to="/"
          aria-label="Centra home"
          className="flex h-11 w-[140px] items-center justify-self-start overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:w-[184px]"
        >
          <CentraBrand variant="text" size="nav" surface="auto" className="shrink-0" />
        </Link>

        <nav
          aria-label={isLanding ? "Landing sections" : "Auth navigation"}
          className="hidden items-center justify-self-center gap-7 text-sm font-semibold text-slate-600 md:flex"
        >
          {isLanding ? (
            <>
              <a href="#overview" className="transition-colors duration-200 hover:text-primary focus-visible:text-primary focus-visible:outline-none">Overview</a>
              <a href="#platform" className="transition-colors duration-200 hover:text-primary focus-visible:text-primary focus-visible:outline-none">Platform</a>
              <a href="#security" className="transition-colors duration-200 hover:text-primary focus-visible:text-primary focus-visible:outline-none">Security</a>
            </>
          ) : (
            <>
              <Link to="/" className="transition-colors duration-200 hover:text-primary focus-visible:text-primary focus-visible:outline-none">Home</Link>
              <a href="/views/privacy.html" className="transition-colors duration-200 hover:text-primary focus-visible:text-primary focus-visible:outline-none">Privacy</a>
              <a href="/views/terms.html" className="transition-colors duration-200 hover:text-primary focus-visible:text-primary focus-visible:outline-none">Terms</a>
            </>
          )}
        </nav>

        {isLanding ? (
          <div className="flex items-center justify-self-end gap-1 sm:gap-2">
            <button
              type="button"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              onClick={toggleTheme}
              className="group inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#edf7f2] hover:text-primary hover:shadow-sm active:translate-y-0 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 dark:hover:bg-[#242424]"
            >
              <Contrast className="h-[17px] w-[17px] transition-transform duration-300 group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" aria-hidden="true" />
            </button>
            <span className="hidden h-5 w-px bg-slate-300/80 sm:block" aria-hidden="true" />
            <Button asChild variant="ghost" className="hidden h-9 rounded-md border border-transparent px-3 font-bold text-primary transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[#b8ddce] hover:bg-[#e8f5ee] hover:text-primary-container hover:shadow-[0_7px_16px_rgba(0,53,39,0.1)] active:translate-y-0 active:scale-[0.975] dark:hover:border-[#343434] dark:hover:bg-[#242424] dark:hover:text-[#6ee7a5] sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="group hidden h-9 rounded-md bg-primary px-4 font-bold text-white shadow-[0_5px_14px_rgba(0,53,39,0.16)] hover:bg-primary-container hover:shadow-[0_8px_18px_rgba(0,53,39,0.22)] sm:inline-flex">
              <Link to="/register">
                Get started
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
              </Link>
            </Button>
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-landing-menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-primary transition-[background-color,color,transform] duration-200 hover:bg-[#edf7f2] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:hover:bg-[#242424] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-[18px] w-[18px]" aria-hidden="true" /> : <Menu className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-self-end gap-2">
            <button
              type="button"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#edf7f2] hover:text-primary hover:shadow-sm active:translate-y-0 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 dark:hover:bg-[#242424]"
            >
              <Contrast className="h-[17px] w-[17px]" aria-hidden="true" />
            </button>
            <span className="h-5 w-px bg-slate-300/80" aria-hidden="true" />
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#edf7f2] hover:text-primary hover:shadow-sm active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 dark:hover:bg-[#242424]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </div>
        )}
      </div>

      {isLanding && mobileMenuOpen ? (
        <div
          id="mobile-landing-menu"
          className="mt-2 rounded-xl border border-slate-200/90 bg-white p-3 shadow-[0_18px_42px_rgba(15,23,42,0.14)] dark:border-[#343434] dark:bg-[#181818] dark:shadow-[0_18px_42px_rgba(0,0,0,0.5)] md:hidden"
        >
          <nav aria-label="Mobile landing sections" className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
            <a href="#overview" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-[#edf7f2] hover:text-primary focus-visible:bg-[#edf7f2] focus-visible:text-primary focus-visible:outline-none dark:hover:bg-[#242424] dark:focus-visible:bg-[#242424]">Overview</a>
            <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-[#edf7f2] hover:text-primary focus-visible:bg-[#edf7f2] focus-visible:text-primary focus-visible:outline-none dark:hover:bg-[#242424] dark:focus-visible:bg-[#242424]">Platform</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-[#edf7f2] hover:text-primary focus-visible:bg-[#edf7f2] focus-visible:text-primary focus-visible:outline-none dark:hover:bg-[#242424] dark:focus-visible:bg-[#242424]">Security</a>
            <div className="my-2 h-px bg-slate-200" aria-hidden="true" />
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-[#edf7f2] hover:text-primary focus-visible:bg-[#edf7f2] focus-visible:text-primary focus-visible:outline-none dark:hover:bg-[#242424] dark:focus-visible:bg-[#242424]">Sign in</Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 font-bold text-white transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
