import { useId } from "react";
import { m } from "framer-motion";
import { useLandingReducedMotion } from "@/components/landing/LandingMotionPreference";
import { cn } from "@/lib/utils";

export interface CentraDashboardPreviewProps {
  className?: string;
  compact?: boolean;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: "dashboard", active: true },
  { label: "Transactions", icon: "receipt_long", active: false },
  { label: "Wallets", icon: "account_balance_wallet", active: false },
  { label: "Goals", icon: "target", active: false },
  { label: "Kwarta AI", icon: "auto_awesome", active: false },
] as const;

const KPI_CARDS = [
  {
    label: "Current Balance",
    icon: "account_balance_wallet",
    iconClassName: "text-secondary",
    value: "₱128,450.75",
    valueClassName: "text-primary dark:text-[#75f0ad]",
    detail: "Across 3 active wallets",
    detailIcon: null,
    detailClassName: "text-slate-500",
  },
  {
    label: "Income",
    icon: "trending_up",
    iconClassName: "text-emerald-600",
    value: "₱74,850.00",
    valueClassName: "text-on-background dark:text-[#f5f5f5]",
    detail: "Selected period",
    detailIcon: "arrow_upward",
    detailClassName: "text-emerald-600",
  },
  {
    label: "Expenses",
    icon: "trending_down",
    iconClassName: "text-error",
    value: "₱42,685.35",
    valueClassName: "text-on-background dark:text-[#f5f5f5]",
    detail: "Selected period",
    detailIcon: "arrow_downward",
    detailClassName: "text-error",
  },
] as const;

const CATEGORIES = [
  {
    label: "Housing",
    amount: "₱14,500.00",
    percent: 34,
    icon: "home",
    iconClassName: "bg-teal-50 text-teal-700 dark:bg-[#1d1d1d] dark:text-teal-300",
  },
  {
    label: "Food & Dining",
    amount: "₱9,735.35",
    percent: 23,
    icon: "restaurant",
    iconClassName: "bg-orange-50 text-orange-600 dark:bg-[#1d1d1d] dark:text-orange-300",
  },
  {
    label: "Transport",
    amount: "₱5,420.00",
    percent: 13,
    icon: "commute",
    iconClassName: "bg-emerald-50 text-emerald-600 dark:bg-[#1d1d1d] dark:text-emerald-300",
  },
  {
    label: "Utilities",
    amount: "₱4,280.00",
    percent: 10,
    icon: "bolt",
    iconClassName: "bg-amber-50 text-amber-700 dark:bg-[#242018] dark:text-amber-300",
  },
] as const;

const RECENT_ACTIVITY = [
  {
    description: "Payroll deposit",
    category: "Salary",
    type: "Income",
    wallet: "Main Wallet",
    date: "Aug 8, 2026",
    dateTime: "2026-08-08",
    amount: "+₱38,750.00",
    icon: "payments",
    iconClassName: "bg-emerald-50 text-emerald-700 dark:bg-[#1d1d1d] dark:text-emerald-300",
  },
  {
    description: "Weekend groceries",
    category: "Food",
    type: "Expense",
    wallet: "Daily Wallet",
    date: "Aug 7, 2026",
    dateTime: "2026-08-07",
    amount: "−₱2,846.40",
    icon: "shopping_cart",
    iconClassName: "bg-orange-50 text-orange-600 dark:bg-[#1d1d1d] dark:text-orange-300",
  },
  {
    description: "Meralco bill",
    category: "Utilities",
    type: "Expense",
    wallet: "Main Wallet",
    date: "Aug 6, 2026",
    dateTime: "2026-08-06",
    amount: "−₱3,420.15",
    icon: "bolt",
    iconClassName: "bg-amber-50 text-amber-700 dark:bg-[#242018] dark:text-amber-300",
  },
  {
    description: "Emergency fund",
    category: "Savings",
    type: "Transfer",
    wallet: "Goal Wallet",
    date: "Aug 5, 2026",
    dateTime: "2026-08-05",
    amount: "₱8,000.00",
    icon: "sync_alt",
    iconClassName: "bg-slate-50 text-slate-600 dark:bg-[#1d1d1d] dark:text-slate-300",
  },
] as const;

