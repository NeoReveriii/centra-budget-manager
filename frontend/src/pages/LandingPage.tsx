import { useRef } from "react";
import { ArrowRight, ChartNoAxesCombined, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LandingHeader from "@/components/landing/LandingHeader";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LandingPage = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headerShellRef = useRef<HTMLDivElement>(null);
  const theme = useUiStore((state) => state.theme);

  useGSAP(
    () => {
      const header = headerRef.current;
      const headerShell = headerShellRef.current;
      if (!header || !headerShell) return;
      const isDark = theme === "dark";

      const media = gsap.matchMedia();

      const setHeaderCompact = (compact: boolean, animate: boolean) => {
        gsap.to(header, {
          paddingTop: compact ? "12px" : "0px",
          paddingBottom: compact ? "12px" : "0px",
          duration: animate ? 0.5 : 0,
          ease: "power3.out",
          overwrite: true,
        });
        gsap.to(headerShell, {
          maxWidth: compact ? "1280px" : "none",
          paddingLeft: compact ? "clamp(16px, 2vw, 24px)" : "clamp(16px, 4vw, 48px)",
          paddingRight: compact ? "clamp(16px, 2vw, 24px)" : "clamp(16px, 4vw, 48px)",
          borderRadius: compact ? "16px" : "12px",
          backgroundColor: compact
            ? isDark
              ? "rgba(18,18,18,0.94)"
              : "rgba(255,255,255,0.92)"
            : "transparent",
          borderColor: compact
            ? isDark
              ? "rgba(52,52,52,0.96)"
              : "rgba(226,232,240,0.9)"
            : "transparent",
          backdropFilter: compact ? "blur(20px)" : "none",
          boxShadow: compact
            ? isDark
              ? "0 18px 50px rgba(0,0,0,0.5)"
              : "0 18px 50px rgba(15,23,42,0.13)"
            : "none",
          duration: animate ? 0.5 : 0,
          ease: "power3.out",
          overwrite: true,
        });
      };

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(header, { autoAlpha: 1, y: 0, scale: 1, pointerEvents: "auto" });
        gsap.set(header, { paddingTop: "0px", paddingBottom: "0px" });
        gsap.set(headerShell, {
          maxWidth: "none",
          paddingLeft: "clamp(16px, 4vw, 48px)",
          paddingRight: "clamp(16px, 4vw, 48px)",
          borderRadius: "12px",
          backgroundColor: "transparent",
          borderColor: "transparent",
          backdropFilter: "none",
          boxShadow: "none",
        });

        ScrollTrigger.create({
          trigger: pageRef.current,
          start: "top -112",
          end: "bottom top",
          onToggle: (trigger) => setHeaderCompact(trigger.isActive, true),
        });
        setHeaderCompact(window.scrollY > 112, false);

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from("[data-hero-item]", {
            autoAlpha: 0,
            y: 24,
            duration: 0.68,
            stagger: 0.11,
          })
          .from(
            "[data-terminal-shell]",
            { autoAlpha: 0, y: 38, scale: 0.96, duration: 0.9 },
            "-=0.42",
          )
          .from(
            "[data-terminal-part]",
            { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.075 },
            "-=0.58",
          )
          .from(
            "[data-chart-line]",
            { strokeDasharray: 520, strokeDashoffset: 520, duration: 1.05 },
            "-=0.64",
          )
          .from(
            "[data-allocation-bar]",
            { scaleX: 0, transformOrigin: "left center", duration: 0.72, stagger: 0.1 },
            "-=0.88",
          )
          .from(
            "[data-security-badge]",
            { autoAlpha: 0, y: 14, scale: 0.93, duration: 0.55 },
            "-=0.48",
          );

        gsap.to("[data-hero-copy]", {
          y: -32,
          opacity: 0.74,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-hero]",
            start: "top top",
            end: "bottom top",
            scrub: 0.7,
          },
        });

        gsap.to("[data-terminal-shell]", {
          y: -18,
          scale: 0.985,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-hero]",
            start: "top top",
            end: "bottom top",
            scrub: 0.7,
          },
        });

        gsap.from("[data-build-heading] > *", {
          autoAlpha: 0,
          y: 30,
          duration: 0.72,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-build-section]",
            start: "top 76%",
            once: true,
          },
        });

        gsap.from("[data-build-card]", {
          autoAlpha: 0,
          y: 38,
          duration: 0.72,
          stagger: 0.18,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-build-sequence]",
            start: "top 74%",
            once: true,
          },
        });

        gsap.fromTo(
          "[data-build-line]",
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-build-sequence]",
              start: "top 78%",
              end: "bottom 48%",
              scrub: 0.65,
            },
          },
        );

        gsap.from("[data-cta-reveal] > *", {
          autoAlpha: 0,
          y: 32,
          duration: 0.72,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-cta-reveal]",
            start: "top 78%",
            once: true,
          },
        });

        gsap.from("[data-footer-reveal] > *", {
          autoAlpha: 0,
          y: 22,
          duration: 0.58,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-footer-reveal]",
            start: "top 92%",
            once: true,
          },
        });
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(header, { autoAlpha: 1, y: 0, scale: 1, pointerEvents: "auto" });
        gsap.set(header, { paddingTop: "0px", paddingBottom: "0px" });
        gsap.set(headerShell, {
          maxWidth: "none",
          paddingLeft: "clamp(16px, 4vw, 48px)",
          paddingRight: "clamp(16px, 4vw, 48px)",
          borderRadius: "12px",
          backgroundColor: "transparent",
          borderColor: "transparent",
          backdropFilter: "none",
          boxShadow: "none",
        });
        gsap.set("[data-build-line]", { scaleX: 1, transformOrigin: "left center" });

        ScrollTrigger.create({
          trigger: pageRef.current,
          start: "top -112",
          end: "bottom top",
          onToggle: (trigger) => setHeaderCompact(trigger.isActive, false),
        });
        setHeaderCompact(window.scrollY > 112, false);
      });

      media.add("(max-width: 767px)", () => {
        setHeaderCompact(true, false);
      });

      return () => media.revert();
    },
    { scope: pageRef, dependencies: [theme], revertOnUpdate: true },
  );

  return (
    <div ref={pageRef} className="font-landing min-h-screen w-full max-w-full overflow-x-hidden bg-[#f7f8f7] text-slate-950 dark:bg-[#0a0a0a] dark:text-[#f5f5f5]">
      <a
        href="#overview"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform duration-200 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-200 motion-reduce:transition-none"
      >
        Skip to main content
      </a>
      <LandingHeader headerRef={headerRef} shellRef={headerShellRef} />

      <main className="w-full max-w-full overflow-x-hidden">
        <section
          id="overview"
          data-hero
          className="mx-auto grid min-h-[100svh] w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] lg:py-24"
        >
          <div data-hero-copy className="max-w-[640px]">
            <div data-hero-item className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              <span className="h-px w-10 bg-secondary" aria-hidden="true" />
              Institutional wealth management
            </div>

            <h1 data-hero-item className="mt-8 max-w-[640px] text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-primary">
              The next evolution in
              <span className="block text-secondary">personal finance.</span>
            </h1>

            <p data-hero-item className="mt-8 max-w-[560px] text-lg font-normal leading-8 text-slate-600">
              A focused, intelligence-driven workspace for understanding your money, planning your next move, and building lasting momentum.
            </p>

            <div data-hero-item className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="group h-14 rounded-lg bg-primary px-7 text-base font-bold text-white shadow-[0_10px_24px_rgba(0,53,39,0.16)] hover:bg-primary-container hover:shadow-[0_14px_30px_rgba(0,53,39,0.22)]"
              >
                <Link to="/register">
                  Get started free
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-lg border-[#afc9bd] bg-white px-7 text-base font-bold text-primary shadow-none hover:border-primary/45 hover:bg-[#edf7f2] hover:shadow-[0_8px_20px_rgba(0,53,39,0.08)] dark:border-[#343434] dark:bg-[#181818] dark:hover:bg-[#242424]"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          <div id="platform" className="relative scroll-mt-28" data-terminal-shell>
            <div className="overflow-hidden rounded-xl border border-[#b9c6c0] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.15)] dark:border-[#343434] dark:shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
              <div data-terminal-part className="flex items-center justify-between bg-primary px-4 py-3.5">
                <div className="flex gap-2" aria-hidden="true">
                  <span className="h-3 w-3 rounded-full bg-[#e24d4d]" />
                  <span className="h-3 w-3 rounded-full bg-[#a9dfc8]" />
                  <span className="h-3 w-3 rounded-full bg-[#77b29d]" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                  Centra workspace
                </div>
              </div>

              <div className="grid grid-flow-dense grid-cols-1 gap-4 bg-[#f1f3f2] p-5 dark:bg-[#101010] sm:grid-cols-3">
                <div className="space-y-4 sm:col-span-2">
                  <div data-terminal-part className="rounded-lg border border-[#c5cec9] bg-white p-4 dark:border-[#343434]">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Total balance</p>
                    <p className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-primary">$428,950.00</p>
                    <div className="relative mt-4 h-24 overflow-hidden rounded-md bg-emerald-50">
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary-container/40 to-transparent dark:from-[#242424]" />
                      <svg className="relative h-full w-full fill-none stroke-primary stroke-2" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
                        <path data-chart-line d="M0,80 Q50,40 100,70 T200,30 T300,50 T400,10" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div data-terminal-part className="rounded-lg border border-[#c5cec9] bg-white p-4 dark:border-[#343434]">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Investments</p>
                      <p className="mt-2 text-xl font-semibold text-secondary">+12.4%</p>
                    </div>
                    <div data-terminal-part className="rounded-lg border border-[#c5cec9] bg-white p-4 dark:border-[#343434]">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Liquidity</p>
                      <p className="mt-2 text-xl font-semibold text-primary">84.2%</p>
                    </div>
                  </div>
                </div>

                <div data-terminal-part className="rounded-lg border border-[#c5cec9] bg-white p-4 dark:border-[#343434] sm:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Asset allocation</p>
                  <div className="mt-5 space-y-4">
                    <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                      <div data-allocation-bar className="h-full w-[62%] rounded-full bg-primary" />
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                      <div data-allocation-bar className="h-full w-[36%] rounded-full bg-secondary" />
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                      <div data-allocation-bar className="h-full w-[18%] rounded-full bg-[#7bb59e]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="security"
              data-security-badge
              className="absolute -bottom-6 -left-5 hidden scroll-mt-28 items-center gap-3 rounded-xl border border-[#bdc9c3] bg-white px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-[#343434] dark:shadow-[0_18px_40px_rgba(0,0,0,0.5)] sm:flex"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-primary">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">Secure access</span>
                <span className="block text-[11px] font-medium text-slate-500">Encrypted account protection</span>
              </span>
            </div>
          </div>
        </section>

        <section data-build-section className="border-y border-slate-200 bg-white py-28 md:py-36">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div data-build-heading className="max-w-[760px]">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-secondary">One connected view</p>
              <h2 className="mt-5 text-[clamp(2.25rem,4vw,4rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-primary">
                Your financial picture builds with every decision.
              </h2>
              <p className="mt-6 max-w-[620px] text-lg leading-8 text-slate-600">
                Centra keeps accounts, movement, and goals in sequence, so every next step starts with context.
              </p>
            </div>

            <div data-build-sequence className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <div className="absolute left-[8%] right-[8%] top-7 hidden h-px bg-slate-200 md:block" aria-hidden="true">
                <div data-build-line className="h-full w-full bg-secondary" />
              </div>

              <article data-build-card className="relative pr-5">
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-[#bcd1c7] bg-[#edf7f2] text-primary dark:border-[#343434] dark:bg-[#181818]">
                  <WalletCards className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.025em] text-slate-950">Bring accounts together</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">Start with one dependable view of the balances and activity that matter.</p>
              </article>

              <article data-build-card className="relative pr-5">
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-[#bcd1c7] bg-[#edf7f2] text-primary dark:border-[#343434] dark:bg-[#181818]">
                  <ChartNoAxesCombined className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.025em] text-slate-950">See movement clearly</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">Understand income, spending, and momentum without sorting through noise.</p>
              </article>

              <article data-build-card className="relative pr-5">
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-[#bcd1c7] bg-[#edf7f2] text-primary dark:border-[#343434] dark:bg-[#181818]">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.025em] text-slate-950">Move with confidence</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">Make each decision with secure access and the right context already in place.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-28 md:py-36">
          <div data-cta-reveal className="relative overflow-hidden rounded-2xl bg-primary px-6 py-20 text-center shadow-[0_28px_70px_rgba(0,53,39,0.18)] sm:px-12">
            <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
              <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-emerald-300/35 blur-3xl" />
              <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
            </div>
            <h2 className="relative mx-auto max-w-[760px] text-[clamp(2.4rem,4.5vw,4.4rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-white">
              Make your next money decision with clarity.
            </h2>
            <p className="relative mx-auto mt-6 max-w-[620px] text-lg leading-8 text-emerald-50/80">
              Create your Centra workspace and bring your wallets, goals, income, and everyday spending into focus.
            </p>
            <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="outline" className="h-14 rounded-lg border-white bg-white px-9 text-base font-bold text-primary hover:border-emerald-50 hover:bg-emerald-50 hover:shadow-lg">
                <Link to="/register">Create account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-lg border-emerald-200/60 bg-transparent px-9 text-base font-bold text-white shadow-none hover:border-white hover:bg-white/10 hover:text-white">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-14">
        <div data-footer-reveal className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="w-full max-w-[440px]">
            <div className="text-lg font-bold tracking-tight text-slate-950">Centra Financial Systems</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Calm, intelligent tools for keeping your money organized and moving with intention.
            </p>
            <div className="mt-5 border-t border-slate-200 pt-5 text-xs font-medium text-slate-500">
              © 2026 Centra Financial Systems. All rights reserved.
            </div>
          </div>
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-semibold text-slate-600 sm:grid-cols-4 md:justify-items-end">
            <a href="#overview" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary">Overview</a>
            <a href="/views/privacy.html" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary">Privacy</a>
            <a href="/views/terms.html" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary">Terms</a>
            <a href="#security" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:text-primary">Security</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
