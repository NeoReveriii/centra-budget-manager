import { useEffect, useRef } from "react";
import { ArrowRight, Bot } from "lucide-react";
import {
  animate,
  m,
  useInView,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { Link } from "react-router-dom";
import isometricMoneyFlow from "@/assets/landing/centra-isometric-flow.webp";
import { useLandingReducedMotion } from "@/components/landing/LandingMotionPreference";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  className?: string;
}

function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  delay = 0,
  className,
}: AnimatedNumberProps) {
  const reduceMotion = useLandingReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const progress = useMotionValue(reduceMotion ? value : 0);
  const inView = useInView(ref, { once: false, amount: 0.75 });
  const formatter = new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  useMotionValueEvent(progress, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = `${prefix}${formatter.format(latest)}${suffix}`;
    }
  });

  useEffect(() => {
    if (reduceMotion) {
      progress.set(value);
      return;
    }
    if (!inView) {
      progress.set(0);
      return;
    }

    const controls = animate(progress, value, {
      duration: 0.9,
      delay,
      ease: EASE_OUT,
    });
    return () => controls.stop();
  }, [delay, inView, progress, reduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatter.format(reduceMotion ? value : 0)}{suffix}
    </span>
  );
}

function FeatureSignal({ index, reduceMotion }: { index: number; reduceMotion: boolean }) {
  const draw = {
    idle: { pathLength: 0, opacity: 0.28 },
    active: { pathLength: 1, opacity: 1 },
  };
  const reveal = {
    idle: { scale: 0, opacity: 0 },
    active: { scale: 1, opacity: 1 },
  };

  return (
    <m.svg
      viewBox="0 0 68 48"
      initial={reduceMotion ? false : "idle"}
      whileInView="active"
      viewport={{ once: false, amount: 0.8 }}
      aria-hidden="true"
      className="h-12 w-[4.25rem] overflow-visible text-[#19704f] dark:text-[#9cf0bf]"
    >
      {index === 0 && (
        <>
          <path d="M2 42.5H66" stroke="currentColor" strokeOpacity=".28" />
          <m.path
            d="M4 35L17 27L29 31L43 14L54 19L65 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            variants={draw}
            transition={{ duration: reduceMotion ? 0 : 0.72, ease: EASE_OUT }}
          />
          {[4, 17, 29, 43, 54, 65].map((cx, dotIndex) => (
            <m.circle
              key={cx}
              cx={cx}
              cy={[35, 27, 31, 14, 19, 7][dotIndex]}
              r="2.25"
              fill="currentColor"
              variants={reveal}
              transition={{ duration: 0.28, delay: reduceMotion ? 0 : 0.18 + dotIndex * 0.06 }}
            />
          ))}
        </>
      )}

      {index === 1 && (
        <>
          <m.path
            d="M18 5H7V43H18M50 5H61V43H50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            variants={draw}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE_OUT }}
          />
          <m.rect
            x="24"
            y="15"
            width="20"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            variants={reveal}
            transition={{ duration: reduceMotion ? 0 : 0.38, delay: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
          />
          <m.path
            d="M29 15V11C29 4 39 4 39 11V15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            variants={draw}
            transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.28 }}
          />
          <circle cx="34" cy="24" r="2" fill="currentColor" />
        </>
      )}

      {index === 2 && (
        <>
          <m.path
            d="M13 7V41"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            variants={draw}
            transition={{ duration: reduceMotion ? 0 : 0.62, ease: EASE_OUT }}
          />
          {[10, 24, 38].map((cy, rowIndex) => (
            <g key={cy}>
              <m.circle
                cx="13"
                cy={cy}
                r="3.5"
                fill="currentColor"
                variants={reveal}
                transition={{ duration: 0.28, delay: reduceMotion ? 0 : 0.12 + rowIndex * 0.1 }}
              />
              <m.path
                d={`M23 ${cy}H${rowIndex === 1 ? 63 : 53}`}
                stroke="currentColor"
                strokeWidth="2"
                variants={draw}
                transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.18 + rowIndex * 0.1 }}
              />
            </g>
          ))}
        </>
      )}

      {index === 3 && (
        <>
          <path d="M3 7H29V23H9L3 29V7Z" fill="none" stroke="currentColor" strokeOpacity=".36" />
          <m.path
            d="M9 14H23M9 19H18"
            stroke="currentColor"
            strokeWidth="2"
            variants={draw}
            transition={{ duration: reduceMotion ? 0 : 0.46, ease: EASE_OUT }}
          />
          <m.path
            d="M37 19H65V39H43L37 45V19Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            variants={draw}
            transition={{ duration: reduceMotion ? 0 : 0.56, delay: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
          />
          <m.path
            d="M44 27H59M44 32H55"
            stroke="currentColor"
            strokeWidth="2"
            variants={draw}
            transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.38 }}
          />
        </>
      )}
    </m.svg>
  );
}

