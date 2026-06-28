import { useEffect, useState } from "react";
import { useTransferFunds, useWallets } from "@/hooks/use-budget-data";
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function TransferFundsModal() {
  const open = useUiStore((s) => s.transferModalOpen);
  const setOpen = useUiStore((s) => s.setTransferModalOpen);

  const { data: wallets = [] } = useWallets();
  const transferMutation = useTransferFunds();

  const [transfer, setTransfer] = useState({
    from_wallet_id: "",
    to_wallet_id: "",
    amount: "",
  });
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTransfer({ from_wallet_id: "", to_wallet_id: "", amount: "" });
    setTransferError("");
  }, [open]);

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTransferError("");

    try {
      await transferMutation.mutateAsync({
        from_wallet_id: Number(transfer.from_wallet_id),
        to_wallet_id: Number(transfer.to_wallet_id),
        amount: Number(transfer.amount),
      });
      setOpen(false);
    } catch (err: unknown) {
      setTransferError(err instanceof Error ? err.message : "Transfer failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[448px] p-0 gap-0 overflow-hidden shadow-2xl" showCloseButton={false}>
        <DialogHeader className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.92))] p-6 pb-5 text-left">
          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
              Transfer Funds
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-500">
              Move money between your wallets without creating a fake expense.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleTransfer} className="space-y-4 p-6">
          {transferError && (
            <div className="flex items-center gap-2 rounded-2xl border border-error/20 bg-error-container/20 p-3 text-body-sm font-medium text-error">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {transferError}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-label-caps font-label-caps text-slate-500 uppercase">
              From Wallet
            </label>
            <select
              value={transfer.from_wallet_id}
              onChange={(e) =>
                setTransfer({ ...transfer, from_wallet_id: e.target.value })
              }
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-body-sm font-bold outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Select source wallet</option>
              {wallets.map((w) => (
                <option key={w.wallet_id} value={w.wallet_id}>
                  {w.name} - {formatCurrency(Number(w.calculated_balance))}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-label-caps font-label-caps text-slate-500 uppercase">
              To Wallet
            </label>
            <select
              value={transfer.to_wallet_id}
              onChange={(e) =>
                setTransfer({ ...transfer, to_wallet_id: e.target.value })
              }
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-body-sm font-bold outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Select destination wallet</option>
              {wallets
                .filter((w) => String(w.wallet_id) !== transfer.from_wallet_id)
                .map((w) => (
                  <option key={w.wallet_id} value={w.wallet_id}>
                    {w.name} - {formatCurrency(Number(w.calculated_balance))}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-label-caps font-label-caps text-slate-500 uppercase">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-body-sm outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-primary/20"
              placeholder="0.00"
              required
            />
          </div>

          <DialogFooter className="gap-3 pt-2 sm:justify-stretch">
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
              disabled={transferMutation.isPending}
              className="flex-1 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            >
              {transferMutation.isPending ? "Transferring..." : "Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
