import { useState } from "react";
import LoginModal from "../components/LoginModal";
import CreateAccountModal from "../components/CreateAccountModal";
import { CentraBrand } from "@/components/CentraBrand";

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md">
      {/* TopNavBar */}
      <nav className="fixed top-0 z-50 h-[72px] w-full overflow-hidden border-b border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-6 overflow-hidden px-6">
          <div className="flex h-11 w-[184px] shrink-0 items-center overflow-hidden">
            <CentraBrand variant="text" size="nav" surface="light" className="shrink-0" />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="min-h-11 rounded-full border border-transparent px-4 text-sm font-bold text-primary transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#c8e0d3] hover:bg-[#eff8f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowCreateAccountModal(true)}
              className="group flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-[0_5px_14px_rgba(0,53,39,0.14)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-primary-container hover:shadow-[0_9px_22px_rgba(0,53,39,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0"
            >
              Get started
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="pt-[88px] pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-caps font-bold uppercase">
              Institutional Wealth Management
            </div>
            <h1 className="font-display text-[48px] leading-[1.1] font-extrabold text-primary tracking-tight">
              The Next Evolution in <br />
              <span className="text-secondary">Personal Finance.</span>
            </h1>
            <p className="text-[18px] text-slate-500 leading-relaxed max-w-[512px]">
              Experience a sophisticated, intelligence-driven platform designed
              for precision capital management and growth. Built for those who
              demand institutional-grade reliability.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-4 bg-primary text-white rounded-lg font-bold text-[18px] flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer"
              >
                Get Started Free
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Hero UI Mockup */}
          <div className="relative">
            <div className="bg-white rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
              <div className="bg-primary p-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                  <div className="w-3 h-3 rounded-full bg-on-primary-container"></div>
                </div>
                <div className="text-[10px] text-primary-fixed uppercase tracking-widest font-bold">
                  Centra Terminal
                </div>
              </div>
              <div className="p-6 bg-surface-container-low grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-outline-variant">
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      TOTAL BALANCE
                    </p>
                    <p className="text-[32px] font-bold font-numeric-data text-primary">
                      $428,950.00
                    </p>
                    <div className="mt-4 h-24 w-full bg-emerald-50 rounded relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary-container/30 to-transparent"></div>
                      <svg
                        className="w-full h-full stroke-primary fill-none stroke-2"
                        viewBox="0 0 400 100"
                        preserveAspectRatio="none"
                      >
                        <path d="M0,80 Q50,40 100,70 T200,30 T300,50 T400,10"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-outline-variant">
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        INVESTMENTS
                      </p>
                      <p className="text-[20px] font-bold text-secondary font-numeric-data">
                        +12.4%
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-outline-variant">
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        LIQUIDITY
                      </p>
                      <p className="text-[20px] font-bold text-primary font-numeric-data">
                        84.2%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-1 bg-white p-4 rounded-lg border border-outline-variant">
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    ASSET ALLOCATION
                  </p>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[60%]"></div>
                    </div>
                    <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full w-[30%]"></div>
                    </div>
                    <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                      <div className="bg-on-primary-container h-full w-[10%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Float element */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-outline-variant flex items-center gap-3 hidden sm:flex">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">
                  verified_user
                </span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-on-surface">
                  Secure Access
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  256-bit AES Encryption
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="bg-primary-container rounded-xl p-12 text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-[48px] font-extrabold text-white mb-4 leading-tight">
                Elevate Your Strategy.
              </h2>
              <p className="text-[18px] text-primary-fixed max-w-2xl mx-auto mb-10 leading-relaxed">
                Join over 50,000 high-net-worth individuals and institutions who
                trust Centra for their financial orchestration.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setShowCreateAccountModal(true)}
                  className="px-10 py-4 bg-white text-primary rounded-lg font-bold hover:bg-emerald-50 transition-all cursor-pointer"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => setShowCreateAccountModal(true)}
                  className="px-10 py-4 border border-primary-fixed text-primary-fixed rounded-lg font-bold hover:bg-white/10 transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto w-full border-t border-slate-200 bg-white py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          <div className="max-w-sm">
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              Centra Financial Systems
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Calm, intelligent tools for keeping your money organized and moving with intention.
            </p>
            <div className="mt-5 border-t border-slate-200 pt-5 text-xs font-medium text-slate-400">
              © 2026 Centra Financial Systems. All rights reserved.
            </div>
          </div>
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-semibold text-slate-600 sm:grid-cols-4 md:justify-items-end">
            <a href="#" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              About
            </a>
            <a href="/views/privacy.html" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              Privacy
            </a>
            <a href="/views/terms.html" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              Security
            </a>
          </nav>
        </div>
      </footer>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToCreateAccount={() => {
            setShowLoginModal(false);
            setShowCreateAccountModal(true);
          }}
        />
      )}

      {showCreateAccountModal && (
        <CreateAccountModal
          onClose={() => setShowCreateAccountModal(false)}
          onSwitchToLogin={() => {
            setShowCreateAccountModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
};

export default LandingPage;
