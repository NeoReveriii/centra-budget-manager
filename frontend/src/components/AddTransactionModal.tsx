import { useState, useEffect } from "react";
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

export function AddTransactionModal() {
  const open = useUiStore((s) => s.addModalOpen);
  const setOpen = useUiStore((s) => s.setAddModalOpen);
  const defaultType = useUiStore((s) => s.addModalDefaultType);

  const { data: wallets = [] } = useWallets();
  const createTx = useCreateTransaction();

  const [newTx, setNewTx] = useState({
    description: "",
    type: "Expense",
    wallet_id: "",
    amount: "",
  });
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (open) {
      setNewTx({
        description: "",
        type: defaultType,
        wallet_id: "",
        amount: "",
      });
      setAddError("");
    }
  }, [open, defaultType]);

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
        amount: Number(newTx.amount),
      });
      setOpen(false);
    } catch (err: unknown) {
      setAddError(
        err instanceof Error ? err.message : "Failed to add transaction",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[448px] p-0 gap-0 overflow-hidden shadow-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="p-6 pb-5 border-b-0 text-left bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">
                add_card
              </span>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                Add Transaction
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Record an income or expense accurately.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
          {addError && (
            <div className="p-3 bg-error-container/20 border border-error/20 rounded-xl text-error text-body-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              {addError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="tx-description" className="text-slate-600 font-bold">
              Description
            </Label>
            <Input
              id="tx-description"
              value={newTx.description}
              onChange={(e) =>
                setNewTx({ ...newTx, description: e.target.value })
              }
              placeholder="e.g. Lunch at Jollibee"
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx-type" className="text-slate-600 font-bold">
                Type
              </Label>
              <div className="relative">
                <select
                  id="tx-type"
                  value={newTx.type}
                  onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                  className="w-full h-11 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-body-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none transition-colors"
                >
                  <option>Expense</option>
                  <option>Income</option>
                  <option>Transfer</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                  expand_more
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-amount" className="text-slate-600 font-bold">
                Amount (₱)
              </Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={newTx.amount}
                onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                placeholder="0.00"
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-wallet" className="text-slate-600 font-bold">
              Wallet
            </Label>
            <div className="relative">
              <select
                id="tx-wallet"
                value={newTx.wallet_id}
                onChange={(e) =>
                  setNewTx({ ...newTx, wallet_id: e.target.value })
                }
                className="w-full h-11 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-body-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none transition-colors"
                required
              >
                <option value="">Select wallet</option>
                {wallets.map((w) => (
                  <option key={w.wallet_id} value={w.wallet_id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>
          </div>
          <DialogFooter className="pt-4 sm:justify-stretch gap-3">
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
              className="flex-1 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              {createTx.isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
