import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useTransactions,
  useWallets,
  type Transaction,
  type Wallet,
} from "@/hooks/use-budget-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StyledSelect } from "@/components/ui/styled-select";
import { useUiStore } from "@/stores/ui-store";
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import { PageSkeleton } from "@/components/PageSkeleton";

interface CategoryStyle {
  icon: string;
  iconBg: string;
  iconColor: string;
}

const EMPTY_WALLETS: Wallet[] = [];
const EMPTY_TRANSACTIONS: Transaction[] = [];

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  food: {
    icon: "restaurant",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  dining: {
    icon: "restaurant",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  lunch: {
    icon: "restaurant",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  grocery: {
    icon: "shopping_cart",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  transport: {
    icon: "commute",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  commute: {
    icon: "commute",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  travel: {
    icon: "flight_takeoff",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  trip: {
    icon: "flight_takeoff",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  savings: {
    icon: "savings",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
  },
  money: {
    icon: "payments",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  cash: {
    icon: "payments",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  salary: {
    icon: "payments",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  income: {
    icon: "payments",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  freelance: {
    icon: "work",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  bill: { icon: "receipt_long", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  bills: { icon: "receipt_long", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  electric: {
    icon: "bolt",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  internet: { icon: "wifi", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  shopping: {
    icon: "shopping_bag",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  subscription: {
    icon: "subscriptions",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  netflix: {
    icon: "subscriptions",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  health: {
    icon: "fitness_center",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  gym: {
    icon: "fitness_center",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  gas: {
    icon: "local_gas_station",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  game: {
    icon: "sports_esports",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  transfer: {
    icon: "sync_alt",
    iconBg: "bg-surface-container-low",
    iconColor: "text-on-surface-variant",
  },
  other: {
    icon: "receipt_long",
    iconBg: "bg-surface-container-low",
    iconColor: "text-on-surface-variant",
  },
};

const DATE_RANGE_OPTIONS = ["Today", "Week", "Month", "Quarter", "Year"] as const;
type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[number];

function getCategoryStyle(category: string | null | undefined, description: string, type: string): CategoryStyle {
  const source = `${category || ""} ${description || ""}`.toLowerCase();

  for (const [key, style] of Object.entries(CATEGORY_STYLES)) {
    if (source.includes(key)) {
      return style;
    }
  }

  if (type === "Income") {
    return CATEGORY_STYLES.income;
  }
  if (type === "Transfer") {
    return CATEGORY_STYLES.transfer;
  }
  return CATEGORY_STYLES.other;
}

function formatDisplayName(username?: string | null): string {
  if (!username) return "User";
  const firstName = username.replace(/[_-]+/g, " ").trim().split(/\s+/)[0] || "User";
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDateRangeBounds(range: DateRangeOption, reference = new Date()) {
  const now = new Date(reference);
  let start = new Date(now);
  let end = new Date(now);

  if (range === "Today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (range === "Week") {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (range === "Month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (range === "Quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), quarterStartMonth, 1);
    end = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);
    return { start, end };
  }

  start = new Date(now.getFullYear(), 0, 1);
  end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}

function getRangeDescriptor(range: DateRangeOption): string {
  if (range === "Today") return "today's";
  if (range === "Week") return "weekly";
  if (range === "Month") return "monthly";
  if (range === "Quarter") return "quarterly";
  return "yearly";
}

function getEmptyExpenseMessage(range: DateRangeOption): string {
  if (range === "Today") return "No expenses today yet";
  if (range === "Week") return "No expenses this week yet";
  if (range === "Month") return "No expenses this month yet";
  if (range === "Quarter") return "No expenses this quarter yet";
  return "No expenses this year yet";
}

function buildCashflowData(
  range: DateRangeOption,
  transactions: Array<{ dateoftrans: string; amount: string; type: string }>,
  start: Date,
  end: Date,
) {
  if (range === "Today") {
    const data = Array.from({ length: 24 }, (_, hour) => ({
      label: new Date(2024, 0, 1, hour).toLocaleTimeString("en-US", { hour: "numeric" }),
      fullLabel: new Date(start.getFullYear(), start.getMonth(), start.getDate(), hour).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      Income: 0,
      Expenses: 0,
      Net: 0,
    }));

    transactions.forEach((tx) => {
      const txDate = new Date(tx.dateoftrans);
      if (txDate < start || txDate > end) return;
      const bucket = data[txDate.getHours()];
      if (!bucket) return;
      if (tx.type === "Income") bucket.Income += Number(tx.amount);
      if (tx.type === "Expense") bucket.Expenses += Number(tx.amount);
      bucket.Net = bucket.Income - bucket.Expenses;
    });

    return data;
  }

  if (range === "Week") {
    const data = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        fullLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        Income: 0,
        Expenses: 0,
        Net: 0,
      };
    });

    transactions.forEach((tx) => {
      const txDate = new Date(tx.dateoftrans);
      if (txDate < start || txDate > end) return;
      const diffDays = Math.floor((txDate.getTime() - start.getTime()) / 86400000);
      const bucket = data[diffDays];
      if (!bucket) return;
      if (tx.type === "Income") bucket.Income += Number(tx.amount);
      if (tx.type === "Expense") bucket.Expenses += Number(tx.amount);
      bucket.Net = bucket.Income - bucket.Expenses;
    });

    return data;
  }

  if (range === "Month") {
    const daysInMonth = end.getDate();
    const data = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = new Date(start.getFullYear(), start.getMonth(), day);
      return {
        label: String(day),
        fullLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        Income: 0,
        Expenses: 0,
        Net: 0,
      };
    });

    transactions.forEach((tx) => {
      const txDate = new Date(tx.dateoftrans);
      if (txDate < start || txDate > end) return;
      const bucket = data[txDate.getDate() - 1];
      if (!bucket) return;
      if (tx.type === "Income") bucket.Income += Number(tx.amount);
      if (tx.type === "Expense") bucket.Expenses += Number(tx.amount);
      bucket.Net = bucket.Income - bucket.Expenses;
    });

    return data;
  }

  if (range === "Quarter") {
    const data = Array.from({ length: 3 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      return {
        label: date.toLocaleDateString("en-US", { month: "short" }),
        fullLabel: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        Income: 0,
        Expenses: 0,
        Net: 0,
      };
    });

    transactions.forEach((tx) => {
      const txDate = new Date(tx.dateoftrans);
      if (txDate < start || txDate > end) return;
      const bucket = data[txDate.getMonth() - start.getMonth()];
      if (!bucket) return;
      if (tx.type === "Income") bucket.Income += Number(tx.amount);
      if (tx.type === "Expense") bucket.Expenses += Number(tx.amount);
      bucket.Net = bucket.Income - bucket.Expenses;
    });

    return data;
  }

  const data = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(start.getFullYear(), index, 1);
    return {
      label: date.toLocaleDateString("en-US", { month: "short" }),
      fullLabel: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      Income: 0,
      Expenses: 0,
      Net: 0,
    };
  });

  transactions.forEach((tx) => {
    const txDate = new Date(tx.dateoftrans);
    if (txDate < start || txDate > end) return;
    const bucket = data[txDate.getMonth()];
    if (!bucket) return;
    if (tx.type === "Income") bucket.Income += Number(tx.amount);
    if (tx.type === "Expense") bucket.Expenses += Number(tx.amount);
    bucket.Net = bucket.Income - bucket.Expenses;
  });

  return data;
}

const Dashboard = () => {
  const { user } = useAuth();
  const showCurrencySymbol = useUiStore((state) => state.showCurrencySymbol);
  const formatCurrency = useCurrencyFormatter();
  const walletQuery = useWallets();
  const transactionQuery = useTransactions();
  const wallets = walletQuery.data ?? EMPTY_WALLETS;
  const transactions = transactionQuery.data ?? EMPTY_TRANSACTIONS;
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>("Month");
  const [animateTopCategories, setAnimateTopCategories] = useState(false);
  const displayName = formatDisplayName(user?.username);

  const selectedWallet = useMemo(() => {
    if (selectedWalletId === "all") return null;
    return wallets.find((wallet) => String(wallet.wallet_id) === selectedWalletId) || null;
  }, [selectedWalletId, wallets]);

  const visibleWallets = useMemo(() => {
    return selectedWallet ? [selectedWallet] : wallets;
  }, [selectedWallet, wallets]);

  const rangeBounds = useMemo(() => getDateRangeBounds(selectedDateRange), [selectedDateRange]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const walletId = String(tx.wallet_id ?? "");
      const fromId = String(tx.transfer_from_wallet_id ?? "");
      const toId = String(tx.transfer_to_wallet_id ?? "");
      const walletMatch =
        selectedWalletId === "all" ||
        walletId === selectedWalletId ||
        fromId === selectedWalletId ||
        toId === selectedWalletId;

      if (!walletMatch) return false;

      const txDate = new Date(tx.dateoftrans);
      return txDate >= rangeBounds.start && txDate <= rangeBounds.end;
    });
  }, [transactions, selectedWalletId, rangeBounds]);

  const totalBalance = visibleWallets.reduce(
    (sum, wallet) => sum + Number((wallet as { calculated_balance?: string }).calculated_balance || 0),
    0,
  );

  const periodIncome = filteredTransactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const periodExpenses = filteredTransactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const netCashFlow = periodIncome - periodExpenses;
  const savingsRate = periodIncome > 0 ? (netCashFlow / periodIncome) * 100 : 0;
  const savingsTarget = 40;
  const savingsCircle = Math.max(0, Math.min((savingsRate / 100) * 175.9, 175.9));

  const cashflowData = useMemo(() => {
    return buildCashflowData(selectedDateRange, filteredTransactions, rangeBounds.start, rangeBounds.end);
  }, [selectedDateRange, filteredTransactions, rangeBounds]);

  const topCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    filteredTransactions
      .filter((tx) => tx.type === "Expense")
      .forEach((tx) => {
        const key = (tx.category || tx.description.split(" ")[0] || "Other").trim() || "Other";
        categoryTotals[key] = (categoryTotals[key] || 0) + Number(tx.amount);
      });

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([label, amount]) => {
        const style = getCategoryStyle(label, label, "Expense");
        const percent = periodExpenses > 0 ? Math.round((amount / periodExpenses) * 100) : 0;
        return {
          label,
          amount: formatCurrency(amount),
          icon: style.icon,
          bg: style.iconBg,
          text: style.iconColor,
          percent: String(percent) + "%",
        };
      });
  }, [filteredTransactions, formatCurrency, periodExpenses]);

  const recentTx = [...filteredTransactions]
    .sort((a, b) => new Date(b.dateoftrans).getTime() - new Date(a.dateoftrans).getTime())
    .slice(0, 5);

  useEffect(() => {
    setAnimateTopCategories(false);
    const frame = window.requestAnimationFrame(() => setAnimateTopCategories(true));
    return () => window.cancelAnimationFrame(frame);
  }, [topCategories]);

  useEffect(() => {
    if (
      selectedWalletId !== "all" &&
      !wallets.some((wallet) => String(wallet.wallet_id) === selectedWalletId)
    ) {
      setSelectedWalletId("all");
    }
  }, [selectedWalletId, wallets]);

  const selectedWalletLabel = selectedWallet ? selectedWallet.name : "All wallets";
  const cashflowDescription = getRangeDescriptor(selectedDateRange);
  const emptyExpenseMessage = getEmptyExpenseMessage(selectedDateRange);

  if (walletQuery.isLoading || transactionQuery.isLoading) {
    return <PageSkeleton variant="dashboard" label="Loading dashboard" />;
  }

  if (walletQuery.isError || transactionQuery.isError) {
    return (
      <section className="mx-auto mt-20 max-w-[576px] rounded-2xl border border-rose-200 bg-surface-container-lowest p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
          <span className="material-symbols-outlined">cloud_off</span>
        </div>
        <h1 className="mt-5 text-xl font-bold text-on-surface">
          Dashboard data is unavailable
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Your saved data is safe. The dashboard will reconnect automatically.
        </p>
      </section>
    );
  }

  return (
    <div className="animate-fade-in space-y-3">
      <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <h1 className="font-h1 text-h1 text-on-background">Welcome back, {displayName}</h1>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center gap-3 md:w-auto md:max-w-[384px] md:flex-1">
          <div className="relative min-w-[150px] flex-[1_1_150px]">
            <StyledSelect
              value={selectedDateRange}
              onChange={(value) => setSelectedDateRange(value as DateRangeOption)}
              options={DATE_RANGE_OPTIONS.map((option) => ({ value: option, label: option }))}
              className="h-11 md:h-10 rounded-xl bg-surface-container-low pl-9 pr-2 text-sm font-semibold text-on-surface shadow-none hover:bg-surface-container-lowest"
              aria-label="Date range"
            />
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant">
              calendar_month
            </span>
          </div>

          <div className="relative min-w-[150px] flex-[1_1_150px]">
            <StyledSelect
              value={selectedWalletId}
              onChange={setSelectedWalletId}
              options={[{ value: "all", label: "All Wallets" }, ...wallets.map((wallet) => ({ value: String(wallet.wallet_id), label: wallet.name }))]}
              className="h-11 md:h-10 rounded-xl bg-surface-container-low pl-9 pr-2 text-sm font-semibold text-on-surface shadow-none hover:bg-surface-container-lowest"
              aria-label="Wallet filter"
            />
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant">
              account_balance_wallet
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-outline hover:shadow-md dark:hover:border-outline-variant/80 dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.45)] motion-reduce:transform-none">
          <div className="flex items-center justify-between">
            <span className="text-label-caps font-label-caps uppercase text-on-surface-variant">
              Current Balance
            </span>
            <span className="material-symbols-outlined text-secondary">
              account_balance_wallet
            </span>
          </div>
          <div>
            <div className="font-h2 text-h2 text-primary">{formatCurrency(totalBalance)}</div>
            <div className="mt-1 text-[12px] font-medium text-on-surface-variant">
              {selectedWallet
                ? selectedWallet.name
                : wallets.length === 0
                  ? "Held across 0 active wallets"
                  : "Across " + wallets.length + " active wallets"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-outline hover:shadow-md dark:hover:border-outline-variant/80 dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.45)] motion-reduce:transform-none">
          <div className="flex items-center justify-between">
            <span className="text-label-caps font-label-caps uppercase text-on-surface-variant">
              Income
            </span>
            <span className="material-symbols-outlined text-emerald-600">
              trending_up
            </span>
          </div>
          <div>
            <div className="font-h2 text-h2 text-on-background">{formatCurrency(periodIncome)}</div>
            <div className="mt-1 flex items-center gap-1 text-[12px] font-bold text-emerald-600">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              Selected period
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-outline hover:shadow-md dark:hover:border-outline-variant/80 dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.45)] motion-reduce:transform-none">
          <div className="flex items-center justify-between">
            <span className="text-label-caps font-label-caps uppercase text-on-surface-variant">
              Expenses
            </span>
            <span className="material-symbols-outlined text-error">trending_down</span>
          </div>
          <div>
            <div className="font-h2 text-h2 text-on-background">{formatCurrency(periodExpenses)}</div>
            <div className="mt-1 flex items-center gap-1 text-[12px] font-bold text-error">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              Selected period
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-outline hover:shadow-md dark:hover:border-outline-variant/80 dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.45)] motion-reduce:transform-none">
          <div className="flex w-full flex-col gap-2">
            <span className="text-label-caps font-label-caps uppercase text-on-surface-variant">
              Savings Rate
            </span>
            <div>
              <div className="font-h2 text-h2 text-on-background">{savingsRate.toFixed(1)}%</div>
              <div className="mt-1 text-[12px] font-medium text-on-surface-variant">
                Target: {savingsTarget}% | Net: {formatCurrency(netCashFlow)}
              </div>
            </div>
          </div>
          <div className="relative h-16 w-16 shrink-0">
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                className="text-surface-container-high"
                cx="32"
                cy="32"
                fill="transparent"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
              />
              <circle
                className="text-primary"
                cx="32"
                cy="32"
                fill="transparent"
                r="28"
                stroke="currentColor"
                strokeDasharray="175.9"
                strokeDashoffset={175.9 - savingsCircle}
                strokeWidth="6"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-primary">
                savings
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
          <div className="mb-lg flex items-center justify-between">
            <div>
              <h3 className="font-h3 text-h3 text-primary">Cash Flow</h3>
              <p className="text-body-sm text-on-surface-variant">Animated {cashflowDescription} income and expenses for {selectedWalletLabel.toLowerCase()}.</p>
            </div>
            <div className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Income vs expenses
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">Income</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">{formatCurrency(periodIncome)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">Expenses</p>
              <p className="mt-1 text-sm font-semibold text-rose-700">{formatCurrency(periodExpenses)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">Net</p>
              <p className={"mt-1 text-sm font-semibold " + (netCashFlow >= 0 ? "text-teal-700" : "text-rose-700")}>
                {formatCurrency(netCashFlow)}
              </p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" strokeOpacity={0.45} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-on-surface-variant)", fontSize: 12 }}
                  
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-on-surface-variant)", fontSize: 12 }}
                  tickFormatter={(val) => `${showCurrencySymbol ? "₱" : ""}${Number(val) > 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : Number(val)}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid var(--color-outline-variant)",
                    backgroundColor: "var(--color-surface-container-lowest)",
                    color: "var(--color-on-surface)",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.16)",
                  }}
                  labelStyle={{ color: "var(--color-on-surface)" }}
                  itemStyle={{ color: "var(--color-on-surface)" }}
                  formatter={(value: number | string, name) => {
                    const label = name === "Income" ? "Income" : "Expenses";
                    return [formatCurrency(Number(value)), label];
                  }}
                  labelFormatter={(_, payload) => {
                    if (Array.isArray(payload) && payload[0] && payload[0].payload) {
                      return payload[0].payload.fullLabel;
                    }
                    return "";
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  isAnimationActive
                  animationDuration={2600}
                  animationEasing="ease-out"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  isAnimationActive
                  animationDuration={2600}
                  animationEasing="ease-out"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
          <div className="mb-lg flex items-center justify-between">
            <h3 className="font-h3 text-h3 text-primary">Top Categories</h3>
          </div>
          <div className="space-y-5">
            {topCategories.length === 0 ? (
              <p className="py-8 text-center text-body-sm text-on-surface-variant">
                {emptyExpenseMessage}
              </p>
            ) : (
              topCategories.map((category, index) => (
                <div
                  key={category.label}
                  className={`flex items-center gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-500 ease-out ${animateTopCategories ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${category.bg} ${category.text}`}>
                    <span className="material-symbols-outlined">{category.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-end justify-between">
                      <span className="truncate font-bold text-on-background">{category.label}</span>
                      <span className="text-body-sm font-bold text-on-background">{category.amount}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-900 ease-out"
                        style={{ width: animateTopCategories ? category.percent : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant/40 p-lg">
          <h3 className="font-h3 text-h3 text-primary">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/40 bg-surface-container-low">
                <th className="px-lg py-3 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Transaction
                </th>
                <th className="px-lg py-3 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Type
                </th>
                <th className="px-lg py-3 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Wallet
                </th>
                <th className="px-lg py-3 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Date
                </th>
                <th className="px-lg py-3 text-right font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {recentTx.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-lg py-8 text-center text-body-sm text-on-surface-variant">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                recentTx.map((tx) => {
                  const style = getCategoryStyle(tx.category, tx.description, tx.type);
                  const amount = Number(tx.amount);

                  return (
                    <tr key={tx.trans_id} className="transition-colors hover:bg-surface-container-low/70">
                      <td className="px-lg py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor}`}>
                            <span className="material-symbols-outlined">{style.icon}</span>
                          </div>
                          <div>
                            <div className="font-bold text-on-background">{tx.description}</div>
                            {tx.category ? (
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant/70">
                                {tx.category}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-4 whitespace-nowrap">
                        <span
                          className={`rounded-full border px-3 py-1 text-[12px] font-bold ${
                            tx.type === "Income"
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : tx.type === "Transfer"
                                ? "border-blue-100 bg-blue-50 text-blue-700"
                                : "border-rose-100 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-lg py-4 text-body-sm font-bold text-on-surface-variant">
                        {tx.wallet_type}
                      </td>
                      <td className="px-lg py-4 text-body-sm text-on-surface-variant">
                        {formatDate(tx.dateoftrans)}
                      </td>
                      <td
                        className={`px-lg py-4 text-right font-bold ${
                          tx.type === "Income"
                            ? "text-emerald-600"
                            : tx.type === "Transfer"
                              ? "text-blue-600"
                              : "text-error"
                        }`}
                      >
                        {tx.type === "Income" ? "+" : tx.type === "Expense" ? "-" : ""}
                        {formatCurrency(amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;



