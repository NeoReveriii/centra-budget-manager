import { useId } from "react";
import { m } from "framer-motion";
import { useLandingReducedMotion } from "@/components/landing/LandingMotionPreference";
import { cn } from "@/lib/utils";

export interface CentraMoneyFlowProps {
  className?: string;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const WALLETS = [
  {
    name: "BPI Savings",
    type: "Bank",
    balance: "₱68,240.50",
    mark: "B",
    selected: true,
  },
  {
    name: "Main Wallet",
    type: "E-wallet",
    balance: "₱21,936.25",
    mark: "M",
    selected: false,
  },
  {
    name: "Daily Cash",
    type: "Cash",
    balance: "₱8,274.00",
    mark: "₱",
    selected: false,
  },
] as const;

function MaterialIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("material-symbols-outlined leading-none", className)}>
      {icon}
    </span>
  );
}

function DesktopFlowRail({ reducedMotion }: { reducedMotion: boolean }) {
  const railId = useId().replace(/:/g, "");
  const railGradientId = `${railId}-rail`;
  const arrowId = `${railId}-arrow`;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 520"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
    >
      <defs>
        <linearGradient id={railGradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#87d9ad" />
          <stop offset="46%" stopColor="#0f6949" />
          <stop offset="100%" stopColor="#70c99a" />
        </linearGradient>
        <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f6949" />
        </marker>
      </defs>

      <path
        d="M205 248 C314 248 348 214 446 248 C510 270 558 279 630 249 C690 224 744 240 806 248"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 9"
        vectorEffect="non-scaling-stroke"
        className="text-[#c5d8cc] dark:text-white/14"
      />
      <m.path
        d="M205 248 C314 248 348 214 446 248 C510 270 558 279 630 249 C690 224 744 240 806 248"
        fill="none"
        stroke={`url(#${railGradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        markerEnd={`url(#${arrowId})`}
        initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ duration: 1.2, ease: EASE_OUT }}
      />

      <m.g
        initial={reducedMotion ? { x: 302, y: 2 } : { x: 0, y: 0 }}
        whileInView={reducedMotion ? undefined : { x: [0, 112, 235, 356, 507, 601], y: [0, -8, -2, 16, -4, 0] }}
        viewport={{ amount: 0.2 }}
        transition={reducedMotion ? undefined : { duration: 4.6, repeat: Infinity, repeatDelay: 1.1, ease: "easeInOut" }}
      >
        <circle cx="205" cy="248" r="13" fill="#0f6949" />
        <circle cx="205" cy="248" r="17" fill="none" stroke="#8ee4b6" strokeOpacity="0.45" />
        <text x="205" y="253" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">₱</text>
      </m.g>
    </svg>
  );
}

function MobileFlowRail({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 375 690"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full sm:hidden"
    >
      <path
        d="M188 210 C188 278 166 302 188 354 C209 405 188 450 188 520"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 8"
        vectorEffect="non-scaling-stroke"
        className="text-[#bcd2c4] dark:text-white/15"
      />
      <m.path
        d="M188 210 C188 278 166 302 188 354 C209 405 188 450 188 520"
        fill="none"
        stroke="#0f6949"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1.05, ease: EASE_OUT }}
      />
      <m.g
        initial={reducedMotion ? { y: 154 } : { y: 0 }}
        whileInView={reducedMotion ? undefined : { y: [0, 88, 155, 237, 310], x: [0, -5, 0, 5, 0] }}
        viewport={{ amount: 0.2 }}
        transition={reducedMotion ? undefined : { duration: 4.2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
      >
        <circle cx="188" cy="210" r="13" fill="#0f6949" />
        <text x="188" y="215" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">₱</text>
      </m.g>
    </svg>
  );
}