const platformFeatures = [
  {
    title: "Cash flow, as it changes",
    description: "Income, expenses, and net movement stay readable across the month.",
    side: "left",
  },
  {
    title: "Private by default",
    description: "Protected routes and account-based access keep your workspace personal.",
    side: "left",
  },
  {
    title: "Every peso has a trail",
    description: "Recent activity keeps the amount, wallet, category, and date together.",
    side: "right",
  },
  {
    title: "Ask Kwarta for context",
    description: "Turn current money data into a clear answer and a practical next move.",
    side: "right",
  },
] as const;

function FeatureTile({
  title,
  description,
  side,
  index,
}: {
  title: string;
  description: string;
  side: "left" | "right";
  index: number;
}) {
  const reduceMotion = useLandingReducedMotion();

  return (
    <m.article
      initial={reduceMotion ? false : { opacity: 0, x: side === "left" ? -24 : 24, y: 14 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.9, delay: index * 0.06 }}
      className="group grid min-h-[10.5rem] grid-cols-[4.25rem_1fr] content-start gap-x-5 border-t border-[#cbd8cf] py-6 dark:border-white/14"
    >
      <FeatureSignal index={index} reduceMotion={reduceMotion} />
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.035em] text-[#142019] dark:text-[#f1f6f2]">{title}</h3>
        <p className="mt-2 max-w-[22rem] text-sm leading-6 text-[#617067] dark:text-white/56">{description}</p>
      </div>
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

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.75fr)] lg:items-stretch lg:gap-12">
          <m.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.22 }}
            transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.9 }}
            className="relative min-h-[34rem] overflow-hidden rounded-[1rem] border border-[#26342d] bg-[#0b0e0c] shadow-[0_32px_80px_rgba(7,27,18,0.2)] dark:border-white/10 lg:min-h-0"
          >
            <img
              src={isometricMoneyFlow}
              alt="Isometric Centra money system with connected accounts feeding a savings goal through a mint flow path"
              width="1536"
              height="1024"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </m.div>

          <div className="grid content-center sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1 lg:gap-x-0">
            {platformFeatures.map((feature, index) => (
              <FeatureTile key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const walletBars = [
  { name: "BPI", value: 68240.5, height: 0.92 },
  { name: "Maya", value: 21936.25, height: 0.52 },
  { name: "Cash", value: 8274, height: 0.28 },
] as const;

function FinancialMotionStage() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <div className="overflow-hidden rounded-[1rem] bg-[#0d130f] text-[#eff5f0] shadow-[0_36px_90px_rgba(13,55,37,0.16)] ring-1 ring-[#20342a] dark:ring-white/10">
      <div className="grid gap-10 px-5 pb-8 pt-6 sm:px-8 sm:pb-10 lg:grid-cols-[1.12fr_0.58fr_0.92fr] lg:gap-8 lg:px-12 lg:pb-12 lg:pt-9">
        <section aria-label="Sample connected wallet balances" className="min-w-0">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/88">Connected balance</p>
              <p className="mt-1 text-xs text-white/44">Three active wallets</p>
            </div>
            <AnimatedNumber
              value={98450.75}
              decimals={2}
              prefix="₱"
              delay={0.48}
              className="font-mono text-base font-semibold tabular-nums text-[#baf4d2] sm:text-lg"
            />
          </div>

          <div className="mt-8 flex h-64 items-end gap-5 border-b border-white/16 px-2 sm:gap-8 sm:px-4">
            {walletBars.map((wallet, index) => (
              <div key={wallet.name} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <AnimatedNumber
                  value={wallet.value}
                  decimals={2}
                  prefix="₱"
                  delay={0.1 + index * 0.1}
                  className="mb-3 block truncate font-mono text-[0.68rem] font-semibold tabular-nums text-white/64 sm:text-xs"
                />
                <m.div
                  initial={reduceMotion ? { scaleY: wallet.height } : { scaleY: 0 }}
                  whileInView={{ scaleY: wallet.height }}
                  viewport={{ once: false, amount: 0.45 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.72,
                    delay: reduceMotion ? 0 : 0.08 + index * 0.1,
                    ease: EASE_OUT,
                  }}
                  className="h-[11.5rem] origin-bottom bg-[#74dca1] shadow-[inset_0_1px_0_rgba(255,255,255,0.36)]"
                />
                <span className="mt-3 text-xs font-semibold text-white/70">{wallet.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Monthly contribution" className="flex min-w-0 flex-col justify-center lg:pt-16">
          <p className="text-xs font-medium text-white/42">This month</p>
          <AnimatedNumber
            value={3200}
            prefix="₱"
            delay={0.78}
            className="mt-2 font-mono text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-none tracking-[-0.055em] tabular-nums text-white"
          />
          <p className="mt-3 max-w-[12rem] text-sm leading-6 text-white/50">moves from your available balance toward Travel.</p>
          <div className="relative mt-8 h-px bg-white/12">
            <m.span
              initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: reduceMotion ? 0 : 0.62, delay: reduceMotion ? 0 : 0.76, ease: EASE_OUT }}
              className="absolute inset-0 origin-left bg-[#9cf0bf]"
            />
            <m.span
              initial={reduceMotion ? { x: "calc(100% - 0.75rem)", opacity: 1 } : { x: 0, opacity: 0 }}
              whileInView={{ x: "calc(100% - 0.75rem)", opacity: 1 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: reduceMotion ? 0 : 0.72, delay: reduceMotion ? 0 : 0.78, ease: EASE_OUT }}
              className="absolute -top-1.5 left-0 h-3 w-3 rounded-full bg-[#9cf0bf]"
            />
          </div>
        </section>

        <section aria-label="Travel Fund progress" className="min-w-0 border-t border-white/12 pt-8 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/88">Travel fund</p>
              <p className="mt-1 text-xs text-white/44">Target by December</p>
            </div>
            <AnimatedNumber
              value={58}
              suffix="%"
              delay={0.94}
              className="font-mono text-2xl font-semibold tabular-nums text-[#baf4d2]"
            />
          </div>

          <div className="mt-8 flex h-64 items-end gap-6">
            <div className="relative h-full w-[clamp(5.5rem,10vw,8rem)] border-b border-white/16">
              <m.div
                initial={reduceMotion ? { scaleY: 0.58 } : { scaleY: 0 }}
                whileInView={{ scaleY: 0.58 }}
                viewport={{ once: false, amount: 0.45 }}
                transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.88, ease: EASE_OUT }}
                className="absolute inset-x-0 bottom-0 h-full origin-bottom bg-[#9cf0bf]"
              />
            </div>
            <div className="pb-1">
              <AnimatedNumber
                value={46400}
                prefix="₱"
                delay={0.98}
                className="block font-mono text-2xl font-semibold tabular-nums text-white sm:text-3xl"
              />
              <p className="mt-2 text-sm text-white/46">of ₱80,000</p>
              <p className="mt-8 max-w-[11rem] text-sm leading-6 text-white/58">₱33,600 remains. The next contribution is already in context.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid border-t border-white/12 md:grid-cols-3">
        {[
          ["Wallets stay connected", "Bank, e-wallet, and cash resolve into one dependable balance."],
          ["Movement stays visible", "Each contribution has a source, amount, and destination."],
          ["Goals keep their pace", "Progress updates beside the spending that affects it."],
        ].map(([title, description], index) => (
          <m.div
            key={title}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.7 }}
            transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.12 + index * 0.08, ease: EASE_OUT }}
            className="px-5 py-6 md:border-l md:border-white/12 md:first:border-l-0 sm:px-8"
          >
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-white/92">{title}</h3>
            <p className="mt-2 max-w-[23rem] text-sm leading-6 text-white/50">{description}</p>
          </m.div>
        ))}
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
          className="max-w-3xl"
        >
          <h2 className="text-balance text-[clamp(2.6rem,6vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-[#142019] dark:text-[#eff5f0]">
            Watch the month take shape.
          </h2>
          <p className="mt-6 max-w-[34rem] text-base leading-7 text-[#5d6d63] dark:text-white/58 sm:text-lg">
            Balances resolve first. Then movement and goal progress follow in the same financial story.
          </p>
        </m.div>

        <m.div
          initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.16 }}
          transition={{ duration: reduceMotion ? 0 : 0.72, ease: EASE_OUT }}
          className="mt-14"
        >
          <FinancialMotionStage />
        </m.div>
      </div>
    </section>
  );
}

