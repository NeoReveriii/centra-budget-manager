import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { animate, m, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import {
  useCreateWallet,
  useDeleteWallet,
  useTransactions,
  useUpdateWallet,
  useWallets,
  type Transaction,
  type Wallet,
} from "@/hooks/use-budget-data";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StyledSelect } from "@/components/ui/styled-select";
import FieldError from "@/components/FieldError";
import { cn } from "@/lib/utils";
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import {
  getWalletProviderPreset,
  inferWalletProviderKey,
  WALLET_PROVIDER_OPTIONS,
  WalletCardFace,
} from "@/components/wallets/WalletCardFace";
import { PageSkeleton } from "@/components/PageSkeleton";

type WalletFilter = "ALL" | "ACTIVE" | "ARCHIVED";

interface WalletFieldErrors {
  name?: string;
  initialBalance?: string;
}

function validateInitialBalance(value: string) {
  if (!value.trim()) return "";
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "Enter zero or a positive starting balance.";
  return "";
}

const EMPTY_WALLETS: Wallet[] = [];
const EMPTY_TRANSACTIONS: Transaction[] = [];
const WALLET_TYPES = [
  "E-Wallet",
  "Bank Account",
  "Cash",
  "Credit Card",
  "Investment",
] as const;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isWalletActive(wallet: Wallet) {
  return String(wallet.status || "ACTIVE").toUpperCase() === "ACTIVE";
}

function walletHasTransaction(transaction: Transaction, walletId: number) {
  return (
    transaction.wallet_id === walletId ||
    transaction.transfer_from_wallet_id === walletId ||
    transaction.transfer_to_wallet_id === walletId
  );
}

function transactionAmountLabel(
  transaction: Transaction,
  walletId: number,
  formatCurrency: (amount: number) => string,
) {
  const amount = formatCurrency(Number(transaction.amount));
  if (transaction.type === "Income") {
    return { label: `+${amount}`, tone: "text-emerald-700 dark:text-emerald-300" };
  }
  if (transaction.type === "Expense") {
    return { label: `-${amount}`, tone: "text-rose-700 dark:text-rose-300" };
  }
  if (transaction.transfer_to_wallet_id === walletId) {
    return { label: `+${amount}`, tone: "text-emerald-700 dark:text-emerald-300" };
  }
  return { label: `-${amount}`, tone: "text-slate-700 dark:text-slate-200" };
}

