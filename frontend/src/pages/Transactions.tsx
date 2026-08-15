import { useMemo, useState } from "react";
import {
  useDeleteTransaction,
  useTransactions,
  useWallets,
} from "@/hooks/use-budget-data";
import { useUiStore } from "@/stores/ui-store";
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import { Button } from "@/components/ui/button";
import { StyledSelect } from "@/components/ui/styled-select";
import { PageSkeleton } from "@/components/PageSkeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ICON_MAP: Record<
  string,
  { icon: string; iconBg: string; iconColor: string }
> = {
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
  transport: {
    icon: "commute",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  grab: {
    icon: "commute",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  bill: { icon: "bolt", iconBg: "bg-amber-50", iconColor: "text-amber-700" },
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
  transfer: {
    icon: "sync_alt",
    iconBg: "bg-surface-container-low",
    iconColor: "text-on-surface-variant",
  },
  health: {
    icon: "fitness_center",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  game: {
    icon: "sports_esports",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  gas: {
    icon: "local_gas_station",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  coffee: {
    icon: "coffee",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
};

function getIconStyle(desc: string, type: string) {
  const lower = desc.toLowerCase();
  for (const [key, style] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return style;
  }
  if (type === "Income")
    return {
      icon: "payments",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
    };
  if (type === "Transfer")
    return {
      icon: "sync_alt",
      iconBg: "bg-surface-container-low",
      iconColor: "text-on-surface-variant",
    };
  return {
    icon: "receipt_long",
    iconBg: "bg-surface-container-low",
    iconColor: "text-on-surface-variant",
  };
}

const ITEMS_PER_PAGE = 10;

const Transactions = () => {
  const formatCurrency = useCurrencyFormatter();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: wallets = [], isLoading: walletsLoading } = useWallets();

  const deleteTx = useDeleteTransaction();

  const search = useUiStore((s) => s.txSearch);
  const typeFilter = useUiStore((s) => s.txTypeFilter);
  const walletFilter = useUiStore((s) => s.txWalletFilter);
  const page = useUiStore((s) => s.txPage);
  const setSearch = useUiStore((s) => s.setTxSearch);
  const setTypeFilter = useUiStore((s) => s.setTxTypeFilter);
  const setWalletFilter = useUiStore((s) => s.setTxWalletFilter);
  const setPage = useUiStore((s) => s.setTxPage);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filtering
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (
        search &&
        !tx.description.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (typeFilter !== "All Types" && tx.type !== typeFilter) return false;
      if (walletFilter !== "All Wallets" && tx.wallet_type !== walletFilter)
        return false;
      return true;
    });
  }, [transactions, search, typeFilter, walletFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteTx.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  if (transactionsLoading || walletsLoading) {
    return <PageSkeleton variant="transactions" label="Loading transactions" />;
  }

  return (
    <div className="min-h-screen space-y-3 pb-20 animate-fade-in">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Transactions</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage and monitor your financial activity across all accounts.
          </p>
        </div>
      </header>

      {/* FILTERS */}
      <section className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_186px_186px] md:items-center">
        <div className="relative min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant/70">
            search
          </span>
          <input
            className="h-11 md:h-10 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 pl-10 text-sm font-semibold text-on-surface shadow-none transition-colors placeholder:text-on-surface-variant/70 hover:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Search transactions..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <StyledSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={["All Types", "Expense", "Income", "Transfer"].map((option) => ({ value: option, label: option }))}
          className="w-full min-w-0 h-11 md:h-10 rounded-xl bg-surface-container-low text-sm font-semibold text-on-surface shadow-none hover:bg-surface-container-lowest"
          aria-label="Transaction type filter"
        />
        <StyledSelect
          value={walletFilter}
          onChange={setWalletFilter}
          options={[{ value: "All Wallets", label: "All Wallets" }, ...wallets.map((w) => ({ value: w.name, label: w.name }))]}
          className="w-full min-w-0 h-11 md:h-10 rounded-xl bg-surface-container-low text-sm font-semibold text-on-surface shadow-none hover:bg-surface-container-lowest"
          aria-label="Wallet filter"
        />
      </section>

      {/* DATA TABLE */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                  Date
                </th>
                <th className="px-6 py-4 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                  Description
                </th>
                <th className="px-6 py-4 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                  Wallet
                </th>
                <th className="px-6 py-4 text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                  Type
                </th>
                <th className="px-6 py-4 text-right font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                  Amount
                </th>
                <th className="px-6 py-4 text-center font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-on-surface-variant"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => {
                  const style = getIconStyle(tx.description, tx.type);
                  const amt = Number(tx.amount);
                  return (
                    <tr
                      key={tx.trans_id}
                      className="hover:bg-surface-container-low/70 transition-colors group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <p className="text-body-sm font-bold text-on-surface">
                          {formatDate(tx.dateoftrans)}
                        </p>
                        <p className="text-[11px] font-medium text-on-surface-variant/70 mt-0.5">
                          {formatTime(tx.dateoftrans)}
                        </p>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${style.iconBg} ${style.iconColor} flex items-center justify-center`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {style.icon}
                            </span>
                          </div>
                          <div className="font-bold text-on-surface">
                            {tx.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-body-sm text-on-surface-variant font-bold whitespace-nowrap">
                        {tx.wallet_type}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] font-bold border ${
                            tx.type === "Income"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : tx.type === "Transfer"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-5 text-right font-bold whitespace-nowrap ${
                          tx.type === "Income"
                            ? "text-emerald-600"
                            : tx.type === "Transfer"
                              ? "text-blue-600"
                              : "text-error"
                        }`}
                      >
                        {tx.type === "Income"
                          ? "+"
                          : tx.type === "Expense"
                            ? "-"
                            : ""}
                        {formatCurrency(amt)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => setDeleteId(tx.trans_id)}
                          className="p-1.5 text-on-surface-variant/45 hover:text-error rounded-lg hover:bg-rose-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-6 py-6 border-t border-outline-variant flex items-center justify-between">
            <p className="text-body-sm text-on-surface-variant font-medium">
              Showing{" "}
              <span className="text-on-surface font-bold">
                {(page - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="text-on-surface font-bold">
                {filtered.length}
              </span>{" "}
              transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-outline-variant rounded-xl text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm cursor-pointer ${p === page ? "bg-primary text-on-primary" : "hover:bg-surface-container-high text-on-surface-variant"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-outline-variant rounded-xl text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent className="max-w-[384px] text-center" showCloseButton={false}>
          <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-error text-[32px]">
              delete
            </span>
          </div>
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={handleDelete}
              disabled={deleteTx.isPending}
            >
              {deleteTx.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
