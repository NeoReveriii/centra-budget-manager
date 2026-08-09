import {
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  Fingerprint,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { m } from "framer-motion";
import { Link } from "react-router-dom";
import CentraMoneyFlow from "@/components/landing/CentraMoneyFlow";
import { useLandingReducedMotion } from "@/components/landing/LandingMotionPreference";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const platformFeatures = [
  {
    title: "Cash flow, as it changes",
    description: "Income, expenses, and net movement stay readable across the month.",
    Icon: ChartNoAxesCombined,
    side: "left",
  },
  {
    title: "Private by default",
    description: "Protected routes and account-based access keep your workspace personal.",
    Icon: Fingerprint,
    side: "left",
  },
  {
    title: "Every peso has a trail",
    description: "Recent activity keeps the amount, wallet, category, and date together.",
    Icon: ReceiptText,
    side: "right",
  },
  {
    title: "Ask Kwarta for context",
    description: "Turn current money data into a clear answer and a practical next move.",
    Icon: Bot,
    side: "right",
  },
] as const;

function FeatureTile({
  title,
  description,
  Icon,
  side,
  index,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
  side: "left" | "right";
  index: number;
}) {
  const reduceMotion = useLandingReducedMotion();

  return (
    <m.article
      initial={reduceMotion ? false : { opacity: 0, x: side === "left" ? -44 : 44, y: 22, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.9, delay: index * 0.06 }}
      className="group flex min-h-[13.5rem] flex-col items-center justify-center rounded-[1.75rem] bg-[#eef2ed] px-6 py-8 text-center ring-1 ring-[#dfe6df] transition-shadow hover:shadow-[0_18px_48px_rgba(18,62,46,0.09)] dark:bg-[#151916] dark:ring-white/8"
    >
      <m.span
        whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: side === "left" ? -3 : 3 }}
        className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#9cf0bf] text-[#0b3b29] shadow-[0_12px_30px_rgba(38,119,80,0.18)]"
      >
        <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
      </m.span>
      <h3 className="mt-6 text-xl font-semibold tracking-[-0.035em] text-[#142019] dark:text-[#f1f6f2]">{title}</h3>
      <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#617067] dark:text-white/56">{description}</p>
    </m.article>
  );
}

