import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CentraBrand } from "@/components/CentraBrand";
import { Button } from "@/components/ui/button";

interface LandingHeaderProps {
  headerRef: RefObject<HTMLElement | null>;
}

export default function LandingHeader({ headerRef }: LandingHeaderProps) {
  return (
    <header
      ref={headerRef}
      className="pointer-events-none invisible fixed inset-x-0 top-4 z-50 px-4"
      aria-label="Landing navigation"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between rounded-2xl border border-white/80 bg-white/88 px-4 shadow-[0_18px_50px_rgba(15,23,42,0.13)] backdrop-blur-xl sm:px-5">
        <Link
          to="/"
          aria-label="Centra home"
          className="flex h-10 w-[138px] items-center overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <CentraBrand variant="text" size="nav" surface="light" className="shrink-0" />
        </Link>

        <nav aria-label="Landing sections" className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <a href="#overview" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary">
            Overview
          </a>
          <a href="#platform" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary">
            Platform
          </a>
          <a href="#security" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary">
            Security
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            className="hidden h-10 rounded-lg px-4 font-bold text-primary hover:bg-[#edf7f2] sm:inline-flex"
          >
            <Link to="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="group h-10 rounded-lg bg-primary px-4 font-bold text-white shadow-[0_6px_16px_rgba(0,53,39,0.16)] hover:bg-primary-container hover:shadow-[0_9px_22px_rgba(0,53,39,0.22)]"
          >
            <Link to="/register">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