function WalletCountUp({
  value,
  formatValue,
}: {
  value: number;
  formatValue: (value: number) => string;
}) {
  const reduceMotion = useReducedMotion();
  const textRef = useRef<HTMLSpanElement>(null);
  const formatterRef = useRef(formatValue);
  const progress = useMotionValue(0);
  formatterRef.current = formatValue;

  useMotionValueEvent(progress, "change", (latest) => {
    if (textRef.current) textRef.current.textContent = formatterRef.current(latest);
  });

  useEffect(() => {
    progress.set(0);
    const controls = animate(progress, value, {
      duration: reduceMotion ? 0.45 : 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [progress, reduceMotion, value]);

  return (
    <span aria-label={formatValue(value)}>
      <span ref={textRef} aria-hidden="true">{formatValue(0)}</span>
    </span>
  );
}

const Wallets = () => {
  const reduceMotion = useReducedMotion();
  const formatCurrency = useCurrencyFormatter();
  const showCurrencySymbol = useUiStore((state) => state.showCurrencySymbol);
  const walletQuery = useWallets();
  const transactionQuery = useTransactions();
  const wallets = walletQuery.data ?? EMPTY_WALLETS;
  const transactions = transactionQuery.data ?? EMPTY_TRANSACTIONS;

  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const deleteWallet = useDeleteWallet();

  const setAddModalOpen = useUiStore((state) => state.setAddModalOpen);
  const setAddModalDefaultType = useUiStore((state) => state.setAddModalDefaultType);
  const setAddModalDefaultWalletId = useUiStore(
    (state) => state.setAddModalDefaultWalletId,
  );
  const setTransferModalOpen = useUiStore((state) => state.setTransferModalOpen);
  const setTransferModalFromWalletId = useUiStore(
    (state) => state.setTransferModalFromWalletId,
  );

  const [filter, setFilter] = useState<WalletFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [form, setForm] = useState({
    provider: "custom",
    name: "",
    type: "E-Wallet",
    initial_balance: "",
  });
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<WalletFieldErrors>({});
  const [actionError, setActionError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const activeWallets = useMemo(
    () => wallets.filter(isWalletActive),
    [wallets],
  );
  const archivedWallets = useMemo(
    () => wallets.filter((wallet) => !isWalletActive(wallet)),
    [wallets],
  );
  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + Number(wallet.calculated_balance || 0),
    0,
  );
  const activeBalance = activeWallets.reduce(
    (sum, wallet) => sum + Number(wallet.calculated_balance || 0),
    0,
  );

  const activityCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const wallet of wallets) {
      counts.set(
        wallet.wallet_id,
        transactions.filter((transaction) =>
          walletHasTransaction(transaction, wallet.wallet_id),
        ).length,
      );
    }
    return counts;
  }, [transactions, wallets]);

  const visibleWallets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return wallets.filter((wallet) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && isWalletActive(wallet)) ||
        (filter === "ARCHIVED" && !isWalletActive(wallet));
      const matchesSearch =
        !term ||
        wallet.name.toLowerCase().includes(term) ||
        wallet.type.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, wallets]);

  const selectedWallet =
    wallets.find((wallet) => wallet.wallet_id === selectedWalletId) ?? null;
  const selectedTransactions = selectedWallet
    ? transactions
        .filter((transaction) =>
          walletHasTransaction(transaction, selectedWallet.wallet_id),
        )
        .slice(0, 5)
    : [];
  const selectedFlow = selectedWallet
    ? transactions.reduce(
        (totals, transaction) => {
          if (!walletHasTransaction(transaction, selectedWallet.wallet_id)) {
            return totals;
          }
          const amount = Number(transaction.amount);
          if (
            transaction.type === "Income" ||
            transaction.transfer_to_wallet_id === selectedWallet.wallet_id
          ) {
            totals.in += amount;
          }
          if (
            transaction.type === "Expense" ||
            transaction.transfer_from_wallet_id === selectedWallet.wallet_id
          ) {
            totals.out += amount;
          }
          return totals;
        },
        { in: 0, out: 0 },
      )
    : { in: 0, out: 0 };


  function openCreate() {
    setEditingWallet(null);
    setForm({ provider: "custom", name: "", type: "E-Wallet", initial_balance: "" });
    setFormError("");
    setFieldErrors({});
    setFormOpen(true);
  }

  function openEdit(wallet: Wallet) {
    setEditingWallet(wallet);
    setForm({
      provider: inferWalletProviderKey(wallet.type),
      name: wallet.name,
      type: wallet.type,
      initial_balance: String(Number(wallet.initial_balance)),
    });
    setFormError("");
    setFieldErrors({});
    setFormOpen(true);
  }

  async function saveWallet(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const nextFieldErrors: WalletFieldErrors = {
      name: form.name.trim() ? "" : "Enter a name for this wallet.",
      initialBalance: validateInitialBalance(form.initial_balance),
    };
    setFieldErrors(nextFieldErrors);

    const firstInvalidId = nextFieldErrors.name
      ? "wallet-name"
      : nextFieldErrors.initialBalance
        ? "wallet-balance"
        : "";
    if (firstInvalidId) {
      document.getElementById(firstInvalidId)?.focus();
      return;
    }

    const initialBalance = Number(form.initial_balance || 0);

    try {
      if (editingWallet) {
        await updateWallet.mutateAsync({
          wallet_id: editingWallet.wallet_id,
          name: form.name.trim(),
          type: form.type,
          status: isWalletActive(editingWallet) ? "ACTIVE" : "ARCHIVED",
          initial_balance: initialBalance,
        });
      } else {
        const result = await createWallet.mutateAsync({
          name: form.name.trim(),
          type: form.type,
          initial_balance: initialBalance,
        });
        setSelectedWalletId(result.wallet.wallet_id);
      }
      setFormOpen(false);
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : "Could not save wallet");
    }
  }

  async function toggleWalletStatus(wallet: Wallet) {
    setActionError("");
    try {
      await updateWallet.mutateAsync({
        wallet_id: wallet.wallet_id,
        name: wallet.name,
        type: wallet.type,
        status: isWalletActive(wallet) ? "ARCHIVED" : "ACTIVE",
      });
    } catch (error: unknown) {
      setActionError(
        error instanceof Error ? error.message : "Could not update wallet status",
      );
    }
  }

  async function confirmDelete() {
    if (!walletToDelete) return;
    setDeleteError("");
    try {
      await deleteWallet.mutateAsync(walletToDelete.wallet_id);
      setWalletToDelete(null);
      if (selectedWalletId === walletToDelete.wallet_id) {
        setSelectedWalletId(null);
      }
    } catch (error: unknown) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete wallet");
    }
  }

  function openTransaction(wallet: Wallet, type: "Income" | "Expense") {
    setAddModalDefaultType(type);
    setAddModalDefaultWalletId(String(wallet.wallet_id));
    setAddModalOpen(true);
  }

  function openTransfer(walletId = "") {
    setTransferModalFromWalletId(walletId);
    setTransferModalOpen(true);
  }

  if (walletQuery.isLoading || transactionQuery.isLoading) {
    return <PageSkeleton variant="wallets" label="Loading wallets" />;
  }

  if (walletQuery.isError || transactionQuery.isError) {
    return (
      <section className="mx-auto mt-20 max-w-[576px] rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-900 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200">
          <span className="material-symbols-outlined">cloud_off</span>
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-slate-100">
          Wallet data is unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your saved data is safe. The account list will reconnect automatically.
        </p>
      </section>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-3 overflow-x-hidden pb-24 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Wallets</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">See where your money lives, review activity, and move funds between accounts.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="min-h-11" onClick={() => openTransfer()} disabled={activeWallets.length < 2}>
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">swap_horiz</span>Transfer
          </Button>
          <Button
            className="min-h-11"
            onClick={openCreate}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>Add wallet
          </Button>
        </div>
      </header>
      <section className="relative overflow-hidden rounded-xl border border-outline-variant bg-[#eff8f3] p-6 shadow-sm dark:bg-emerald-950/40 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-primary/5 blur-2xl" />
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,1fr)] lg:items-end">
          <div className="min-w-0">
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary dark:text-emerald-300">Portfolio balance</div>
            <p className="mt-3 text-4xl font-extrabold tracking-[-0.055em] text-primary dark:text-white sm:text-5xl">
              <WalletCountUp value={totalBalance} formatValue={formatCurrency} />
            </p>
            <p className="mt-3 text-sm font-medium text-on-surface-variant dark:text-slate-300">
              Across <WalletCountUp value={wallets.length} formatValue={(value) => String(Math.round(value))} /> {wallets.length === 1 ? "account" : "accounts"}
            </p>
          </div>
          <dl className="grid min-w-0 grid-cols-3 border-t border-[#c8e0d3] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 dark:border-emerald-800">
            {[
              { label: "Active funds", value: activeBalance, format: formatCurrency },
              { label: "Active", value: activeWallets.length, format: (value: number) => String(Math.round(value)) },
              { label: "Activity", value: transactions.length, format: (value: number) => String(Math.round(value)) },
            ].map((stat, index) => (
              <div key={stat.label} className={index ? "border-l border-[#c8e0d3] pl-5 dark:border-emerald-800" : ""}>
                <dt className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/70 dark:text-emerald-200/70">{stat.label}</dt>
                <dd className="mt-2 truncate text-base font-extrabold text-primary dark:text-white">
                  <WalletCountUp value={stat.value} formatValue={stat.format} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      {actionError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">{actionError}</div> : null}
      <section aria-labelledby="accounts-heading">
        <div className="mb-4 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 id="accounts-heading" className="text-xl font-extrabold tracking-tight text-on-background dark:text-slate-100">Accounts</h2>
            <p className="mt-1 text-sm text-on-surface-variant dark:text-slate-400">Select an account to manage it and review recent activity.</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 sm:w-[186px]">
              <span className="sr-only">Search wallets</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search accounts" className="h-11 md:h-10 bg-slate-50 pl-10 text-xs font-medium text-slate-600 shadow-none placeholder:text-slate-400 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800" />
            </label>
          <div className="grid h-11 md:h-10 min-w-0 grid-cols-3 rounded-xl border border-slate-300 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-800 sm:w-[272px]" aria-label="Wallet filters">
              {([["ALL", "All", wallets.length], ["ACTIVE", "Active", activeWallets.length], ["ARCHIVED", "Archived", archivedWallets.length]] as const).map(([value, label, count]) => (
                <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={"h-full min-h-0 whitespace-nowrap rounded-xl px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] motion-reduce:transform-none " + (filter === value ? "bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-emerald-200" : "text-slate-500 dark:text-slate-400")}>
                  {label} <span className="opacity-60">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="min-w-0">
            {visibleWallets.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleWallets.map((wallet) => {
                const selected = selectedWallet?.wallet_id === wallet.wallet_id;
                const activityCount = activityCounts.get(wallet.wallet_id) ?? 0;
                return (
                  <m.button
                    key={wallet.wallet_id}
                    type="button"
                    data-custom-interaction
                    aria-label={`${wallet.name}, ${formatCurrency(Number(wallet.calculated_balance))}, ${activityCount} ${activityCount === 1 ? "transaction" : "transactions"}`}
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedWalletId(wallet.wallet_id);
                      setDetailsOpen(true);
                    }}
                    layout={!reduceMotion}
                    animate={reduceMotion ? undefined : selected ? { y: -2, scale: 1.008 } : { y: 0, scale: 1 }}
                    whileHover={reduceMotion ? { opacity: 0.92 } : { y: -6, scale: 1.012, rotateX: 1.2, rotateY: -1.2 }}
                    whileTap={reduceMotion ? { opacity: 0.8 } : { scale: 0.975, y: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 24, mass: 0.72 }}
                    className={cn(
                      "group relative isolate w-full rounded-[1.7rem] p-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transform-none",
                      selected
                        ? "shadow-[0_12px_28px_rgba(12,74,52,0.13)]"
                        : "hover:bg-slate-100/80 dark:hover:bg-slate-800/70",
                    )}
                  >
                    {selected ? (
                      <m.span
                        layoutId={reduceMotion ? undefined : "selected-wallet-card"}
                        className="pointer-events-none absolute inset-0 -z-10 rounded-[1.7rem] bg-[#d9eee3] dark:bg-emerald-900/55"
                        transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.72 }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <WalletCardFace
                      name={wallet.name}
                      type={wallet.type}
                      walletId={wallet.wallet_id}
                      balance={Number(wallet.calculated_balance)}
                      status={wallet.status}
                      formatCurrency={formatCurrency}
                    />
                    <span className="flex items-center justify-between gap-3 px-3 pb-1 pt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>{activityCount} {activityCount === 1 ? "transaction" : "transactions"}</span>
                      <span className={cn("flex items-center gap-1 font-bold", selected ? "text-primary dark:text-emerald-300" : "text-slate-400") }>
                        View account
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
                      </span>
                    </span>
                  </m.button>
                );
              })}
            </div> : (
              <div className="flex min-h-[19rem] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900 sm:px-12">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#b8d7c9] bg-[#eff8f3] text-primary dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  <span className="material-symbols-outlined text-[28px]" aria-hidden="true">account_balance_wallet</span>
                </span>
                <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">{wallets.length ? "No matching accounts" : "Add your first wallet"}</h3>
                <p className="mt-2 max-w-[28rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {wallets.length ? "Try another search or switch the account filter." : "Start with the account you use most. Your dashboard will update as soon as it is created."}
                </p>
                <Button className="mt-6 min-h-11 px-5 !text-white shadow-sm" onClick={wallets.length ? () => { setSearch(""); setFilter("ALL"); } : openCreate}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">{wallets.length ? "filter_alt_off" : "add"}</span>{wallets.length ? "Clear filters" : "Add wallet"}</Button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Dialog open={detailsOpen && Boolean(selectedWallet)} onOpenChange={setDetailsOpen}>
        <DialogContent
          className="w-[calc(100%-1.5rem)] max-h-[90dvh] max-w-[720px] gap-0 overflow-y-auto p-0 md:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] dark:border-slate-800 dark:bg-slate-900"
          onInteractOutside={(event) => event.preventDefault()}
        >
          {selectedWallet ? (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedWallet.name} account details</DialogTitle>
                <DialogDescription>Balance, activity, and wallet controls.</DialogDescription>
              </DialogHeader>
              <div className="border-b border-slate-100 bg-slate-50/70 p-4 pt-12 dark:border-slate-800 dark:bg-slate-950/35 md:col-start-1 md:row-start-1 md:border-b-0 md:border-r">
                <WalletCardFace
                  name={selectedWallet.name}
                  type={selectedWallet.type}
                  walletId={selectedWallet.wallet_id}
                  balance={Number(selectedWallet.calculated_balance)}
                  status={selectedWallet.status}
                  formatCurrency={formatCurrency}
                  className="min-h-[12.5rem]"
                />
              </div>
              <dl className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 md:col-start-2 md:row-start-1 md:pt-12">
                {[["Starting balance", formatCurrency(Number(selectedWallet.initial_balance))], ["Share of funds", totalBalance > 0 ? ((Number(selectedWallet.calculated_balance) / totalBalance) * 100).toFixed(1) + "%" : "0.0%"], ["Money in", formatCurrency(selectedFlow.in)], ["Money out", formatCurrency(selectedFlow.out)]].map(([label, value], index) => (
                  <div key={label} className={"p-4 " + (index % 2 ? "border-l border-slate-100 dark:border-slate-800 " : "") + (index > 1 ? "border-t border-slate-100 dark:border-slate-800" : "")}><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 truncate text-sm font-extrabold tabular-nums text-slate-800 dark:text-slate-100">{value}</dd></div>
                ))}
              </dl>
              <div className="p-5 md:col-start-1 md:row-start-2 md:border-t md:border-slate-100 md:dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Quick actions</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { setDetailsOpen(false); openTransaction(selectedWallet, "Expense"); }} disabled={!isWalletActive(selectedWallet)} className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl bg-primary-fixed/50 px-2 text-xs font-bold text-primary hover:bg-primary-fixed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900">
                    <span className="material-symbols-outlined text-[22px]" aria-hidden="true">add_card</span>Add transaction
                  </button>
                  <button type="button" onClick={() => { setDetailsOpen(false); openTransfer(String(selectedWallet.wallet_id)); }} disabled={!isWalletActive(selectedWallet) || activeWallets.length < 2} className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-2 text-xs font-bold text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                    <span className="material-symbols-outlined text-[22px]" aria-hidden="true">swap_horiz</span>Transfer
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-100 p-5 dark:border-slate-800 md:col-start-2 md:row-start-2 md:border-l">
                <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Recent activity</p><span className="text-xs font-semibold text-slate-400">Latest {selectedTransactions.length}</span></div>
                {selectedTransactions.length ? (
                  <ul className="mt-3 space-y-1">
                    {selectedTransactions.map((transaction) => {
                      const amount = transactionAmountLabel(transaction, selectedWallet.wallet_id, formatCurrency);
                      return <li key={transaction.trans_id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70"><span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{transaction.description || transaction.type}</span><span className="mt-0.5 block text-[11px] text-slate-400">{transaction.type}, {formatDate(transaction.dateoftrans)}</span></span><span className={"shrink-0 text-xs font-extrabold tabular-nums " + amount.tone}>{amount.label}</span></li>;
                    })}
                  </ul>
                ) : <p className="mt-4 rounded-xl bg-slate-50 px-4 py-5 text-center text-xs leading-5 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">No activity yet. Add income or an expense to begin.</p>}
              </div>
              <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-800 md:col-span-2">
                <button type="button" onClick={() => { setDetailsOpen(false); openEdit(selectedWallet); }} className="min-h-12 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary dark:text-slate-300 dark:hover:bg-slate-800">Edit</button>
                <button type="button" onClick={() => toggleWalletStatus(selectedWallet)} disabled={updateWallet.isPending} className="min-h-12 border-x border-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">{isWalletActive(selectedWallet) ? "Archive" : "Restore"}</button>
                <button type="button" onClick={() => { setDetailsOpen(false); setDeleteError(""); setWalletToDelete(selectedWallet); }} className="min-h-12 text-xs font-bold text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 dark:text-rose-300 dark:hover:bg-rose-950">Delete</button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="max-w-[560px] overflow-hidden p-0 dark:border-slate-800 dark:bg-slate-900"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <form onSubmit={saveWallet} noValidate>
            <DialogHeader className="border-b border-slate-100 bg-slate-50 px-6 py-5 text-left dark:border-slate-800 dark:bg-slate-900">
              <DialogTitle className="text-xl font-extrabold text-slate-950 dark:text-white">{editingWallet ? "Edit wallet" : "Add wallet"}</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">{editingWallet ? "Update this account's name, type, or starting balance." : "Create an account to track its balance and activity."}</DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              {formError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">{formError}</div> : null}
              <WalletCardFace
                name={form.name || "Your wallet"}
                type={form.type}
                walletId={editingWallet?.wallet_id ?? 1}
                balance={Number(form.initial_balance || 0)}
                status={editingWallet?.status ?? "ACTIVE"}
                formatCurrency={formatCurrency}
                preview
                className="mx-auto max-w-[24rem]"
              />
              <div className="space-y-2">
                <Label htmlFor="wallet-provider">Account template</Label>
                <StyledSelect
                  id="wallet-provider"
                  value={form.provider}
                  searchable
                  searchPlaceholder="Search account templates..."
                  onChange={(value) => {
                    const preset = getWalletProviderPreset(value);
                    setForm((current) => ({
                      ...current,
                      provider: value,
                      ...(preset ? { type: preset.type } : {}),
                    }));
                  }}
                  options={WALLET_PROVIDER_OPTIONS}
                />
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Choose an original Centra template, then enter your own private wallet name below.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Wallet name</Label>
                <Input
                  id="wallet-name"
                  required
                  autoFocus
                  value={form.name}
                  onChange={(event) => {
                    const name = event.target.value;
                    setForm({ ...form, name });
                    if (fieldErrors.name) {
                      setFieldErrors((current) => ({
                        ...current,
                        name: name.trim() ? "" : "Enter a name for this wallet.",
                      }));
                    }
                  }}
                  placeholder="Everyday wallet or payroll account"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "wallet-name-error" : undefined}
                  className={cn(
                    "h-11 dark:bg-slate-950",
                    fieldErrors.name && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
                  )}
                />
                <FieldError id="wallet-name-error" message={fieldErrors.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-type">Account type</Label>
                <StyledSelect
                  id="wallet-type"
                  value={form.type}
                  onChange={(value) => setForm({ ...form, type: value })}
                  options={WALLET_TYPES.map((type) => ({ value: type, label: type }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-balance">Starting balance</Label>
                <div className="relative">
                  {showCurrencySymbol ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₱</span> : null}
                  <Input
                    id="wallet-balance"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.initial_balance}
                    onChange={(event) => {
                      const initialBalance = event.target.value;
                      setForm({ ...form, initial_balance: initialBalance });
                      if (fieldErrors.initialBalance) {
                        setFieldErrors((current) => ({
                          ...current,
                          initialBalance: validateInitialBalance(initialBalance),
                        }));
                      }
                    }}
                    placeholder="0.00"
                    aria-invalid={Boolean(fieldErrors.initialBalance)}
                    aria-describedby={fieldErrors.initialBalance ? "wallet-balance-error" : "wallet-balance-help"}
                    className={cn(
                      showCurrencySymbol ? "h-11 pl-8 dark:bg-slate-950" : "h-11 dark:bg-slate-950",
                      fieldErrors.initialBalance && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
                    )}
                  />
                </div>
                <FieldError id="wallet-balance-error" message={fieldErrors.initialBalance} />
                {!fieldErrors.initialBalance ? (
                  <p id="wallet-balance-help" className="text-xs leading-5 text-slate-500 dark:text-slate-400">Use the balance from when you began tracking this account.</p>
                ) : null}
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createWallet.isPending || updateWallet.isPending || !form.name.trim()}>
                {createWallet.isPending || updateWallet.isPending ? "Saving..." : editingWallet ? "Save changes" : "Add wallet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(walletToDelete)} onOpenChange={(open) => { if (!open) setWalletToDelete(null); }}>
        <DialogContent className="max-w-[440px] dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader className="text-left">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
              <span className="material-symbols-outlined" aria-hidden="true">delete</span>
            </div>
            <DialogTitle className="text-xl font-extrabold text-slate-950 dark:text-white">Delete wallet?</DialogTitle>
            <DialogDescription className="leading-6 text-slate-500 dark:text-slate-400">
              {walletToDelete ? walletToDelete.name + " will be permanently removed. Existing transactions are kept in your activity history." : ""}
            </DialogDescription>
          </DialogHeader>
          {deleteError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">{deleteError}</div> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setWalletToDelete(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteWallet.isPending}>
              {deleteWallet.isPending ? "Deleting..." : "Delete wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallets;
