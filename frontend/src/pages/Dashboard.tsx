import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTransactions, useWallets } from "@/hooks/use-budget-data";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CategoryStyle {
  icon: string;
  iconBg: string;
  iconColor: string;
}

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
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
  },
  other: {
    icon: "receipt_long",
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
  },
};

const DATE_RANGE_OPTIONS = ["This Week", "This Month", "Quarterly", "Annual"] as const;

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

function formatCurrency(amount: number): string {
  return `PHP ${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const Dashboard = () => {
  const { user } = useAuth();
  const { data: wallets = [], isLoading: walletsLoading } = useWallets();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] =
    useState<(typeof DATE_RANGE_OPTIONS)[number]>("This Month");

  const loading = walletsLoading || transactionsLoading;
  const displayName = user?.username || "User";

  const selectedWallet = useMemo(() => {
    if (selectedWalletId === "all") return null;
    return wallets.find((wallet) => String(wallet.wallet_id) === selectedWalletId) || null;
  }, [selectedWalletId, wallets]);

  const visibleWallets = useMemo(() => {
    return selectedWallet ? [selectedWallet] : wallets;
  }, [selectedWallet, wallets]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;

    if (selectedDateRange === "This Week") {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (selectedDateRange === "This Month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (selectedDateRange === "Quarterly") {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (selectedDateRange === "Annual") {
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }

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
      if (!start) return true;
      const txDate = new Date(tx.dateoftrans);
      return txDate >= start;
    });
  }, [transactions, selectedWalletId, selectedDateRange]);

  const totalBalance = visibleWallets.reduce(
    (sum, wallet) => sum + Number((wallet as { calculated_balance?: string }).calculated_balance || 0),
    0,
  );

  const periodTransactions = filteredTransactions;
  const now = new Date();
  const thisMonthTx = filteredTransactions.filter((tx) => {
    const d = new Date(tx.dateoftrans);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthlyIncome = periodTransactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyExpenses = periodTransactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const netCashFlow = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (netCashFlow / monthlyIncome) * 100 : 0;
  const savingsTarget = 40;
  const savingsCircle = (savingsRate / 100) * 175.9;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cashflowData = Array.from({ length: daysInMonth }, (_, index) => ({
    date: index + 1,
    Income: 0,
    Expenses: 0,
    Net: 0,
  }));

  thisMonthTx.forEach((tx) => {
    const day = new Date(tx.dateoftrans).getDate();
    if (day < 1 || day > daysInMonth) return;

    if (tx.type === "Income") cashflowData[day - 1].Income += Number(tx.amount);
    if (tx.type === "Expense") cashflowData[day - 1].Expenses += Number(tx.amount);
    cashflowData[day - 1].Net = cashflowData[day - 1].Income - cashflowData[day - 1].Expenses;
  });

  const categoryTotals: Record<string, number> = {};
  periodTransactions
    .filter((tx) => tx.type === "Expense")
    .forEach((tx) => {
      const key = (tx.category || tx.description.split(" ")[0] || "Other").trim() || "Other";
      categoryTotals[key] = (categoryTotals[key] || 0) + Number(tx.amount);
    });

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([label, amount]) => {
      const style = getCategoryStyle(label, label, "Expense");
      const percent = monthlyExpenses > 0 ? Math.round((amount / monthlyExpenses) * 100) : 0;
      return {
        label,
        amount: formatCurrency(amount),
        icon: style.icon,
        bg: style.iconBg,
        text: style.iconColor,
        percent: `${percent}%`,
      };
    });

  const recentTx = periodTransactions.slice(0, 5);

  const selectedWalletLabel = selectedWallet ? selectedWallet.name : `All wallets`;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <span className="material-symbols-outlined text-[48px] text-primary animate-spin">
            progress_activity
          </span>
          <p className="font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-lg">
      <section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">Welcome back, {displayName}</h1>
          <p className="mt-1 text-body-sm text-slate-500">
            Viewing {selectedWalletLabel.toLowerCase()}.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <div className="relative">
            <select
              value={selectedDateRange}
              onChange={(e) =>
                setSelectedDateRange(e.target.value as (typeof DATE_RANGE_OPTIONS)[number])
              }
              className="cursor-pointer appearance-none rounded-lg border border-outline-variant bg-white py-2 pl-10 pr-8 font-bold text-body-sm text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              calendar_month
            </span>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              expand_more
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-outline-variant bg-white py-2 pl-10 pr-8 font-bold text-body-sm text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Wallets</option>
              {wallets.map((wallet) => (
                <option key={wallet.wallet_id} value={wallet.wallet_id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              account_balance_wallet
            </span>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              expand_more
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-white p-lg transition-shadow hover:shadow-sm">
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
            <div className="mt-1 text-[12px] font-medium text-slate-500">
              {selectedWallet ? selectedWallet.name : `Across ${wallets.length} wallets`}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-white p-lg transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-label-caps font-label-caps uppercase text-on-surface-variant">
              Income
            </span>
            <span className="material-symbols-outlined text-emerald-600">
              trending_up
            </span>
          </div>
          <div>
            <div className="font-h2 text-h2 text-on-background">{formatCurrency(monthlyIncome)}</div>
            <div className="mt-1 flex items-center gap-1 text-[12px] font-bold text-emerald-600">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              Selected period
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-white p-lg transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-label-caps font-label-caps uppercase text-on-surface-variant">
              Expenses
            </span>
            <span className="material-symbols-outlined text-error">trending_down</span>
          </div>
          <div>
            <div className="font-h2 text-h2 text-on-background">{formatCurrency(monthlyExpenses)}</div>
            <div className="mt-1 flex items-center gap-1 text-[12px] font-bold text-error">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              Selected period
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant bg-white p-lg transition-shadow hover:shadow-sm">
          <div className="flex w-full flex-col gap-2">
            <span className="text-label-caps font-label-caps uppercase text-on-surface-variant">
              Savings Rate
            </span>
            <div>
              <div className="font-h2 text-h2 text-on-background">{savingsRate.toFixed(1)}%</div>
              <div className="mt-1 text-[12px] font-medium text-slate-500">
                Target: {savingsTarget}% | Net: {formatCurrency(netCashFlow)}
              </div>
            </div>
          </div>
          <div className="relative h-16 w-16 shrink-0">
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                className="text-slate-100"
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
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
          <div className="mb-lg flex items-center justify-between">
            <div>
              <h3 className="font-h3 text-h3 text-primary">Cash Flow</h3>
              <p className="text-body-sm text-slate-500">Animated monthly movement for {selectedWalletLabel.toLowerCase()}.</p>
            </div>
            <div className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Net flow live
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Income</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Expenses</p>
              <p className="mt-1 text-sm font-semibold text-rose-700">{formatCurrency(monthlyExpenses)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Net</p>
              <p className={`mt-1 text-sm font-semibold ${netCashFlow >= 0 ? "text-teal-700" : "text-rose-700"}`}>
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
                  <linearGradient id="colorNet" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(val) => `${val}`}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(val) => `PHP ${val > 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
                  }}
                  formatter={(value: number | string, name) => {
                    const label = name === "Income" ? "Income" : name === "Expenses" ? "Expenses" : "Net";
                    return [formatCurrency(Number(value)), label];
                  }}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  isAnimationActive
                  animationDuration={1200}
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
                  animationDuration={1200}
                  animationEasing="ease-out"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Net"
                  stroke="url(#colorNet)"
                  strokeWidth={3.5}
                  dot={false}
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
          <div className="mb-lg flex items-center justify-between">
            <h3 className="font-h3 text-h3 text-primary">Top Categories</h3>
          </div>
          <div className="space-y-5">
            {topCategories.length === 0 ? (
              <p className="py-8 text-center text-body-sm text-slate-400">
                No expenses this month yet
              </p>
            ) : (
              topCategories.map((category) => (
                <div key={category.label} className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${category.bg} ${category.text}`}>
                    <span className="material-symbols-outlined">{category.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-end justify-between">
                      <span className="font-bold text-on-background truncate">{category.label}</span>
                      <span className="text-body-sm font-bold text-on-background">{category.amount}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-primary" style={{ width: category.percent }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-lg">
          <h3 className="font-h3 text-h3 text-primary">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
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
            <tbody className="divide-y divide-slate-100">
              {recentTx.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-lg py-8 text-center text-body-sm text-slate-400">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                recentTx.map((tx) => {
                  const style = getCategoryStyle(tx.category, tx.description, tx.type);
                  const amount = Number(tx.amount);

                  return (
                    <tr key={tx.trans_id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-lg py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor}`}>
                            <span className="material-symbols-outlined">{style.icon}</span>
                          </div>
                          <div>
                            <div className="font-bold text-on-background">{tx.description}</div>
                            {tx.category ? (
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                      <td className="px-lg py-4 text-body-sm font-bold text-slate-600">
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



