import { useMemo, useState } from "react";
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

const WALLET_VISUALS: Record<string, { icon: string; surface: string }> = {
  "E-Wallet": {
    icon: "phone_iphone",
    surface: "bg-primary-fixed/55 text-primary dark:bg-emerald-900 dark:text-emerald-100",
  },
  "Bank Account": {
    icon: "account_balance",
    surface: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  Cash: {
    icon: "payments",
    surface: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  "Credit Card": {
    icon: "credit_card",
    surface: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  Investment: {
    icon: "monitoring",
    surface: "bg-primary-fixed/40 text-primary dark:bg-emerald-900 dark:text-emerald-100",
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

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

function transactionAmountLabel(transaction: Transaction, walletId: number) {
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

const Wallets = () => {
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
  const [formOpen, setFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [form, setForm] = useState({
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
    visibleWallets.find((wallet) => wallet.wallet_id === selectedWalletId) ??
    visibleWallets[0] ??
    null;
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
    setForm({ name: "", type: "E-Wallet", initial_balance: "" });
    setFormError("");
    setFieldErrors({});
    setFormOpen(true);
  }

  function openEdit(wallet: Wallet) {
    setEditingWallet(wallet);
    setForm({
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
    return (
      <div
        className="space-y-6 animate-pulse"
        aria-label="Loading wallets"
        aria-busy="true"
      >
        <div className="h-10 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
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
    <div className="min-h-screen space-y-7 pb-24 animate-fade-in">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary/70 dark:text-emerald-300">Money overview</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-on-background dark:text-slate-100 sm:text-4xl">Wallets</h1>
          <p className="mt-2 max-w-[36rem] text-sm leading-6 text-on-surface-variant dark:text-slate-300">See where your money lives, review activity, and move funds between accounts.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="min-h-11" onClick={() => openTransfer()} disabled={activeWallets.length < 2}>
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">swap_horiz</span>Transfer
          </Button>
          <Button className="min-h-11" onClick={openCreate}>
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>Add wallet
          </Button>
        </div>
      </header>
      <section className="relative overflow-hidden rounded-2xl border border-[#b8d7c9] bg-[#eff8f3] p-6 shadow-[0_12px_30px_rgba(0,53,39,0.06)] dark:border-emerald-900 dark:bg-emerald-950/40 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-primary/5 blur-2xl" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(28rem,1fr)] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-primary dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Portfolio balance
            </div>
            <p className="mt-3 text-4xl font-extrabold tracking-[-0.055em] text-primary dark:text-white sm:text-5xl">{formatCurrency(totalBalance)}</p>
            <p className="mt-3 text-sm font-medium text-on-surface-variant dark:text-slate-300">Across {wallets.length} {wallets.length === 1 ? "account" : "accounts"}</p>
          </div>
          <dl className="grid grid-cols-3 border-t border-[#c8e0d3] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 dark:border-emerald-800">
            {[["Active funds", formatCurrency(activeBalance)], ["Active", String(activeWallets.length)], ["Activity", String(transactions.length)]].map(([label, value], index) => (
              <div key={label} className={index ? "border-l border-[#c8e0d3] pl-5 dark:border-emerald-800" : ""}>
                <dt className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/70 dark:text-emerald-200/70">{label}</dt>
                <dd className="mt-2 truncate text-base font-extrabold text-primary dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      {actionError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">{actionError}</div> : null}
      <section aria-labelledby="accounts-heading">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 id="accounts-heading" className="text-xl font-extrabold tracking-tight text-on-background dark:text-slate-100">Accounts</h2>
            <p className="mt-1 text-sm text-on-surface-variant dark:text-slate-400">Select an account to manage it and review recent activity.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block sm:w-64">
              <span className="sr-only">Search wallets</span>
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400" aria-hidden="true">search</span>
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search accounts" className="h-11 bg-white pl-10 dark:bg-slate-900" />
            </label>
            <div className="grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800" aria-label="Wallet filters">
              {([["ALL", "All", wallets.length], ["ACTIVE", "Active", activeWallets.length], ["ARCHIVED", "Archived", archivedWallets.length]] as const).map(([value, label, count]) => (
                <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={"min-h-11 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] motion-reduce:transform-none " + (filter === value ? "bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-emerald-200" : "text-slate-500 dark:text-slate-400")}>
                  {label} <span className="opacity-60">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
            {visibleWallets.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleWallets.map((wallet) => {
                const selected = selectedWallet?.wallet_id === wallet.wallet_id;
                const visual = WALLET_VISUALS[wallet.type] ?? WALLET_VISUALS.Cash;
                const activityCount = activityCounts.get(wallet.wallet_id) ?? 0;
                return (
                  <button key={wallet.wallet_id} type="button" aria-pressed={selected} onClick={() => setSelectedWalletId(wallet.wallet_id)} className={"grid min-h-[88px] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary active:scale-[0.995] motion-reduce:transform-none sm:px-5 " + (selected ? "bg-primary-fixed/20 shadow-[inset_3px_0_0_#006b52] dark:bg-emerald-950/55" : "hover:bg-slate-50 dark:hover:bg-slate-800/60")}>
                    <span className={"flex h-12 w-12 items-center justify-center rounded-xl " + visual.surface}>
                      <span className="material-symbols-outlined text-[24px]" aria-hidden="true">{visual.icon}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-extrabold text-slate-950 dark:text-white">{wallet.name}</span>
                        {!isWalletActive(wallet) ? <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">Archived</span> : null}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">{wallet.type}, {activityCount} {activityCount === 1 ? "transaction" : "transactions"}</span>
                    </span>
                    <span className="flex items-center gap-2 text-right">
                      <span><span className="block text-sm font-extrabold tabular-nums text-slate-950 dark:text-white sm:text-base">{formatCurrency(Number(wallet.calculated_balance))}</span><span className="mt-1 hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">Balance</span></span>
                      <span className="material-symbols-outlined text-[20px] text-slate-300 dark:text-slate-600" aria-hidden="true">chevron_right</span>
                    </span>
                  </button>
                );
              })}
            </div> : (
              <div className="flex min-h-[19rem] flex-col items-center justify-center px-6 py-10 text-center sm:px-12">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#b8d7c9] bg-[#eff8f3] text-primary dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  <span className="material-symbols-outlined text-[28px]" aria-hidden="true">account_balance_wallet</span>
                </span>
                <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">{wallets.length ? "No matching accounts" : "Add your first wallet"}</h3>
                <p className="mt-2 max-w-[28rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {wallets.length ? "Try another search or switch the account filter." : "Start with the account you use most. Your dashboard will update as soon as it is created."}
                </p>
                <Button className="mt-6 min-h-11 px-5 shadow-sm" onClick={wallets.length ? () => { setSearch(""); setFilter("ALL"); } : openCreate}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">{wallets.length ? "filter_alt_off" : "add"}</span>{wallets.length ? "Clear filters" : "Add wallet"}</Button>
              </div>
            )}
          </div>
          <aside className="lg:sticky lg:top-24">
            {selectedWallet ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-5 dark:border-slate-800">
                  <div className="flex items-start gap-4">
                    <span className={"flex h-12 w-12 items-center justify-center rounded-xl " + (WALLET_VISUALS[selectedWallet.type] ?? WALLET_VISUALS.Cash).surface}>
                      <span className="material-symbols-outlined text-[24px]" aria-hidden="true">{(WALLET_VISUALS[selectedWallet.type] ?? WALLET_VISUALS.Cash).icon}</span>
                    </span>
                    <div className="min-w-0 flex-1"><p className="truncate text-lg font-extrabold text-slate-950 dark:text-white">{selectedWallet.name}</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{selectedWallet.type}</p></div>
                    <span className={"rounded-md px-2 py-1 text-[10px] font-bold uppercase " + (isWalletActive(selectedWallet) ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300")}>{isWalletActive(selectedWallet) ? "Active" : "Archived"}</span>
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Current balance</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">{formatCurrency(Number(selectedWallet.calculated_balance))}</p>
                </div>
                <dl className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
                  {[["Starting balance", formatCurrency(Number(selectedWallet.initial_balance))], ["Share of funds", totalBalance > 0 ? ((Number(selectedWallet.calculated_balance) / totalBalance) * 100).toFixed(1) + "%" : "0.0%"], ["Money in", formatCurrency(selectedFlow.in)], ["Money out", formatCurrency(selectedFlow.out)]].map(([label, value], index) => (
                    <div key={label} className={"p-4 " + (index % 2 ? "border-l border-slate-100 dark:border-slate-800 " : "") + (index > 1 ? "border-t border-slate-100 dark:border-slate-800" : "")}><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 truncate text-sm font-extrabold tabular-nums text-slate-800 dark:text-slate-100">{value}</dd></div>
                  ))}
                </dl>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Quick actions</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => openTransaction(selectedWallet, "Expense")} disabled={!isWalletActive(selectedWallet)} className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl bg-primary-fixed/50 px-2 text-xs font-bold text-primary hover:bg-primary-fixed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900">
                      <span className="material-symbols-outlined text-[22px]" aria-hidden="true">add_card</span>
                      Add transaction
                    </button>
                    <button type="button" onClick={() => openTransfer(String(selectedWallet.wallet_id))} disabled={!isWalletActive(selectedWallet) || activeWallets.length < 2} className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-2 text-xs font-bold text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                      <span className="material-symbols-outlined text-[22px]" aria-hidden="true">swap_horiz</span>
                      Transfer
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-100 p-5 dark:border-slate-800">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Recent activity</p><span className="text-xs font-semibold text-slate-400">Latest {selectedTransactions.length}</span></div>
                  {selectedTransactions.length ? (
                    <ul className="mt-3 space-y-1">
                      {selectedTransactions.map((transaction) => {
                        const amount = transactionAmountLabel(transaction, selectedWallet.wallet_id);
                        return (
                          <li key={transaction.trans_id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70">
                            <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{transaction.description || transaction.type}</span><span className="mt-0.5 block text-[11px] text-slate-400">{transaction.type}, {formatDate(transaction.dateoftrans)}</span></span>
                            <span className={"shrink-0 text-xs font-extrabold tabular-nums " + amount.tone}>{amount.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : <p className="mt-4 rounded-xl bg-slate-50 px-4 py-5 text-center text-xs leading-5 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">No activity yet. Add income or an expense to begin.</p>}
                </div>
                <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => openEdit(selectedWallet)} className="min-h-12 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary dark:text-slate-300 dark:hover:bg-slate-800">Edit</button>
                  <button type="button" onClick={() => toggleWalletStatus(selectedWallet)} disabled={updateWallet.isPending} className="min-h-12 border-x border-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">{isWalletActive(selectedWallet) ? "Archive" : "Restore"}</button>
                  <button type="button" onClick={() => { setDeleteError(""); setWalletToDelete(selectedWallet); }} className="min-h-12 text-xs font-bold text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 dark:text-rose-300 dark:hover:bg-rose-950">Delete</button>
                </div>
              </div>
            ) : <div className="rounded-2xl border border-dashed border-[#b8d7c9] bg-[#f6fbf8] p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f4ec] text-primary dark:bg-emerald-950 dark:text-emerald-200"><span className="material-symbols-outlined text-[24px]" aria-hidden="true">touch_app</span></span><p className="mt-4 text-sm font-extrabold text-slate-800 dark:text-slate-200">Select an account</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Account controls and recent activity will appear here.</p></div>}
          </aside>
        </div>
      </section>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-[480px] overflow-hidden p-0 dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={saveWallet} noValidate>
            <DialogHeader className="border-b border-slate-100 bg-slate-50 px-6 py-5 text-left dark:border-slate-800 dark:bg-slate-900">
              <DialogTitle className="text-xl font-extrabold text-slate-950 dark:text-white">{editingWallet ? "Edit wallet" : "Add wallet"}</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">{editingWallet ? "Update this account's name, type, or starting balance." : "Create an account to track its balance and activity."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 px-6 py-6">
              {formError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">{formError}</div> : null}
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
                  placeholder="Everyday account"
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₱</span>
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
                      "h-11 pl-8 dark:bg-slate-950",
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