const TRANSACTION_TONES = {
  Income: {
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-[#343434] dark:bg-[#1d1d1d] dark:text-emerald-300",
    amount: "text-emerald-600 dark:text-emerald-300",
  },
  Expense: {
    badge: "border-rose-100 bg-rose-50 text-rose-700 dark:border-[#343434] dark:bg-[#241719] dark:text-rose-300",
    amount: "text-error dark:text-rose-300",
  },
  Transfer: {
    badge: "border-blue-100 bg-blue-50 text-blue-700 dark:border-[#343434] dark:bg-[#1d1d1d] dark:text-blue-300",
    amount: "text-blue-600 dark:text-blue-300",
  },
} as const;

function MaterialIcon({
  icon,
  className,
  size,
}: {
  icon: string;
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined inline-flex shrink-0 items-center justify-center leading-none", className)}
      style={size ? { fontSize: `${size}px`, width: `${size}px`, height: `${size}px` } : undefined}
    >
      {icon}
    </span>
  );
}

function CentraMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 28"
      className="h-7 w-7 shrink-0 text-[#1a7a5e] dark:text-[#75f0ad]"
      fill="none"
    >
      <path d="M3 5.5 24.5 3 22 24.5l-6.2-7.1-4.6 5.1.8-8.2L3 9.8Z" fill="currentColor" />
      <path d="m4.7 8.2 14.2-.9-7.6 4.9Z" fill="white" fillOpacity="0.86" />
      <path d="m14.1 13.7 6.5-4.4-1.1 9.4Z" fill="white" fillOpacity="0.72" />
    </svg>
  );
}