export function KwartaSection() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <section id="kwarta" className="scroll-mt-28 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1400px] gap-12 border-y border-[#cbd8cf] bg-[#edf2ee] px-5 py-10 dark:border-white/12 dark:bg-[#141815] sm:px-10 sm:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-16 lg:py-20">
        <m.div
          initial={reduceMotion ? false : { opacity: 0, x: -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <p className="text-sm font-semibold text-[#19704f] dark:text-[#9cf0bf]">Kwarta AI</p>
          <h2 className="mt-5 max-w-[32rem] text-balance text-[clamp(2.6rem,5.4vw,5rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-[#142019] dark:text-[#eff5f0]">
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
              <Bot className="h-5 w-5 text-[#9cf0bf]" strokeWidth={1.7} aria-hidden="true" />
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
              <AnimatedNumber
                value={6480}
                prefix="₱"
                delay={0.44}
                className="mt-2 block font-mono text-xl font-semibold tabular-nums"
              />
            </m.div>
            <m.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.65 }}
              transition={{ duration: 0.45, delay: 0.5, ease: EASE_OUT }}
              className="rounded-[1.1rem] bg-[#9cf0bf] p-4 text-[#062117]"
            >
              <p className="text-xs text-[#174c36]">Suggested contribution</p>
              <AnimatedNumber
                value={1200}
                prefix="₱"
                delay={0.5}
                className="mt-2 block font-mono text-xl font-semibold tabular-nums"
              />
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
          <h2 className="max-w-3xl text-balance text-[clamp(2.8rem,6.6vw,6.5rem)] font-semibold leading-[0.91] tracking-[-0.07em] text-[#142019] dark:text-[#eff5f0]">
            Your workspace stays yours.
          </h2>
        </m.div>

        <div>
          {[
            {
              title: "Protected access",
              description: "Account-based authentication guards every private product route.",
            },
            {
              title: "Clear data boundaries",
              description: "The public preview uses sample data. Your real dashboard only loads after sign-in.",
            },
          ].map((item, index) => (
            <m.article
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, x: 34 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.55 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT }}
              className="grid grid-cols-[2rem_1fr] gap-4 border-t border-[#cbd8cf] py-7 dark:border-white/14"
            >
              <span className="mt-1 font-mono text-xs font-semibold tracking-[0.08em] text-[#19704f] dark:text-[#9cf0bf]" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
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
