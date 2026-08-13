import { useEffect, useRef, useState } from "react";
import { ArrowRight, Contrast, Menu, Pause, Play, X } from "lucide-react";
import { m, useMotionValueEvent, useScroll } from "framer-motion";
import { Link } from "react-router-dom";
import { CentraBrand } from "@/components/CentraBrand";
import { useLandingMotionPreference } from "@/components/landing/LandingMotionPreference";
import { useUiStore } from "@/stores/ui-store";

const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Platform", href: "#platform" },
  { label: "Security", href: "#security" },
] as const;

type NavHref = (typeof navItems)[number]["href"];

interface LandingSection {
  href: NavHref;
  element: HTMLElement;
}

function resolveActiveSection(sections: readonly LandingSection[]): NavHref {
  if (typeof window === "undefined") {
    return "#overview";
  }

  const marker = window.innerHeight * 0.38;
  let active: NavHref = "#overview";

  sections.forEach((section) => {
    if (section.element.getBoundingClientRect().top <= marker) {
      active = section.href;
    }
  });

  return active;
}

export default function LandingHeader() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 112,
  );
  const [activeHref, setActiveHref] = useState<NavHref>("#overview");
  const [hoveredHref, setHoveredHref] = useState<NavHref | null>(null);
  const [focusedHref, setFocusedHref] = useState<NavHref | null>(null);
  const sectionsRef = useRef<LandingSection[]>([]);
  const { reducedMotion: reduceMotion, toggleReducedMotion } = useLandingMotionPreference();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 112;
    setScrolled((current) => (current === next ? current : next));
    const nextActive = resolveActiveSection(sectionsRef.current);
    setActiveHref((current) => (current === nextActive ? current : nextActive));
  });

  useEffect(() => {
    sectionsRef.current = navItems.flatMap((item) => {
      const element = document.querySelector<HTMLElement>(item.href);
      return element ? [{ href: item.href, element }] : [];
    });

    const frame = window.requestAnimationFrame(() => {
      setActiveHref(resolveActiveSection(sectionsRef.current));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <m.header
      initial={reduceMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { delay: 1.8, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
      aria-label="Landing navigation"
    >
      <m.div
        layout={!reduceMotion}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { layout: { type: "spring", stiffness: 230, damping: 30, mass: 0.8 } }
        }
        className={`mx-auto grid h-14 items-center gap-3 border text-[#153a2c] transition-[padding,background-color,border-color,border-radius,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-16 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] dark:text-[#f2f6f2] motion-reduce:transition-none ${
          scrolled
            ? "mt-3 w-[calc(100%-24px)] max-w-[1280px] grid-cols-[minmax(0,1fr)_auto] rounded-[1.4rem] border-[#d7e1d9] bg-[#fbfdfa]/92 px-3 shadow-[0_14px_42px_rgba(23,63,48,0.11)] backdrop-blur-xl sm:px-5 dark:border-white/10 dark:bg-[#111411]/95 dark:shadow-[0_16px_48px_rgba(3,20,12,0.2)]"
            : "mt-0 w-full max-w-none grid-cols-[minmax(0,1fr)_auto] rounded-none border-transparent bg-transparent px-3 shadow-none backdrop-blur-none sm:px-8 lg:px-12"
        }`}
      >
        <Link
          to="/"
          aria-label="Centra home"
          className={`flex h-11 w-[132px] shrink-0 items-center justify-self-start overflow-hidden rounded-xl transition-[width] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] ${scrolled ? "sm:w-[150px]" : "sm:w-[176px]"}`}
        >
          <CentraBrand variant="text" size="nav" surface="auto" className="shrink-0" />
        </Link>

        <nav
          aria-label="Landing sections"
          onMouseLeave={() => setHoveredHref(null)}
          className="hidden items-center justify-self-center gap-1 text-sm font-medium text-[#52635a] md:flex dark:text-white/70"
        >
          {navItems.map((item) => {
            const highlighted = (hoveredHref ?? focusedHref ?? activeHref) === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={activeHref === item.href ? "location" : undefined}
                onMouseEnter={() => setHoveredHref(item.href)}
                onFocus={() => {
                  setHoveredHref(null);
                  setFocusedHref(item.href);
                }}
                onBlur={() => setFocusedHref(null)}
                className={`relative inline-flex min-h-11 items-center rounded-full px-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] dark:focus-visible:ring-[#8ee6b8] ${
                  highlighted ? "text-[#0f543d] dark:text-white" : "hover:text-[#0f543d] dark:hover:text-white"
                }`}
              >
                {highlighted ? (
                  <m.span
                    layoutId={reduceMotion ? undefined : "landing-nav-slider"}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-[#19704f] dark:bg-[#9cf0bf]"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34, mass: 0.65 }
                    }
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="flex items-center justify-self-end gap-1.5">
          <button
            type="button"
            aria-label={reduceMotion ? "Play landing animations" : "Pause landing animations"}
            aria-pressed={reduceMotion}
            onClick={toggleReducedMotion}
            className="group inline-flex h-11 w-11 items-center justify-center rounded-full text-[#52635a] hover:bg-[#eaf2ed] hover:text-[#0f543d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] dark:text-white/70 dark:hover:bg-white/8 dark:hover:text-white dark:focus-visible:ring-[#8ee6b8]"
          >
            {reduceMotion ? (
              <Play className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true" />
            ) : (
              <Pause className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            onClick={toggleTheme}
            className="group inline-flex h-11 w-11 items-center justify-center rounded-full text-[#52635a] hover:bg-[#eaf2ed] hover:text-[#0f543d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] dark:text-white/70 dark:hover:bg-white/8 dark:hover:text-white dark:focus-visible:ring-[#8ee6b8]"
          >
            <Contrast
              className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
              aria-hidden="true"
            />
          </button>

          <Link
            to="/login"
            className="hidden min-h-11 items-center rounded-full border border-[#b9c9bf] px-5 text-sm font-semibold text-[#173f30] transition-colors hover:border-[#19704f] hover:bg-[#eef5f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] sm:inline-flex dark:border-white/16 dark:text-white dark:hover:border-[#8ee6b8]/70 dark:hover:bg-white/8 dark:focus-visible:ring-[#8ee6b8]"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="group hidden min-h-11 items-center gap-2 rounded-full bg-[#0f543d] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#123e2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] focus-visible:ring-offset-2 sm:inline-flex dark:bg-[#9cf0bf] dark:text-[#062117] dark:hover:bg-[#b8f5cf] dark:focus-visible:ring-white"
          >
            Get started
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </Link>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-landing-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#173f30] hover:bg-[#eaf2ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] md:hidden dark:text-white dark:hover:bg-white/8 dark:focus-visible:ring-[#8ee6b8]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </m.div>

      {mobileMenuOpen ? (
        <m.div
          id="mobile-landing-menu"
          initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
          className="mx-auto mt-2 w-[calc(100%-24px)] max-w-[1280px] rounded-[1.4rem] border border-[#d7e1d9] bg-[#fbfdfa]/98 p-3 text-[#153a2c] shadow-[0_24px_64px_rgba(23,63,48,0.16)] backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-[#111411]/98 dark:text-[#f2f6f2] dark:shadow-[0_24px_64px_rgba(3,20,12,0.28)]"
        >
          <nav aria-label="Mobile landing sections" className="flex flex-col gap-1 text-sm font-semibold">
            {navItems.map((item) => {
              const active = activeHref === item.href;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "location" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-11 items-center rounded-xl px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] dark:focus-visible:ring-[#8ee6b8] ${
                    active
                      ? "bg-[#e5f2e9] text-[#0f543d] dark:bg-white/9 dark:text-white"
                      : "text-[#52635a] hover:bg-[#eaf2ed] hover:text-[#0f543d] dark:text-white/76 dark:hover:bg-white/8 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <div className="my-2 h-px bg-[#d7e1d9] dark:bg-white/10" aria-hidden="true" />
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center rounded-xl px-3 text-[#52635a] hover:bg-[#eaf2ed] hover:text-[#0f543d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] dark:text-white/76 dark:hover:bg-white/8 dark:hover:text-white dark:focus-visible:ring-[#8ee6b8]"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0f543d] px-4 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] dark:bg-[#9cf0bf] dark:text-[#062117] dark:focus-visible:ring-white"
            >
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </m.div>
      ) : null}
    </m.header>
  );
}