function WalletStack({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section aria-labelledby="money-flow-wallets" className="relative z-10 mx-auto w-full max-w-[17rem] sm:mx-0 sm:max-w-[15rem] lg:max-w-[17rem]">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 id="money-flow-wallets" className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#526b5d] dark:text-white/68">
          Source wallets
        </h3>
        <span className="text-[11px] font-semibold text-[#53665b] dark:text-white/66">3 connected</span>
      </div>

      <ul className="relative h-[11rem] sm:h-[12rem]">
        {WALLETS.map((wallet, index) => (
          <m.li
            key={wallet.name}
            className={cn(
              "absolute right-0 flex h-[4.6rem] items-center gap-3 rounded-[1.1rem] border px-3.5 shadow-[0_15px_34px_rgba(18,60,43,0.1)] backdrop-blur-md",
              wallet.selected
                ? "border-[#7dcaa1] bg-white text-[#152219] ring-1 ring-[#a7e3c2]/55 dark:border-[#43775c] dark:bg-[#1a221d] dark:text-white"
                : "border-[#d9e4dc] bg-white/88 text-[#263a2e] dark:border-white/9 dark:bg-[#171c18]/94 dark:text-white/84",
            )}
            style={{
              top: `${index * 49}px`,
              left: `${index * 9}px`,
              zIndex: WALLETS.length - index,
            }}
            initial={reducedMotion ? false : { opacity: 0, x: -24, y: 8 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5, delay: reducedMotion ? 0 : index * 0.08, ease: EASE_OUT }}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center border-r border-[#b9cbbf] pr-2 font-mono text-[13px] font-bold text-[#19704f] dark:border-white/16 dark:text-[#9cf0bf]" aria-hidden="true">
              {wallet.mark}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[12px] font-bold">{wallet.name}</span>
                {wallet.selected ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1b9a64]" aria-label="Selected source" /> : null}
              </span>
              <span className="mt-0.5 block text-[11px] text-[#53645b] dark:text-white/66">{wallet.type}</span>
            </span>
            <span className="shrink-0 text-right font-mono text-[12px] font-semibold tabular-nums text-[#173f30] dark:text-[#baf4d2]">
              {wallet.balance}
            </span>
          </m.li>
        ))}
      </ul>
    </section>
  );
}

function TransferNode({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section aria-labelledby="money-flow-transfer" className="relative z-10 mx-auto flex w-[8.5rem] flex-col items-center text-center">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#577063] dark:text-white/68">Transfer</span>
      <div className="relative mt-3 grid h-[5.7rem] w-[5.7rem] place-items-center rounded-full border border-white/85 bg-white/78 shadow-[0_20px_46px_rgba(16,72,49,0.15)] backdrop-blur-xl dark:border-white/12 dark:bg-[#172019]/88">
        <m.span
          aria-hidden="true"
          className="absolute inset-[-8px] rounded-full border border-[#82d2a7]/45"
          whileInView={reducedMotion ? undefined : { scale: [0.94, 1.08, 0.94], opacity: [0.3, 0.05, 0.3] }}
          viewport={{ amount: 0.35 }}
          transition={reducedMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0d5038] text-white shadow-[0_8px_20px_rgba(13,80,56,0.26)] dark:bg-[#9cf0bf] dark:text-[#073322]">
          <m.span
            className="inline-flex"
            whileInView={reducedMotion ? undefined : { rotate: [0, 180, 360] }}
            viewport={{ amount: 0.35 }}
            transition={reducedMotion ? undefined : { duration: 7, repeat: Infinity, ease: "linear" }}
          >
            <MaterialIcon icon="sync_alt" className="text-[22px]" />
          </m.span>
        </span>
      </div>
      <h3 id="money-flow-transfer" className="mt-3 font-mono text-[17px] font-semibold tabular-nums text-[#123e2e] dark:text-[#baf4d2]">
        ₱3,200
      </h3>
      <p className="mt-0.5 text-[11px] font-medium text-[#53665b] dark:text-white/66">Monthly contribution</p>
    </section>
  );
}

function TravelGoal({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section aria-labelledby="money-flow-goal" className="relative z-10 mx-auto w-full max-w-[16rem] sm:mx-0 sm:max-w-[14rem] lg:max-w-[16rem]">
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#526b5d] dark:text-white/68">Destination goal</span>
      <div className="mt-4 border-y border-[#b9cbbf] py-4 dark:border-white/16">
        <div className="flex items-end justify-between gap-3">
          <h3 id="money-flow-goal" className="text-[15px] font-semibold tracking-[-0.03em] text-[#142019] dark:text-[#f1f6f2]">Travel Fund</h3>
          <span className="font-mono text-[22px] font-semibold leading-none tabular-nums text-[#123e2e] dark:text-[#baf4d2]">58%</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden bg-[#cddbd1] dark:bg-white/10" role="img" aria-label="Travel Fund is 58 percent funded">
          <m.div
            className="h-full origin-left bg-[#19704f] dark:bg-[#9cf0bf]"
            initial={reducedMotion ? { scaleX: 0.58 } : { scaleX: 0 }}
            whileInView={{ scaleX: 0.58 }}
            viewport={{ once: false, amount: 0.6 }}
            transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.2, ease: EASE_OUT }}
          />
        </div>
        <div className="mt-3 flex justify-between gap-3 font-mono text-[10px] font-semibold tabular-nums text-[#3d5e4c] dark:text-[#a7d9bd]">
          <span>₱46,400 funded</span>
          <span>₱80,000 goal</span>
        </div>
      </div>
      <p className="mt-3 text-[11px] font-medium text-[#53645b] dark:text-white/66">₱33,600 remaining by December 2026</p>
    </section>
  );
}

function KwartaInsight({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <m.aside
      aria-label="Kwarta AI sample insight"
      className="flex w-full max-w-[19rem] items-center gap-3 rounded-[1.15rem] border border-[#b8d6c4] bg-[#113d2d] px-3.5 py-3 text-white shadow-[0_18px_42px_rgba(10,53,37,0.22)] dark:border-[#3d6550] dark:bg-[#0d2b21]"
      initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.55 }}
      transition={{ duration: 0.55, delay: reducedMotion ? 0 : 0.4, ease: EASE_OUT }}
    >
      <span className="shrink-0 border-r border-white/18 pr-3 font-mono text-sm font-bold text-[#9cf0bf]" aria-hidden="true">K</span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-[11px] font-bold">Kwarta AI</span>
          <span className="rounded-full border border-white/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white/72">Insight</span>
        </span>
        <span className="mt-1 block text-[12px] leading-[1.45] text-white/78">
          ₱3,200 this month keeps Travel Fund on pace.
        </span>
      </span>
    </m.aside>
  );
}

