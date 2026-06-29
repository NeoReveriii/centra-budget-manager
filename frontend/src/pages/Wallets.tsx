import { useState } from "react";
import {
  useCreateWallet,
  useDeleteWallet,
  useTransferFunds,
  useWallets,
} from "@/hooks/use-budget-data";

function formatCurrency(amount: number): string {
  return (
    "₱" +
    amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const WALLET_ICONS: Record<
  string,
  { iconBg: string; color: string; icon: string }
> = {
  gcash: {
    iconBg: "bg-[#007DFE]",
    color: "text-white",
    icon: "account_balance",
  },
  maya: { iconBg: "bg-black", color: "text-emerald-400", icon: "wallet" },
  bpi: { iconBg: "bg-[#B71C1C]", color: "text-white", icon: "account_balance" },
  bdo: { iconBg: "bg-[#003399]", color: "text-white", icon: "account_balance" },
  security: { iconBg: "bg-[#0D47A1]", color: "text-white", icon: "savings" },
  cash: { iconBg: "bg-emerald-700", color: "text-white", icon: "payments" },
  savings: { iconBg: "bg-primary", color: "text-white", icon: "savings" },
};

function getWalletStyle(name: string) {
  const lower = name.toLowerCase();
  for (const [key, style] of Object.entries(WALLET_ICONS)) {
    if (lower.includes(key)) return style;
  }
  return {
    iconBg: "bg-slate-700",
    color: "text-white",
    icon: "account_balance_wallet",
  };
}

const Wallets = () => {
  const { data: wallets = [], isLoading: loading } = useWallets();
  const createWalletMutation = useCreateWallet();
  const deleteWalletMutation = useDeleteWallet();
  const transferMutation = useTransferFunds();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: "",
    type: "E-Wallet",
    initial_balance: "",
  });
  const [addError, setAddError] = useState("");

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transfer, setTransfer] = useState({
    from_wallet_id: "",
    to_wallet_id: "",
    amount: "",
  });
  const [transferError, setTransferError] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Computed
  const totalBalance = wallets.reduce(
    (sum, w) => sum + Number(w.calculated_balance || 0),
    0,
  );
  const activeWallets = wallets.filter((w) => w.status === "ACTIVE");

  async function handleAddWallet(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    try {
      await createWalletMutation.mutateAsync({
        name: newWallet.name,
        type: newWallet.type,
        initial_balance: Number(newWallet.initial_balance) || 0,
      });
      setShowAddModal(false);
      setNewWallet({ name: "", type: "E-Wallet", initial_balance: "" });
    } catch (err: unknown) {
      setAddError(
        err instanceof Error ? err.message : "Failed to create wallet",
      );
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTransferError("");
    try {
      await transferMutation.mutateAsync({
        from_wallet_id: Number(transfer.from_wallet_id),
        to_wallet_id: Number(transfer.to_wallet_id),
        amount: Number(transfer.amount),
      });
      setShowTransferModal(false);
      setTransfer({ from_wallet_id: "", to_wallet_id: "", amount: "" });
    } catch (err: unknown) {
      setTransferError(err instanceof Error ? err.message : "Transfer failed");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteError("");
    try {
      await deleteWalletMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined animate-spin text-primary text-[48px]">
            progress_activity
          </span>
          <p className="text-slate-500 font-medium">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 space-y-8 animate-fade-in">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-h1 font-h1 text-on-surface">My Wallets</h2>
          <p className="text-body-sm text-slate-500 mt-1">
            Total Balance:{" "}
            <span className="font-bold text-emerald-900">
              {formatCurrency(totalBalance)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 border border-outline-variant text-primary px-6 py-3 rounded-xl font-bold text-body-sm hover:bg-slate-50 hover:opacity-80 active:scale-[0.98] transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">sync_alt</span>
            Transfer
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-body-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Add Wallet
          </button>
        </div>
      </header>

      {/* WALLET INSIGHTS */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 bg-white border border-outline-variant rounded-xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-h3 font-h3 text-on-surface">
                Wallet Overview
              </h3>
              <p className="text-body-sm text-slate-500">
                Balance distribution across your accounts.
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">
                check_circle
              </span>
              {activeWallets.length} Active
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Wallets
              </p>
              <p className="text-2xl font-bold text-slate-700">
                {wallets.length}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Avg. per Wallet
              </p>
              <p className="text-2xl font-bold text-slate-700">
                {wallets.length > 0
                  ? formatCurrency(totalBalance / wallets.length)
                  : "₱0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WALLET CARDS */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-h2 font-h2 text-on-surface">
            Connected Accounts
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallets.map((wallet) => {
            const style = getWalletStyle(wallet.name);
            const balance = Number(wallet.calculated_balance || 0);
            return (
              <div
                key={wallet.wallet_id}
                className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col hover:border-emerald-200 transition-all shadow-sm hover:shadow-md group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center shadow-sm`}
                  >
                    <span
                      className={`material-symbols-outlined ${style.color}`}
                    >
                      {style.icon}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteId(wallet.wallet_id)}
                    className="text-slate-300 hover:text-error active:scale-[0.98] transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      delete
                    </span>
                  </button>
                </div>
                <h4 className="font-bold text-on-surface text-lg">
                  {wallet.name}
                </h4>
                <p className="text-[12px] text-slate-500 font-medium">
                  {wallet.type} · {wallet.status}
                </p>

                <div className="mt-10 mb-6">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 font-numeric-data tracking-tight">
                    {formatCurrency(balance)}
                  </p>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                  <button
                    onClick={() => {
                      setTransfer({
                        ...transfer,
                        from_wallet_id: String(wallet.wallet_id),
                      });
                      setShowTransferModal(true);
                    }}
                    className="py-2.5 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Transfer
                  </button>
                  <button className="py-2.5 text-[12px] font-bold text-emerald-900 hover:underline active:scale-[0.98] transition-all cursor-pointer">
                    Details
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Wallet Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-emerald-50/30 active:scale-[0.98] transition-all cursor-pointer min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400">
                add
              </span>
            </div>
            <span className="text-body-sm font-bold text-slate-500">
              Add New Wallet
            </span>
          </button>
        </div>
      </section>

      {/* ADD WALLET MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[448px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-h3 text-h3 text-primary">Add Wallet</h3>
            </div>
            <form onSubmit={handleAddWallet} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-error-container/20 border border-error/20 rounded-xl text-error text-body-sm font-medium">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-label-caps font-label-caps text-slate-500 uppercase mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={newWallet.name}
                  onChange={(e) =>
                    setNewWallet({ ...newWallet, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. GCash, BPI Savings"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps font-label-caps text-slate-500 uppercase mb-2">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={newWallet.type}
                      onChange={(e) =>
                        setNewWallet({ ...newWallet, type: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-outline-variant rounded-xl text-body-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none pr-10"
                    >
                      <option>E-Wallet</option>
                      <option>Bank Account</option>
                      <option>Cash</option>
                      <option>Credit Card</option>
                      <option>Investment</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-label-caps font-label-caps text-slate-500 uppercase mb-2">
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newWallet.initial_balance}
                    onChange={(e) =>
                      setNewWallet({
                        ...newWallet,
                        initial_balance: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary/20 outline-none [appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-outline-variant rounded-xl font-bold text-body-sm text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWalletMutation.isPending}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-body-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createWalletMutation.isPending
                    ? "Creating..."
                    : "Create Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div
          className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[448px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-h3 text-h3 text-primary">Transfer Funds</h3>
            </div>
            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              {transferError && (
                <div className="p-3 bg-error-container/20 border border-error/20 rounded-xl text-error text-body-sm font-medium">
                  {transferError}
                </div>
              )}
              <div>
                <label className="block text-label-caps font-label-caps text-slate-500 uppercase mb-2">
                  From Wallet
                </label>
                <select
                  value={transfer.from_wallet_id}
                  onChange={(e) =>
                    setTransfer({ ...transfer, from_wallet_id: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-outline-variant rounded-xl text-body-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  required
                >
                  <option value="">Select source wallet</option>
                  {wallets.map((w) => (
                    <option key={w.wallet_id} value={w.wallet_id}>
                      {w.name} — {formatCurrency(Number(w.calculated_balance))}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-slate-500 uppercase mb-2">
                  To Wallet
                </label>
                <select
                  value={transfer.to_wallet_id}
                  onChange={(e) =>
                    setTransfer({ ...transfer, to_wallet_id: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-outline-variant rounded-xl text-body-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  required
                >
                  <option value="">Select destination wallet</option>
                  {wallets
                    .filter(
                      (w) => String(w.wallet_id) !== transfer.from_wallet_id,
                    )
                    .map((w) => (
                      <option key={w.wallet_id} value={w.wallet_id}>
                        {w.name} —{" "}
                        {formatCurrency(Number(w.calculated_balance))}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-label-caps font-label-caps text-slate-500 uppercase mb-2">
                  Amount (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transfer.amount}
                  onChange={(e) =>
                    setTransfer({ ...transfer, amount: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-3 border border-outline-variant rounded-xl font-bold text-body-sm text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferMutation.isPending}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-body-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {transferMutation.isPending ? "Transferring..." : "Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div
          className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4"
          onClick={() => {
            setDeleteId(null);
            setDeleteError("");
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[384px] shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error text-[32px]">
                delete
              </span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-2">
              Delete Wallet?
            </h3>
            <p className="text-body-sm text-slate-500 mb-4">
              This cannot be undone. Wallets with transactions cannot be
              deleted.
            </p>
            {deleteError && (
              <div className="p-3 mb-4 bg-error-container/20 border border-error/20 rounded-xl text-error text-body-sm font-medium">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteId(null);
                  setDeleteError("");
                }}
                className="flex-1 py-3 border border-outline-variant rounded-xl font-bold text-body-sm text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteWalletMutation.isPending}
                className="flex-1 py-3 bg-error text-white rounded-xl font-bold text-body-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {deleteWalletMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
