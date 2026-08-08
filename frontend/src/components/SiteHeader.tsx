import type { RefObject } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CentraBrand } from "@/components/CentraBrand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  mode: "landing" | "auth";
  headerRef?: RefObject<HTMLElement | null>;
  shellRef?: RefObject<HTMLDivElement | null>;
}

export default function SiteHeader({ mode, headerRef, shellRef }: SiteHeaderProps) {
  const isLanding = mode === "landing";

  return (
    <header
      ref={headerRef}
      className={cn(
        "z-50",
        isLanding
          ? "fixed inset-x-0 top-0 px-0 py-0"
          : "relative h-[68px] bg-transparent",
      )}
      aria-label={isLanding ? "Landing navigation" : "Auth navigation"}
    >
      <div
        ref={shellRef}
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
          "mx-auto h-[68px] w-full max-w-none rounded-xl border border-transparent bg-transparent px-4 shadow-none backdrop-blur-none sm:px-8 lg:px-12",
        )}
      >
        <Link
          to="/"
          aria-label="Centra home"
          className="flex h-11 w-[184px] items-center justify-self-start overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <CentraBrand variant="text" size="nav" surface="light" className="shrink-0" />
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
          <div className="flex items-center justify-self-end gap-2">
            <Button asChild variant="ghost" className="hidden h-10 rounded-lg px-4 font-bold text-primary hover:bg-[#edf7f2] sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="group h-10 rounded-lg bg-primary px-4 font-bold text-white shadow-[0_6px_16px_rgba(0,53,39,0.16)] hover:bg-primary-container hover:shadow-[0_9px_22px_rgba(0,53,39,0.22)]">
              <Link to="/register">
                Get started
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-self-end gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#edf7f2] hover:text-primary hover:shadow-sm active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        )}
      </div>
    </header>
  );
}