export default function CentraMoneyFlow({ className }: CentraMoneyFlowProps) {
  const reducedMotion = useLandingReducedMotion();

  return (
    <m.section
      aria-label="Centra sample money flow from connected wallets to a savings goal"
      className={cn(
        "relative isolate w-full overflow-hidden rounded-[1.7rem] border border-[#d3dfd7] bg-[#edf4ef] px-4 pb-5 pt-4 text-[#142019] shadow-[0_26px_68px_rgba(18,62,46,0.13)] dark:border-white/10 dark:bg-[#111713] dark:text-[#eff5f0] sm:min-h-[29rem] sm:px-5 sm:pb-6 sm:pt-5 lg:min-h-[31rem] lg:px-7",
        className,
      )}
      initial={
        reducedMotion
          ? { clipPath: "inset(0% 0% 0% 0% round 1.7rem)", opacity: 1 }
          : { clipPath: "inset(12% 0% 10% 0% round 1.7rem)", opacity: 0 }
      }
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 1.7rem)", opacity: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: reducedMotion ? 0 : 0.72, ease: EASE_OUT }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.92),transparent_27%),radial-gradient(circle_at_84%_80%,rgba(66,164,112,0.17),transparent_30%),linear-gradient(rgba(33,91,61,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(33,91,61,0.025)_1px,transparent_1px)] bg-[size:auto,auto,28px_28px,28px_28px] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(93,186,132,0.12),transparent_27%),radial-gradient(circle_at_84%_80%,rgba(38,116,76,0.2),transparent_30%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-[36%] h-52 w-52 rounded-full border border-[#a9ccb7]/30 dark:border-white/6" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#b9eed0]/28 blur-3xl dark:bg-[#1d704b]/12" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#4f6257] dark:text-white/68">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1b9a64] shadow-[0_0_0_4px_rgba(27,154,100,0.1)]" />
          Money flow
        </span>
        <span className="rounded-full border border-[#c6d8cd] bg-white/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#4f6257] backdrop-blur-sm dark:border-white/14 dark:bg-white/7 dark:text-white/68">
          Sample data
        </span>
      </div>

      <DesktopFlowRail reducedMotion={reducedMotion} />
      <MobileFlowRail reducedMotion={reducedMotion} />

      <div className="relative z-10 mt-5 grid items-center gap-8 sm:mt-8 sm:min-h-[18rem] sm:grid-cols-[minmax(0,1fr)_8.5rem_minmax(0,1fr)] sm:gap-3 lg:mt-10 lg:gap-7">
        <m.div
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: reducedMotion ? 0 : 0.52, delay: reducedMotion ? 0 : 0.12, ease: EASE_OUT }}
        >
          <WalletStack reducedMotion={reducedMotion} />
        </m.div>
        <m.div
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: reducedMotion ? 0 : 0.52, delay: reducedMotion ? 0 : 0.22, ease: EASE_OUT }}
        >
          <TransferNode reducedMotion={reducedMotion} />
        </m.div>
        <m.div
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: reducedMotion ? 0 : 0.56, delay: reducedMotion ? 0 : 0.32, ease: EASE_OUT }}
        >
          <TravelGoal reducedMotion={reducedMotion} />
        </m.div>
      </div>

      <div className="relative z-20 mx-auto mt-5 flex justify-center sm:absolute sm:bottom-5 sm:left-1/2 sm:mt-0 sm:w-[19rem] sm:-translate-x-1/2 lg:bottom-6">
        <KwartaInsight reducedMotion={reducedMotion} />
      </div>
    </m.section>
  );
}