function DashboardSidebar({ compact }: { compact: boolean }) {
  return (
    <aside
      aria-label="Centra application sidebar"
      className={cn(
        "hidden shrink-0 flex-col border-r border-[#bccabe] bg-[#f2f4f6] font-[Inter] text-[#3d4a40] sm:flex dark:border-[#343434] dark:bg-[#121212] dark:text-[#c2c2c2]",
        compact ? "w-[128px] lg:w-[148px]" : "w-[148px] lg:w-[184px]",
      )}
    >
      <div className={cn("flex shrink-0 items-center border-b border-[#bccabe]/30 px-3", compact ? "h-12" : "h-14")}>
        <div className="flex min-w-0 items-center gap-2">
          <CentraMark />
          <span className="truncate text-[15px] font-bold tracking-[-0.3px] text-[#1a7a5e] dark:text-[#75f0ad]">
            centra
          </span>
        </div>
        <MaterialIcon icon="menu_open" className="ml-auto hidden text-[17px] text-[#3d4a40] lg:block dark:text-[#c2c2c2]" />
      </div>

      <nav aria-label="Primary preview navigation" className="flex-1 space-y-0.5 px-2 py-2">
        {SIDEBAR_ITEMS.map((item) => (
          <div
            key={item.label}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex h-9 items-center rounded-xl px-2 text-[11px] font-medium",
              item.active
                ? "bg-white font-semibold text-[#0f5a5c] shadow-sm dark:bg-[#242424] dark:text-[#75f0ad]"
                : "text-[#3d4a40] dark:text-[#c2c2c2]",
            )}
          >
            <span className="flex w-7 shrink-0 items-center justify-center">
              <MaterialIcon icon={item.icon} className="text-[15px]" />
            </span>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-[#bccabe]/30 px-2 py-2 dark:border-[#343434]">
        <div className="flex h-9 items-center rounded-xl px-2 text-[11px] font-medium">
          <span className="flex w-7 shrink-0 items-center justify-center">
            <MaterialIcon icon="settings" className="text-[15px]" />
          </span>
          <span>Settings</span>
        </div>
        <div className="flex h-9 items-center rounded-xl px-2 text-[11px] font-medium">
          <span className="flex w-7 shrink-0 items-center justify-center">
            <MaterialIcon icon="logout" className="text-[15px]" />
          </span>
          <span>Sign Out</span>
        </div>
      </div>

      <div className={cn("shrink-0 px-2", compact ? "pb-2.5" : "pb-3")}>
        <div className="flex h-11 min-w-0 items-center rounded-xl px-1.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0f5a5c]/20 bg-[#0f5a5c] text-[10px] font-bold text-white">
            AL
          </span>
          <span className="ml-2 min-w-0 flex-1">
            <span className="block truncate text-[11px] font-bold text-[#191c1e] dark:text-[#f1f5f9]">Alex</span>
            <span className="block truncate text-[10px] text-[#3d4a40] dark:text-[#a3a3a3]">alex@email.com</span>
          </span>
          <MaterialIcon icon="unfold_more" className="ml-1 text-[14px] text-[#3d4a40] dark:text-[#a3a3a3]" />
        </div>
      </div>
    </aside>
  );
}

function CashFlowChart({ compact }: { compact: boolean }) {
  const reduceMotion = useLandingReducedMotion();
  const id = useId().replace(/:/g, "");
  const incomeGradientId = `${id}-income`;
  const expenseGradientId = `${id}-expense`;
  const netGradientId = `${id}-net`;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  const lineInitial = reduceMotion ? false : { pathLength: 0, opacity: 0 };

  return (
    <div className={cn("relative mt-2 w-full", compact ? "h-[108px]" : "h-[126px] lg:h-[146px]")}>
      <svg
        viewBox="0 0 620 205"
        preserveAspectRatio="none"
        className="h-full w-full"
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>Cash Flow</title>
        <desc id={descriptionId}>
          Sample monthly cash-flow chart showing income, expenses, and net movement across all wallets.
        </desc>
        <defs>
          <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="95%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={expenseGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity="0.26" />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={netGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {[24, 72, 120, 168].map((y) => (
          <line
            key={y}
            x1="38"
            y1={y}
            x2="610"
            y2={y}
            stroke="currentColor"
            strokeDasharray="3 4"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="text-slate-100 dark:text-[#343434]"
          />
        ))}

        <g aria-hidden="true" className="fill-slate-500 text-[10px] font-medium dark:fill-slate-400">
          <text x="0" y="171">₱0</text>
          <text x="0" y="123">₱20k</text>
          <text x="0" y="75">₱40k</text>
          <text x="0" y="27">₱60k</text>
          <text x="38" y="196">Aug 1</text>
          <text x="218" y="196">Aug 10</text>
          <text x="400" y="196">Aug 20</text>
          <text x="574" y="196">Aug 31</text>
        </g>

        <m.path
          d="M38 151 C80 145 97 126 134 130 C174 135 190 103 235 108 C281 114 297 77 344 87 C392 98 411 59 461 68 C512 79 534 44 610 48 L610 168 L38 168 Z"
          fill={`url(#${incomeGradientId})`}
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.65, ease: EASE_OUT }}
        />
        <m.path
          d="M38 151 C80 145 97 126 134 130 C174 135 190 103 235 108 C281 114 297 77 344 87 C392 98 411 59 461 68 C512 79 534 44 610 48"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={lineInitial}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1.05, ease: EASE_OUT }}
        />
        <m.path
          d="M38 168 C82 163 98 154 134 157 C175 161 192 143 235 148 C281 153 299 131 344 137 C391 145 413 121 461 127 C513 134 540 107 610 113 L610 168 L38 168 Z"
          fill={`url(#${expenseGradientId})`}
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.08, ease: EASE_OUT }}
        />
        <m.path
          d="M38 168 C82 163 98 154 134 157 C175 161 192 143 235 148 C281 153 299 131 344 137 C391 145 413 121 461 127 C513 134 540 107 610 113"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={lineInitial}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1.05, delay: reduceMotion ? 0 : 0.1, ease: EASE_OUT }}
        />
        <m.path
          d="M38 162 C80 158 99 146 134 149 C174 152 193 129 235 134 C280 139 301 108 344 117 C391 126 416 94 461 104 C512 115 540 82 610 90"
          fill="none"
          stroke={`url(#${netGradientId})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={lineInitial}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1, delay: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
        />
      </svg>
    </div>
  );
}

export default function CentraDashboardPreview({
  className,
  compact = false,
}: CentraDashboardPreviewProps) {
  const reduceMotion = useLandingReducedMotion();
  const id = useId().replace(/:/g, "");
  const cashFlowHeadingId = `${id}-cash-flow-heading`;
  const categoriesHeadingId = `${id}-categories-heading`;
  const activityHeadingId = `${id}-activity-heading`;
  const visibleCategories = compact ? CATEGORIES.slice(0, 3) : CATEGORIES;
  const visibleActivity = compact ? RECENT_ACTIVITY.slice(0, 3) : RECENT_ACTIVITY;

  return (
    <section
      aria-label="Static preview of the signed-in Centra dashboard"
      className={cn(
        "relative isolate w-full overflow-hidden border border-outline-variant bg-background text-on-background shadow-[0_28px_80px_rgba(15,23,42,0.16)] dark:border-[#343434] dark:bg-[#0a0a0a] dark:text-[#f5f5f5]",
        compact ? "rounded-[18px]" : "rounded-[24px]",
        className,
      )}
      data-dashboard-preview="sample"
    >
      <p className="sr-only">All balances and transactions in this dashboard preview are sample data.</p>

      <div className="flex min-w-0">
        <DashboardSidebar compact={compact} />

        <div className="min-w-0 flex-1 bg-background dark:bg-[#0a0a0a]">
          <header className="flex h-11 items-center justify-between border-b border-outline-variant bg-white px-3 sm:hidden dark:border-[#343434] dark:bg-[#121212]">
            <MaterialIcon icon="menu" className="text-[18px] text-slate-600 dark:text-[#ededed]" />
            <span className="text-[14px] font-bold tracking-[-0.3px] text-primary dark:text-[#75f0ad]">centra</span>
            <span aria-hidden="true" className="w-[18px]" />
          </header>

          <div className={cn("mx-auto w-full max-w-[1400px]", compact ? "p-2.5 sm:p-3" : "p-3 sm:p-4 lg:p-5")}>
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className={cn("truncate font-h1 font-extrabold tracking-[-0.01em] text-on-background dark:text-[#f5f5f5]", compact ? "text-[15px]" : "text-[17px] lg:text-[20px]")}>
                    Welcome back, Alex
                  </h2>
                  <span className="shrink-0 rounded-full border border-outline-variant bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant dark:border-[#343434] dark:bg-[#181818] dark:text-[#a3a3a3]">
                    Sample data
                  </span>
                </div>
              </div>

              <div role="group" aria-label="Dashboard preview filters" className="flex w-full min-w-0 gap-1.5 sm:w-auto">
                <span className="relative inline-flex h-9 min-w-[102px] flex-1 items-center overflow-hidden whitespace-nowrap rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-7 text-[11px] font-semibold text-slate-800 sm:flex-none dark:border-[#343434] dark:bg-[#121212] dark:text-[#ededed]">
                  <MaterialIcon icon="calendar_month" size={14} className="absolute left-2.5 text-slate-500 dark:text-[#a3a3a3]" />
                  Month
                  <MaterialIcon icon="expand_more" size={13} className="absolute right-2 text-slate-500 dark:text-[#a3a3a3]" />
                </span>
                <span className="relative inline-flex h-9 min-w-[120px] flex-1 items-center overflow-hidden whitespace-nowrap rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-7 text-[11px] font-semibold text-slate-800 sm:flex-none dark:border-[#343434] dark:bg-[#121212] dark:text-[#ededed]">
                  <MaterialIcon icon="account_balance_wallet" size={14} className="absolute left-2.5 text-slate-500 dark:text-[#a3a3a3]" />
                  All Wallets
                  <MaterialIcon icon="expand_more" size={13} className="absolute right-2 text-slate-500 dark:text-[#a3a3a3]" />
                </span>
              </div>
            </div>

            <dl className={cn("mt-2.5 grid grid-cols-2", compact ? "gap-1.5 lg:grid-cols-4" : "gap-2 lg:grid-cols-4")}>
              {KPI_CARDS.map((card, index) => (
                <m.div
                  key={card.label}
                  className={cn(
                    "flex min-w-0 flex-col rounded-xl border border-outline-variant bg-white dark:border-[#343434] dark:bg-[#181818]",
                    compact ? "gap-1.5 p-2" : "gap-2 p-2.5 lg:p-3",
                  )}
                  initial={reduceMotion ? false : { opacity: 0, y: 9, scale: 0.99 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.42, delay: reduceMotion ? 0 : index * 0.06, ease: EASE_OUT }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <dt className="truncate text-[10px] font-bold uppercase tracking-[0.04em] text-on-surface-variant dark:text-[#b8b8b8]">
                      {card.label}
                    </dt>
                    <MaterialIcon icon={card.icon} className={cn("text-[14px]", card.iconClassName)} />
                  </div>
                  <div>
                    <dd className={cn("truncate font-h2 text-[14px] font-bold tabular-nums tracking-[-0.01em] lg:text-[16px]", card.valueClassName)}>
                      {card.value}
                    </dd>
                    <dd className={cn("mt-1 flex items-center gap-1 truncate text-[10px] font-medium", card.detailClassName)}>
                      {card.detailIcon ? <MaterialIcon icon={card.detailIcon} size={11} /> : null}
                      {card.detail}
                    </dd>
                  </div>
                </m.div>
              ))}

              <m.div
                className={cn(
                  "grid min-w-0 grid-cols-[minmax(0,1fr)_58px] items-stretch gap-2 rounded-xl border border-outline-variant bg-white dark:border-[#343434] dark:bg-[#181818]",
                  compact ? "p-2" : "p-2.5 lg:p-3",
                )}
                initial={reduceMotion ? false : { opacity: 0, y: 9, scale: 0.99 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.42, delay: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
              >
                <div className="min-w-0 self-center">
                  <dt className="text-[10px] font-bold uppercase leading-[1.2] tracking-[0.04em] text-on-surface-variant dark:text-[#b8b8b8]">
                    Savings Rate
                  </dt>
                  <dd className="mt-1 truncate font-h2 text-[14px] font-bold tabular-nums tracking-[-0.01em] text-on-background lg:text-[16px] dark:text-[#f5f5f5]">
                    43.0%
                  </dd>
                  <dd className="mt-1 flex min-w-0 flex-col text-[10px] font-medium leading-4 text-slate-500 dark:text-[#a3a3a3]">
                    <span className="truncate">Target: 40%</span>
                    <span className="truncate">Net: ₱32,164.65</span>
                  </dd>
                </div>
                <div aria-hidden="true" className="flex min-h-[58px] items-center justify-center border-l border-slate-100 dark:border-[#343434]">
                  <div className="relative h-11 w-11 shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="17.5" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-slate-100 dark:text-[#2c2c2c]" />
                      <m.circle
                        cx="22"
                        cy="22"
                        r="17.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray="109.96"
                        className="text-primary dark:text-[#75f0ad]"
                        initial={{ strokeDashoffset: reduceMotion ? 62.68 : 109.96 }}
                        whileInView={{ strokeDashoffset: 62.68 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.85, delay: reduceMotion ? 0 : 0.14, ease: EASE_OUT }}
                      />
                    </svg>
                    <MaterialIcon icon="savings" size={14} className="absolute inset-0 m-auto text-primary dark:text-[#75f0ad]" />
                  </div>
                </div>
              </m.div>
            </dl>

            <div className={cn("mt-2 grid min-w-0", compact ? "gap-1.5 lg:grid-cols-[1.2fr_0.8fr]" : "gap-2 lg:grid-cols-[1.2fr_0.8fr]")}>
              <section
                aria-labelledby={cashFlowHeadingId}
                className={cn(
                  "min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm dark:border-[#343434] dark:bg-[#181818]",
                  compact ? "p-2" : "p-2.5 lg:p-3",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 id={cashFlowHeadingId} className="font-h3 text-[13px] font-semibold text-primary dark:text-[#75f0ad]">Cash Flow</h3>
                    <p className="mt-0.5 hidden truncate text-[10px] font-medium text-slate-500 sm:block dark:text-[#a3a3a3]">Animated monthly movement for all wallets.</p>
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:inline-flex dark:bg-[#121212] dark:text-[#a3a3a3]">
                    Net flow live
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2 dark:border-[#343434] dark:bg-[#121212]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Income</p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">₱74,850.00</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Expenses</p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold tabular-nums text-rose-700 dark:text-rose-300">₱42,685.35</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Net</p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold tabular-nums text-teal-700 dark:text-teal-300">₱32,164.65</p>
                  </div>
                </div>

                <CashFlowChart compact={compact} />
              </section>

              <section
                aria-labelledby={categoriesHeadingId}
                className={cn(
                  "min-w-0 rounded-xl border border-outline-variant bg-white shadow-sm dark:border-[#343434] dark:bg-[#181818]",
                  compact ? "p-2" : "p-2.5 lg:p-3",
                )}
              >
                <h3 id={categoriesHeadingId} className="font-h3 text-[13px] font-semibold text-primary dark:text-[#75f0ad]">Top Categories</h3>
                <ul className={cn("mt-2", compact ? "space-y-1.5" : "space-y-2")}>
                  {visibleCategories.map((category, index) => (
                    <m.li
                      key={category.label}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.025)] dark:border-[#343434] dark:bg-[#121212]"
                      initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.6 }}
                      transition={{ duration: 0.36, delay: reduceMotion ? 0 : index * 0.05, ease: EASE_OUT }}
                    >
                      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", category.iconClassName)}>
                        <MaterialIcon icon={category.icon} className="text-[12px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[10px] font-bold text-on-background dark:text-[#ededed]">{category.label}</span>
                          <span className="shrink-0 text-[10px] font-bold tabular-nums text-on-background dark:text-[#ededed]">{category.amount}</span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-[#2c2c2c]">
                          <div className="h-full" style={{ width: `${category.percent}%` }}>
                            <m.div
                              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-primary/70 via-primary to-secondary dark:from-[#75f0ad] dark:via-[#65cf96] dark:to-[#c2c2c2]"
                              initial={reduceMotion ? false : { scaleX: 0 }}
                              whileInView={{ scaleX: 1 }}
                              viewport={{ once: false, amount: 0.6 }}
                              transition={{ duration: 0.72, delay: reduceMotion ? 0 : 0.1 + index * 0.055, ease: EASE_OUT }}
                            />
                          </div>
                        </div>
                      </div>
                    </m.li>
                  ))}
                </ul>
              </section>
            </div>

            <section
              aria-labelledby={activityHeadingId}
              className="mt-2 hidden min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm sm:block dark:border-[#343434] dark:bg-[#181818]"
            >
              <div className="border-b border-slate-100 p-2.5 dark:border-[#343434]">
                <h3 id={activityHeadingId} className="font-h3 text-[13px] font-semibold text-primary dark:text-[#75f0ad]">Recent Activity</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left">
                  <caption className="sr-only">Recent activity containing sample transaction data</caption>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.04em] text-on-surface-variant dark:border-[#343434] dark:bg-[#121212] dark:text-[#b8b8b8]">
                      <th scope="col" className="w-[42%] px-2.5 py-1.5 sm:w-[35%]">Transaction</th>
                      <th scope="col" className="hidden w-[14%] px-2 py-1.5 sm:table-cell">Type</th>
                      <th scope="col" className="hidden w-[18%] px-2 py-1.5 md:table-cell">Wallet</th>
                      <th scope="col" className="hidden w-[17%] px-2 py-1.5 lg:table-cell">Date</th>
                      <th scope="col" className="w-[25%] px-2.5 py-1.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#343434]">
                    {visibleActivity.map((transaction, index) => {
                      const tone = TRANSACTION_TONES[transaction.type];
                      return (
                        <m.tr
                          key={`${transaction.description}-${transaction.dateTime}`}
                          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.7 }}
                          transition={{ duration: 0.32, delay: reduceMotion ? 0 : index * 0.04, ease: EASE_OUT }}
                        >
                          <td className="px-2.5 py-1.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", transaction.iconClassName)}>
                                <MaterialIcon icon={transaction.icon} className="text-[12px]" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-[10px] font-bold text-on-background dark:text-[#ededed]">{transaction.description}</span>
                                <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{transaction.category}</span>
                              </span>
                            </div>
                          </td>
                          <td className="hidden px-2 py-1.5 sm:table-cell">
                            <span className={cn("inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-bold", tone.badge)}>{transaction.type}</span>
                          </td>
                          <td className="hidden truncate px-2 py-1.5 text-[10px] font-bold text-slate-600 md:table-cell dark:text-[#c2c2c2]">{transaction.wallet}</td>
                          <td className="hidden px-2 py-1.5 text-[10px] font-medium text-on-surface-variant lg:table-cell dark:text-[#b8b8b8]">
                            <time dateTime={transaction.dateTime}>{transaction.date}</time>
                          </td>
                          <td className={cn("px-2.5 py-1.5 text-right text-[10px] font-bold tabular-nums", tone.amount)}>{transaction.amount}</td>
                        </m.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      <span
        role="img"
        aria-label="Quick actions"
        className={cn(
          "absolute bottom-3 right-3 flex items-center justify-center rounded-xl bg-[#003527] text-white shadow-xl dark:bg-[#00533d]",
          compact ? "h-9 w-9" : "h-10 w-10",
        )}
      >
        <MaterialIcon icon="add" className="text-[18px]" />
      </span>
    </section>
  );
}
