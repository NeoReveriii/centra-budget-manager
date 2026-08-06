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

type WalletFilter = "ALL" | "ACTIVE" | "ARCHIVED";

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
    surface: "bg-[#dff3e9] text-[#064e3b]",
  },
  "Bank Account": {
    icon: "account_balance",
    surface: "bg-[#e5ebf4] text-[#1f2f43]",
  },
  Cash: {
    icon: "payments",
    surface: "bg-[#f3ecd9] text-[#6b5524]",
  },
  "Credit Card": {
    icon: "credit_card",
    surface: "bg-[#f0e7e2] text-[#6c4235]",
  },
  Investment: {
    icon: "monitoring",
    surface: "bg-[#e2eee9] text-[#214c3d]",
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
    return { label: `+${amount}`, tone: "text-emerald-700" };
  }
  if (transaction.type === "Expense") {
    return { label: `-${amount}`, tone: "text-rose-700" };
  }
  if (transaction.transfer_to_wallet_id === walletId) {
    return { label: `+${amount}`, tone: "text-emerald-700" };
  }
  return { label: `-${amount}`, tone: "text-slate-700" };
}

const Wallets = () => {
  const walletQuery = useWallets();
  const transactionQuery = useTransactions();
  const wallets = walletQuery.data ?? [];
  const transactions = transactionQuery.data ?? [];

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
  const [formOpen, setFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [detailWalletId, setDetailWalletId] = useState<number | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "E-Wallet",
    initial_balance: "",
  });
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const activeWallets = wallets.filter(
    (wallet) => String(wallet.status).toUpperCase() === "ACTIVE",
  );
  const archivedWallets = wallets.filter(
    (wallet) => String(wallet.status).toUpperCase() === "ARCHIVED",
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
        filter === "ALL" || String(wallet.status).toUpperCase() === filter;
      const matchesSearch =
        !term ||
        wallet.name.toLowerCase().includes(term) ||
        wallet.type.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, wallets]);

  const detailWallet =
    wallets.find((wallet) => wallet.wallet_id === detailWalletId) ?? null;
  const detailTransactions = detailWallet
    ? transactions
        .filter((transaction) =>
          walletHasTransaction(transaction, detailWallet.wallet_id),
        )
        .slice(0, 6)
    : [];

  const syncing = walletQuery.isFetching || transactionQuery.isFetching;
  const updatedAt = Math.max(
    walletQuery.dataUpdatedAt || 0,
    transactionQuery.dataUpdatedAt || 0,
  );

  function openCreate() {
    setEditingWallet(null);
    setForm({ name: "", type: "E-Wallet", initial_balance: "" });
    setFormError("");
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
    setFormOpen(true);
  }

  async function saveWallet(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const initialBalance = Number(form.initial_balance || 0);
    if (!Number.isFinite(initialBalance) || initialBalance < 0) {
      setFormError("Starting balance must be zero or greater");
      return;
    }

    try {
      if (editingWallet) {
        await updateWallet.mutateAsync({
          wallet_id: editingWallet.wallet_id,
          name: form.name.trim(),
          type: form.type,
          status:
            String(editingWallet.status).toUpperCase() === "ARCHIVED"
              ? "ARCHIVED"
              : "ACTIVE",
          initial_balance: initialBalance,
        });
      } else {
        await createWallet.mutateAsync({
          name: form.name.trim(),
          type: form.type,
          initial_balance: initialBalance,
        });
      }
      setFormOpen(false);
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : "Could not save wallet");
    }
  }

  async function toggleWalletStatus(wallet: Wallet) {
    setActionError("");
    const nextStatus =
      String(wallet.status).toUpperCase() === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    try {
      await updateWallet.mutateAsync({
        wallet_id: wallet.wallet_id,
        name: wallet.name,
        type: wallet.type,
        status: nextStatus,
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
      if (detailWalletId === walletToDelete.wallet_id) setDetailWalletId(null);
    } catch (error: unknown) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete wallet");
    }
  }

  function openTransaction(wallet: Wallet, type: "Income" | "Expense" = "Expense") {
    setAddModalDefaultType(type);
    setAddModalDefaultWalletId(String(wallet.wallet_id));
    setAddModalOpen(true);
  }

  function openTransfer(walletId = "") {
    setTransferModalFromWalletId(walletId);
    setTransferModalOpen(true);
  }

  async function refreshData() {
    await Promise.all([walletQuery.refetch(), transactionQuery.refetch()]);
  }

  if (walletQuery.isLoading || transactionQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading wallets">
        <div className="h-10 w-56 rounded-lg bg-slate-200" />
        <div className="h-52 rounded-2xl bg-slate-200" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-64 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (walletQuery.isError || transactionQuery.isError) {
    return (
      <section className="mx-auto mt-20 max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
          <span className="material-symbols-outlined">cloud_off</span>
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900">Wallet data is unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">
          Check your connection, then try syncing again.
        </p>
        <Button className="mt-6 rounded-xl" onClick={refreshData}>
          Try again
        </Button>
      </section>
    );
  }

  return (
    <div className="min-h-screen space-y-7 pb-24 animate-fade-in">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-secondary">
            <span
              className={`h-2 w-2 rounded-full ${syncing ? "animate-pulse bg-amber-500" : "bg-emerald-500"}`}
            />
            {syncing
              ? "SYNCING"
              : updatedAt
                ? `LIVE · ${new Date(updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "LIVE"}
          </div>
          <h1 className="text-h1 font-h1 text-on-background">Wallets</h1>
          <p className="mt-1 max-w-2xl text-body-sm text-slate-500">
            Keep every account in one place, move money safely, and see each balance update as activity lands.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-slate-200 bg-white"
            onClick={refreshData}
            disabled={syncing}
          >
            <span className={`material-symbols-outlined text-[18px] ${syncing ? "animate-spin" : ""}`}>
              sync
            </span>
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-slate-200 bg-white"
            onClick={() => openTransfer()}
            disabled={activeWallets.length < 2}
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            Transfer
          </Button>
          <Button type="button" className="rounded-xl" onClick={openCreate}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add wallet
          </Button>
        </div>
      </header>

      {actionError ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError("")} aria-label="Dismiss error">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ) : null}

      <section className="grid overflow-hidden rounded-2xl bg-[#073c2e] text-white shadow-[0_22px_60px_rgba(0,53,39,0.18)] lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative overflow-hidden p-7 sm:p-9">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[48px] border-white/[0.05]" />
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-100/70">
            TOTAL AVAILABLE
          </p>
          <p className="mt-3 text-4xl font-extrabold tracking-[-0.04em] tabular-nums sm:text-5xl">
            {formatCurrency(totalBalance)}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-6 text-emerald-50/70">
            {formatCurrency(activeBalance)} is held across {activeWallets.length} active {activeWallets.length === 1 ? "wallet" : "wallets"}.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => activeWallets[0] && openTransaction(activeWallets[0], "Income")}
              disabled={activeWallets.length === 0}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#073c2e] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Record income
            </button>
            <button
              type="button"
              onClick={() => activeWallets[0] && openTransaction(activeWallets[0], "Expense")}
              disabled={activeWallets.length === 0}
              className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Record expense
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-white/10 bg-black/10 lg:grid-cols-1 lg:border-l lg:border-t-0">
          {[
            { label: "Active", value: activeWallets.length, icon: "verified" },
            { label: "Archived", value: archivedWallets.length, icon: "archive" },
            { label: "Activity", value: transactions.length, icon: "receipt_long" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col justify-center border-r border-white/10 p-5 last:border-r-0 lg:border-b lg:border-r-0 lg:last:border-b-0"
            >
              <span className="material-symbols-outlined text-[20px] text-emerald-200/70">
                {metric.icon}
              </span>
              <span className="mt-2 text-2xl font-bold tabular-nums">{metric.value}</span>
              <span className="text-xs font-semibold text-emerald-50/60">{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {(["ALL", "ACTIVE", "ARCHIVED"] as WalletFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  filter === option
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {option === "ALL"
                  ? `All ${wallets.length}`
                  : option === "ACTIVE"
                    ? `Active ${activeWallets.length}`
                    : `Archived ${archivedWallets.length}`}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
              search
            </span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-white pl-10"
              placeholder="Find a wallet"
            />
          </div>
        </div>

        {visibleWallets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
              <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900">
              {wallets.length === 0 ? "Add your first wallet" : "No wallets match"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {wallets.length === 0
                ? "Start with the account you use most. Your dashboard will update as soon as it is created."
                : "Try another name or switch the status filter."}
            </p>
            {wallets.length === 0 ? (
              <Button className="mt-6 rounded-xl" onClick={openCreate}>
                Add wallet
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {visibleWallets.map((wallet) => {
              const visual = WALLET_VISUALS[wallet.type] ?? WALLET_VISUALS["E-Wallet"];
              const isActive = String(wallet.status).toUpperCase() === "ACTIVE";
              const activityCount = activityCounts.get(wallet.wallet_id) ?? 0;
              return (
                <article
                  key={wallet.wallet_id}
                  className={`group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${
                    isActive ? "border-slate-200" : "border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${visual.surface}`}>
                        <span className="material-symbols-outlined">{visual.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">
                          {wallet.name}
                        </h2>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{wallet.type}</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold tracking-[0.12em] ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isActive ? "ACTIVE" : "ARCHIVED"}
                    </span>
                  </div>

                  <div className="mt-8">
                    <p className="text-[11px] font-bold tracking-[0.16em] text-slate-400">
                      CURRENT BALANCE
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-primary tabular-nums">
                      {formatCurrency(Number(wallet.calculated_balance || 0))}
                    </p>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">STARTED WITH</p>
                      <p className="mt-1 text-sm font-bold text-slate-700 tabular-nums">
                        {formatCurrency(Number(wallet.initial_balance || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">ACTIVITY</p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {activityCount} {activityCount === 1 ? "entry" : "entries"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openTransaction(wallet)}
                        disabled={!isActive}
                        className="rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Add activity
                      </button>
                      <button
                        type="button"
                        onClick={() => openTransfer(String(wallet.wallet_id))}
                        disabled={!isActive || activeWallets.length < 2}
                        className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Transfer
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailWalletId(wallet.wallet_id)}
                      className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Details
                      <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-[480px] overflow-hidden p-0" showCloseButton={false}>
          <DialogHeader className="border-b border-slate-100 bg-slate-50/70 p-6 text-left">
            <DialogTitle>{editingWallet ? "Edit wallet" : "Add wallet"}</DialogTitle>
            <DialogDescription>
              {editingWallet
                ? "Update the wallet name, type, or starting balance."
                : "Connect another place where you keep or spend money."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveWallet} className="space-y-5 p-6">
            {formError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
                {formError}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Wallet name</Label>
              <Input
                id="wallet-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g. BPI Payroll"
                className="h-11 rounded-xl border-slate-200 bg-slate-50"
                maxLength={80}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-type">Account type</Label>
              <select
                id="wallet-type"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
              >
                {WALLET_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-balance">Starting balance</Label>
              <Input
                id="wallet-balance"
                type="number"
                min="0"
                step="0.01"
                value={form.initial_balance}
                onChange={(event) =>
                  setForm({ ...form, initial_balance: event.target.value })
                }
                placeholder="0.00"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 tabular-nums"
              />
              {editingWallet ? (
                <p className="text-xs leading-5 text-slate-500">
                  Changing this adjusts the current balance without altering transaction history.
                </p>
              ) : null}
            </div>
            <DialogFooter className="gap-3 pt-2 sm:justify-stretch">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl"
                disabled={createWallet.isPending || updateWallet.isPending}
              >
                {createWallet.isPending || updateWallet.isPending
                  ? "Saving..."
                  : editingWallet
                    ? "Save changes"
                    : "Create wallet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailWallet !== null}
        onOpenChange={(open) => !open && setDetailWalletId(null)}
      >
        <DialogContent className="max-w-[620px] overflow-hidden p-0">
          {detailWallet ? (
            <>
              <div className="bg-[#073c2e] p-7 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-emerald-100/60">
                      {detailWallet.type.toUpperCase()}
                    </p>
                    <DialogTitle className="mt-2 text-2xl text-white">
                      {detailWallet.name}
                    </DialogTitle>
                  </div>
                  <span className="rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em]">
                    {String(detailWallet.status).toUpperCase()}
                  </span>
                </div>
                <p className="mt-8 text-4xl font-extrabold tracking-[-0.04em] tabular-nums">
                  {formatCurrency(Number(detailWallet.calculated_balance || 0))}
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-50/60">Current balance</p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">STARTING</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 tabular-nums">
                      {formatCurrency(Number(detailWallet.initial_balance || 0))}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">ACTIVITY</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {activityCounts.get(detailWallet.wallet_id) ?? 0} entries
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold tracking-[0.12em] text-slate-400">CREATED</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatDate(detailWallet.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-lg"
                    onClick={() => {
                      setDetailWalletId(null);
                      openEdit(detailWallet);
                    }}
                  >
                    <span className="material-symbols-outlined text-[17px]">edit</span>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => toggleWalletStatus(detailWallet)}
                    disabled={updateWallet.isPending}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {String(detailWallet.status).toUpperCase() === "ACTIVE"
                        ? "archive"
                        : "unarchive"}
                    </span>
                    {String(detailWallet.status).toUpperCase() === "ACTIVE"
                      ? "Archive"
                      : "Restore"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      setDeleteError("");
                      setDetailWalletId(null);
                      setWalletToDelete(detailWallet);
                    }}
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                    Delete
                  </Button>
                </div>

                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Recent activity</h3>
                    <span className="text-xs font-semibold text-slate-400">Latest six</span>
                  </div>
                  {detailTransactions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                      No activity in this wallet yet
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                      {detailTransactions.map((transaction) => {
                        const amount = transactionAmountLabel(
                          transaction,
                          detailWallet.wallet_id,
                        );
                        return (
                          <div
                            key={transaction.trans_id}
                            className="flex items-center justify-between gap-4 p-3.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-800">
                                {transaction.description}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                {formatDate(transaction.dateoftrans)} · {transaction.type}
                              </p>
                            </div>
                            <span className={`shrink-0 text-sm font-bold tabular-nums ${amount.tone}`}>
                              {amount.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={walletToDelete !== null}
        onOpenChange={(open) => !open && setWalletToDelete(null)}
      >
        <DialogContent className="max-w-[420px]" showCloseButton={false}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <span className="material-symbols-outlined text-[28px]">delete</span>
          </div>
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle>Delete {walletToDelete?.name}?</DialogTitle>
            <DialogDescription>
              Wallets with activity cannot be deleted. Archive the wallet if you need to keep its history.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
              {deleteError}
            </div>
          ) : null}
          <DialogFooter className="gap-3 sm:justify-stretch">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setWalletToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={confirmDelete}
              disabled={deleteWallet.isPending}
            >
              {deleteWallet.isPending ? "Deleting..." : "Delete wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallets;