export function PlatformShowcase() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <section
      id="platform"
      className="scroll-mt-28 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <m.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-balance text-[clamp(2.6rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.065em] text-[#142019] dark:text-[#eff5f0]">
            One place to understand the whole month.
          </h2>
          <p className="mx-auto mt-6 max-w-[36rem] text-base leading-7 text-[#5d6d63] dark:text-white/58 sm:text-lg">
            Centra keeps the detail close and the decisions simple.
          </p>
        </m.div>

        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(12rem,0.7fr)_minmax(0,2fr)_minmax(12rem,0.7fr)] lg:items-stretch lg:gap-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {platformFeatures.slice(0, 2).map((feature, index) => (
              <FeatureTile key={feature.title} {...feature} index={index} />
            ))}
          </div>

          <m.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.22 }}
            transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.9 }}
            className="relative order-first min-h-[34rem] overflow-hidden rounded-[2rem] bg-[#aef2c8] p-3 shadow-[0_32px_80px_rgba(18,62,46,0.16)] sm:p-6 lg:order-none lg:min-h-0"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.7),transparent_31%),radial-gradient(circle_at_88%_88%,rgba(5,83,56,0.18),transparent_34%)]" aria-hidden="true" />
            <div className="relative flex h-full items-center justify-center py-7 sm:py-10">
              <CentraMoneyFlow className="w-full max-w-[54rem]" />
            </div>
          </m.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {platformFeatures.slice(2).map((feature, index) => (
              <FeatureTile key={feature.title} {...feature} index={index + 2} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WalletsVisual() {
  const reduceMotion = useLandingReducedMotion();
  const wallets = [
    { name: "BPI Savings", type: "Bank", balance: "₱68,240.50", offset: "translate-x-0" },
    { name: "Maya Wallet", type: "E-wallet", balance: "₱21,936.25", offset: "sm:translate-x-4" },
    { name: "Daily Cash", type: "Cash", balance: "₱8,274.00", offset: "sm:translate-x-8" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[28rem] flex-col gap-3" aria-label="Sample connected wallets">
      {wallets.map((wallet, index) => (
        <m.div
          key={wallet.name}
          initial={reduceMotion ? false : { opacity: 0, x: -24, y: 16 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: false, amount: 0.65 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : index * 0.08, ease: EASE_OUT }}
          className={`flex items-center justify-between rounded-[1.25rem] border border-[#dce6df] bg-white px-4 py-4 shadow-[0_14px_34px_rgba(19,55,40,0.08)] dark:border-white/10 dark:bg-[#171b18] ${wallet.offset}`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ddf8e8] text-[#0d5038] dark:bg-[#163c2d] dark:text-[#9cf0bf]">
              <WalletCards className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#152219] dark:text-white/90">{wallet.name}</span>
              <span className="mt-0.5 block text-xs text-[#58685f] dark:text-white/65">{wallet.type}</span>
            </span>
          </div>
          <span className="font-mono text-sm font-semibold tabular-nums text-[#173f30] dark:text-[#baf4d2]">{wallet.balance}</span>
        </m.div>
      ))}
      <div className="mt-3 flex items-center justify-between rounded-full bg-[#123e2e] px-5 py-3 text-sm font-medium text-white dark:bg-[#9cf0bf] dark:text-[#062117]">
        <span>Across 3 wallets</span>
        <span className="font-mono tabular-nums">₱98,450.75</span>
      </div>
    </div>
  );
}

function GoalsVisual() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <div className="mx-auto w-full max-w-[28rem] rounded-[1.6rem] border border-[#dce6df] bg-white p-5 shadow-[0_18px_46px_rgba(19,55,40,0.09)] dark:border-white/10 dark:bg-[#171b18]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#152219] dark:text-white/90">Travel fund</p>
          <p className="mt-1 text-xs text-[#58685f] dark:text-white/65">Target by December</p>
        </div>
        <Target className="h-6 w-6 text-[#0d5038] dark:text-[#9cf0bf]" strokeWidth={1.8} aria-hidden="true" />
      </div>

      <div className="mt-8 flex items-center gap-6">
        <m.div
          initial={reduceMotion ? false : { rotate: -30, scale: 0.85, opacity: 0 }}
          whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
          viewport={{ once: false, amount: 0.7 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 20 }}
          className="grid h-28 w-28 shrink-0 place-items-center rounded-full bg-[conic-gradient(#0d5038_0deg,#0d5038_192deg,#dce7df_192deg,#dce7df_360deg)] p-2 dark:bg-[conic-gradient(#9cf0bf_0deg,#9cf0bf_192deg,#2b332e_192deg,#2b332e_360deg)]"
          aria-label="Goal is 53 percent funded"
        >
          <div className="grid h-full w-full place-items-center rounded-full bg-white text-center dark:bg-[#171b18]">
            <span className="font-mono text-2xl font-semibold tabular-nums text-[#123e2e] dark:text-[#baf4d2]">53%</span>
          </div>
        </m.div>
        <div>
          <p className="font-mono text-2xl font-semibold tabular-nums text-[#152219] dark:text-white/90">₱42,680</p>
          <p className="mt-1 text-sm text-[#58685f] dark:text-white/65">of ₱80,000</p>
          <div className="mt-5 rounded-xl bg-[#edf7f1] px-3 py-2.5 text-xs font-medium text-[#315c49] dark:bg-[#1d2a23] dark:text-[#a7d9bd]">
            ₱3,200 contributed this month
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductPairSection() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto w-full max-w-[1400px]">
        <m.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-balance text-[clamp(2.6rem,6vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-[#142019] dark:text-[#eff5f0]">
            Less switching. More knowing.
          </h2>
          <p className="mx-auto mt-6 max-w-[36rem] text-base leading-7 text-[#5d6d63] dark:text-white/58 sm:text-lg">
            Accounts and goals stay close enough to read in one glance.
          </p>
        </m.div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <m.article
            initial={reduceMotion ? false : { opacity: 0, y: 48, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
            className="flex min-h-[38rem] flex-col overflow-hidden rounded-[2rem] bg-[#eef2ed] p-5 ring-1 ring-[#dfe6df] dark:bg-[#151916] dark:ring-white/8 sm:p-8"
          >
            <div className="flex flex-1 items-center justify-center py-7 sm:py-10">
              <WalletsVisual />
            </div>
            <div className="mx-auto max-w-[28rem] pb-3 text-center">
              <h3 className="text-3xl font-semibold tracking-[-0.05em] text-[#142019] dark:text-[#f1f6f2]">Wallets stay connected</h3>
              <p className="mt-3 text-sm leading-6 text-[#617067] dark:text-white/56 sm:text-base">
                Bank, e-wallet, and cash balances roll into one dependable total.
              </p>
            </div>
          </m.article>

          <m.article
            initial={reduceMotion ? false : { opacity: 0, y: 48, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.08, ease: EASE_OUT }}
            className="flex min-h-[38rem] flex-col overflow-hidden rounded-[2rem] bg-[#eef2ed] p-5 ring-1 ring-[#dfe6df] dark:bg-[#151916] dark:ring-white/8 sm:p-8"
          >
            <div className="flex flex-1 items-center justify-center py-7 sm:py-10">
              <GoalsVisual />
            </div>
            <div className="mx-auto max-w-[28rem] pb-3 text-center">
              <h3 className="text-3xl font-semibold tracking-[-0.05em] text-[#142019] dark:text-[#f1f6f2]">Goals move with the month</h3>
              <p className="mt-3 text-sm leading-6 text-[#617067] dark:text-white/56 sm:text-base">
                Contributions, deadlines, and progress stay visible beside everyday spending.
              </p>
            </div>
          </m.article>
        </div>
      </div>
    </section>
  );
}

export function KwartaSection() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <section id="kwarta" className="scroll-mt-28 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1400px] gap-12 rounded-[2rem] border border-[#dce5de] bg-[#edf2ee] px-5 py-10 dark:border-white/10 dark:bg-[#141815] sm:px-10 sm:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-16 lg:py-20">
        <m.div
          initial={reduceMotion ? false : { opacity: 0, x: -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-[#9cf0bf] text-[#0b3b29]">
            <Sparkles className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="mt-8 max-w-[32rem] text-balance text-[clamp(2.6rem,5.4vw,5rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-[#142019] dark:text-[#eff5f0]">
            Ask about your money, not your spreadsheets.
          </h2>
          <p className="mt-6 max-w-[28rem] text-base leading-7 text-[#5d6d63] dark:text-white/58 sm:text-lg">
            Kwarta AI answers with the financial context already inside Centra.
          </p>
        </m.div>

        <m.div
          initial={reduceMotion ? false : { opacity: 0, x: 36, scale: 0.97 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.9 }}
          className="rounded-[1.7rem] bg-[#111411] p-4 text-[#eff5f0] shadow-[0_30px_74px_rgba(4,20,12,0.2)] sm:p-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9cf0bf] text-[#0b3b29]">
                <Bot className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Kwarta AI</p>
                <p className="mt-0.5 text-xs text-white/45">Demo insight</p>
              </div>
            </div>
            <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/54">This month</span>
          </div>

          <m.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.7 }}
            transition={{ duration: 0.5, delay: 0.18, ease: EASE_OUT }}
            className="ml-auto mt-6 w-fit max-w-[82%] rounded-[1.2rem] rounded-br-md bg-white/9 px-4 py-3 text-sm leading-6 text-white/82"
          >
            Can I add more to my travel goal this month?
          </m.div>

          <m.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.55 }}
            transition={{ duration: 0.55, delay: 0.32, ease: EASE_OUT }}
            className="mt-4 max-w-[92%] rounded-[1.2rem] rounded-bl-md bg-[#183126] px-5 py-4 text-sm leading-6 text-[#daf8e6]"
          >
            Your dining spend is ₱1,840 above its 3-month average. Moving ₱1,200 to Travel keeps ₱6,480 available after planned bills.
          </m.div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <m.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.65 }}
              transition={{ duration: 0.45, delay: 0.44, ease: EASE_OUT }}
              className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs text-white/45">Available after bills</p>
              <p className="mt-2 font-mono text-xl font-semibold tabular-nums">₱6,480</p>
            </m.div>
            <m.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.65 }}
              transition={{ duration: 0.45, delay: 0.5, ease: EASE_OUT }}
              className="rounded-[1.1rem] bg-[#9cf0bf] p-4 text-[#062117]"
            >
              <p className="text-xs text-[#174c36]">Suggested contribution</p>
              <p className="mt-2 font-mono text-xl font-semibold tabular-nums">₱1,200</p>
            </m.div>
          </div>
        </m.div>
      </div>
    </section>
  );
}

export function SecuritySection() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <section id="security" className="scroll-mt-28 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1400px] gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <m.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-[#dff8e9] text-[#0d5038] dark:bg-[#183c2d] dark:text-[#9cf0bf]">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="mt-8 max-w-3xl text-balance text-[clamp(2.8rem,6.6vw,6.5rem)] font-semibold leading-[0.91] tracking-[-0.07em] text-[#142019] dark:text-[#eff5f0]">
            Your workspace stays yours.
          </h2>
        </m.div>

        <div className="space-y-3">
          {[
            {
              title: "Protected access",
              description: "Account-based authentication guards every private product route.",
              Icon: LockKeyhole,
            },
            {
              title: "Clear data boundaries",
              description: "The public preview uses sample data. Your real dashboard only loads after sign-in.",
              Icon: Fingerprint,
            },
          ].map((item, index) => (
            <m.article
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, x: 34 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.55 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT }}
              className="flex gap-4 rounded-[1.5rem] border border-[#dce5de] bg-[#f7f9f6] p-5 dark:border-white/9 dark:bg-[#151916] sm:p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#9cf0bf] text-[#0b3b29]">
                <item.Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.025em] text-[#142019] dark:text-[#f1f6f2]">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#617067] dark:text-white/54">{item.description}</p>
              </div>
            </m.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <section className="px-4 pb-24 pt-12 sm:px-6 sm:pb-32 lg:px-8">
      <m.div
        initial={reduceMotion ? false : { opacity: 0, y: 44, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ type: "spring", stiffness: 110, damping: 22, mass: 0.9 }}
        className="relative mx-auto flex min-h-[34rem] w-full max-w-[1400px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#123e2e] px-5 py-20 text-center text-white shadow-[0_34px_90px_rgba(12,62,43,0.2)] dark:bg-[#10231a] sm:px-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_22%,rgba(156,240,191,0.28),transparent_30%),radial-gradient(circle_at_88%_82%,rgba(156,240,191,0.14),transparent_34%)]" aria-hidden="true" />
        <div className="relative max-w-4xl">
          <h2 className="text-balance text-[clamp(3rem,7.7vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
            See the month before it gets away from you.
          </h2>
          <p className="mx-auto mt-7 max-w-[36rem] text-base leading-7 text-white/65 sm:text-lg">
            Start with one wallet, then let Centra make the rest easier to read.
          </p>
          <Link
            to="/register"
            className="group mx-auto mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#9cf0bf] px-6 text-sm font-semibold text-[#062117] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#b8f5cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98] motion-reduce:transform-none"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
          </Link>
        </div>
      </m.div>
    </section>
  );
}
