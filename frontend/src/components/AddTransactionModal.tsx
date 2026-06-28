import { useEffect, useState } from "react";
import { useCreateTransaction, useWallets } from "@/hooks/use-budget-data";
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

const TRANSACTION_CATEGORIES = {
  Expense: [
    { key: "food", label: "Food", icon: "restaurant", accent: "bg-orange-50 text-orange-600 border-orange-100" },
    { key: "transport", label: "Transport", icon: "commute", accent: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { key: "travel", label: "Travel", icon: "flight_takeoff", accent: "bg-sky-50 text-sky-600 border-sky-100" },
    { key: "shopping", label: "Shopping", icon: "shopping_bag", accent: "bg-purple-50 text-purple-600 border-purple-100" },
    { key: "bills", label: "Bills", icon: "receipt_long", accent: "bg-slate-50 text-slate-600 border-slate-200" },
    { key: "health", label: "Health", icon: "health_and_safety", accent: "bg-rose-50 text-rose-600 border-rose-100" },
  ],
  Income: [
    { key: "salary", label: "Salary", icon: "payments", accent: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { key: "bonus", label: "Bonus", icon: "redeem", accent: "bg-amber-50 text-amber-700 border-amber-100" },
    { key: "freelance", label: "Freelance", icon: "work", accent: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { key: "refund", label: "Refund", icon: "reply_all", accent: "bg-cyan-50 text-cyan-700 border-cyan-100" },
    { key: "savings", label: "Savings", icon: "savings", accent: "bg-teal-50 text-teal-700 border-teal-100" },
    { key: "other_income", label: "Other", icon: "account_balance", accent: "bg-slate-50 text-slate-600 border-slate-200" },
  ],
} as const;

const TYPE_OPTIONS = ["Expense", "Income"] as const;

type TxType = (typeof TYPE_OPTIONS)[number];

type CategoryOption = (typeof TRANSACTION_CATEGORIES)[keyof typeof TRANSACTION_CATEGORIES][number];

function defaultCategoryForType(type: TxType): string {
  if (type === "Income") return TRANSACTION_CATEGORIES.Income[0].key;
  return TRANSACTION_CATEGORIES.Expense[0].key;
}

function getCategoryOptions(type: TxType): readonly CategoryOption[] {
  return TRANSACTION_CATEGORIES[type];
}

export function AddTransactionModal() {
  const open = useUiStore((s) => s.addModalOpen);
  const setOpen = useUiStore((s) => s.setAddModalOpen);
  const defaultType = useUiStore((s) => s.addModalDefaultType);

  const { data: wallets = [] } = useWallets();
  const createTx = useCreateTransaction();

  const [newTx, setNewTx] = useState({
    description: "",
    type: "Expense" as TxType,
    wallet_id: "",
    amount: "",
    category: defaultCategoryForType("Expense" as TxType),
  });
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (!open) return;
    const normalizedType = TYPE_OPTIONS.includes(defaultType as TxType)
      ? (defaultType as TxType)
      : "Expense";

    setNewTx({
      description: "",
      type: normalizedType,
      wallet_id: "",
      amount: "",
      category: defaultCategoryForType(normalizedType),
    });
    setAddError("");
  }, [open, defaultType]);

  const categoryOptions = getCategoryOptions(newTx.type);

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    const wallet = wallets.find((w) => w.wallet_id === Number(newTx.wallet_id));
    if (!wallet) {
      setAddError("Please select a wallet");
      return;
    }

    try {
      await createTx.mutateAsync({
        description: newTx.description,
        type: newTx.type,
        wallet_type: wallet.name,
        wallet_id: wallet.wallet_id,
        category: newTx.category,
        amount: Number(newTx.amount),
      });
      setOpen(false);
    } catch (err: unknown) {
      setAddError(
        err instanceof Error ? err.message : "Failed to add transaction",
      );
    }
  }

  function handleTypeChange(nextType: TxType) {
    setNewTx((prev) => ({
      ...prev,
      type: nextType,
      category: defaultCategoryForType(nextType),
    }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[520px] p-0 gap-0 overflow-hidden shadow-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.92))] p-6 pb-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <span className="material-symbols-outlined text-[20px]">
                add_card
              </span>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                Add Transaction
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500">
                Record an income or expense and tag it with a category.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleAddTransaction} className="space-y-5 p-6">
          {addError && (
            <div className="flex items-center gap-2 rounded-2xl border border-error/20 bg-error-container/20 p-3 text-body-sm font-medium text-error">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              {addError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tx-description" className="font-bold text-slate-600">
              Description
            </Label>
            <Input
              id="tx-description"
              value={newTx.description}
              onChange={(e) =>
                setNewTx({ ...newTx, description: e.target.value })
              }
              placeholder="e.g. Lunch at Jollibee"
              className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-colors focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx-type" className="font-bold text-slate-600">
                Type
              </Label>
              <div className="relative">
                <select
                  id="tx-type"
                  value={newTx.type}
                  onChange={(e) => handleTypeChange(e.target.value as TxType)}
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-body-sm font-bold outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-primary/20"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                  expand_more
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tx-amount" className="font-bold text-slate-600">
                Amount (PHP)
              </Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={newTx.amount}
                onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                placeholder="0.00"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="font-bold text-slate-600">Category</Label>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Pick one
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categoryOptions.map((option) => {
                const selected = newTx.category === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setNewTx({ ...newTx, category: option.key })}
                    className={`flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-all ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${option.accent}`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {option.icon}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {option.label}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selected ? "Selected" : "Tap to apply"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-wallet" className="font-bold text-slate-600">
              Wallet
            </Label>
            <div className="relative">
              <select
                id="tx-wallet"
                value={newTx.wallet_id}
                onChange={(e) =>
                  setNewTx({ ...newTx, wallet_id: e.target.value })
                }
                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-body-sm font-bold outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Select wallet</option>
                {wallets.map((w) => (
                  <option key={w.wallet_id} value={w.wallet_id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTx.isPending}
              className="flex-1 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            >
              {createTx.isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

