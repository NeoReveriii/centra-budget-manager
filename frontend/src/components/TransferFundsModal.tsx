import { useEffect, useMemo, useRef, useState } from "react";
import {
  useTransferFunds,
  useWallets,
  type Wallet,
} from "@/hooks/use-budget-data";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { StyledSelect } from "@/components/ui/styled-select";
import FieldError from "@/components/FieldError";
import { cn } from "@/lib/utils";
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPTY_WALLETS: Wallet[] = [];

interface TransferFieldErrors {
  fromWallet?: string;
  toWallet?: string;
  amount?: string;
}

function validateTransferAmount(value: string) {
  if (!value.trim()) return "Enter the amount you want to transfer.";
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Enter an amount greater than zero.";
  return "";
}

export function TransferFundsModal() {
  const formatCurrency = useCurrencyFormatter();
  const showCurrencySymbol = useUiStore((s) => s.showCurrencySymbol);
  const open = useUiStore((s) => s.transferModalOpen);
  const setOpen = useUiStore((s) => s.setTransferModalOpen);
  const defaultFromWalletId = useUiStore((s) => s.transferModalFromWalletId);

  const { data: wallets = EMPTY_WALLETS } = useWallets();
  const transferMutation = useTransferFunds();
  const activeWallets = useMemo(
    () =>
      wallets.filter(
        (wallet) => String(wallet.status).toUpperCase() === "ACTIVE",
      ),
    [wallets],
  );

  const [transfer, setTransfer] = useState({
    from_wallet_id: "",
    to_wallet_id: "",
    amount: "",
  });
  const [transferError, setTransferError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<TransferFieldErrors>({});
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    if (wasOpen.current) return;
    wasOpen.current = true;
    const fromWalletId = activeWallets.some(
      (wallet) => String(wallet.wallet_id) === defaultFromWalletId,
    )
      ? defaultFromWalletId
      : "";
    setTransfer({ from_wallet_id: fromWalletId, to_wallet_id: "", amount: "" });
    setTransferError("");
    setFieldErrors({});
  }, [open, defaultFromWalletId, activeWallets]);

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTransferError("");

    const nextFieldErrors: TransferFieldErrors = {
      fromWallet: transfer.from_wallet_id ? "" : "Select the wallet to move money from.",
      toWallet: transfer.to_wallet_id ? "" : "Select the wallet to receive the money.",
      amount: validateTransferAmount(transfer.amount),
    };
    setFieldErrors(nextFieldErrors);

    const firstInvalidId = [
      [nextFieldErrors.fromWallet, "transfer-from-wallet"],
      [nextFieldErrors.toWallet, "transfer-to-wallet"],
      [nextFieldErrors.amount, "transfer-amount"],
    ].find(([message]) => Boolean(message))?.[1];

    if (firstInvalidId) {
      document.getElementById(firstInvalidId)?.focus();
      return;
    }

    const sourceWallet = activeWallets.find(
      (wallet) => wallet.wallet_id === Number(transfer.from_wallet_id),
    );
    const destinationWallet = activeWallets.find(
      (wallet) => wallet.wallet_id === Number(transfer.to_wallet_id),
    );
    const amount = Number(transfer.amount);
    if (!sourceWallet) {
      setFieldErrors((current) => ({
        ...current,
        fromWallet: "That source wallet is no longer active. Choose another wallet.",
      }));
      document.getElementById("transfer-from-wallet")?.focus();
      return;
    }
    if (!destinationWallet) {
      setFieldErrors((current) => ({
        ...current,
        toWallet: "That destination wallet is no longer active. Choose another wallet.",
      }));
      document.getElementById("transfer-to-wallet")?.focus();
      return;
    }
    if (amount > Number(sourceWallet.calculated_balance)) {
      setFieldErrors((current) => ({
        ...current,
        amount: `Enter an amount no greater than the available ${formatCurrency(Number(sourceWallet.calculated_balance))}.`,
      }));
      document.getElementById("transfer-amount")?.focus();
      return;
    }

    try {
      await transferMutation.mutateAsync({
        from_wallet_id: Number(transfer.from_wallet_id),
        to_wallet_id: Number(transfer.to_wallet_id),
        amount,
      });
      setOpen(false);
    } catch (err: unknown) {
      setTransferError(err instanceof Error ? err.message : "Transfer failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[448px] p-0 gap-0 overflow-hidden shadow-2xl" showCloseButton={false}>
        <DialogHeader className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.92))] p-6 pb-5 text-left dark:bg-none dark:bg-[#181818]">
          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
              Transfer Funds
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-500">
              Move money between your wallets without creating a fake expense.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleTransfer} noValidate className="space-y-4 p-6">
          {transferError && (
            <div className="flex items-center gap-2 rounded-2xl border border-error/20 bg-error-container/20 p-3 text-body-sm font-medium text-error">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {transferError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="transfer-from-wallet" className="block text-label-caps font-label-caps text-slate-500 uppercase">
              From Wallet
            </label>
            <StyledSelect
              id="transfer-from-wallet"
              value={transfer.from_wallet_id}
              onChange={(fromWalletId) => {
                setTransfer({
                  ...transfer,
                  from_wallet_id: fromWalletId,
                  to_wallet_id:
                    transfer.to_wallet_id === fromWalletId
                      ? ""
                      : transfer.to_wallet_id,
                });
                if (fieldErrors.fromWallet || fieldErrors.toWallet) {
                  setFieldErrors((current) => ({
                    ...current,
                    fromWallet: fromWalletId ? "" : "Select the wallet to move money from.",
                    toWallet:
                      transfer.to_wallet_id === fromWalletId
                        ? "Select a different destination wallet."
                        : current.toWallet,
                  }));
                }
              }}
              options={[
                { value: "", label: "Select source wallet" },
                ...activeWallets.map((wallet) => ({
                  value: String(wallet.wallet_id),
                  label: `${wallet.name} - ${formatCurrency(Number(wallet.calculated_balance))}`,
                })),
              ]}
              className={cn(
                "bg-slate-50",
                fieldErrors.fromWallet && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
              )}
              required
              aria-invalid={Boolean(fieldErrors.fromWallet)}
              aria-describedby={fieldErrors.fromWallet ? "transfer-from-wallet-error" : undefined}
            />
            <FieldError id="transfer-from-wallet-error" message={fieldErrors.fromWallet} />
          </div>

          <div className="space-y-2">
            <label htmlFor="transfer-to-wallet" className="block text-label-caps font-label-caps text-slate-500 uppercase">
              To Wallet
            </label>
            <StyledSelect
              id="transfer-to-wallet"
              value={transfer.to_wallet_id}
              onChange={(value) => {
                setTransfer({ ...transfer, to_wallet_id: value });
                if (fieldErrors.toWallet) {
                  setFieldErrors((current) => ({
                    ...current,
                    toWallet: value ? "" : "Select the wallet to receive the money.",
                  }));
                }
              }}
              options={[
                { value: "", label: "Select destination wallet" },
                ...activeWallets
                  .filter((wallet) => String(wallet.wallet_id) !== transfer.from_wallet_id)
                  .map((wallet) => ({
                    value: String(wallet.wallet_id),
                    label: `${wallet.name} - ${formatCurrency(Number(wallet.calculated_balance))}`,
                  })),
              ]}
              className={cn(
                "bg-slate-50",
                fieldErrors.toWallet && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200",
              )}
              required
              aria-invalid={Boolean(fieldErrors.toWallet)}
              aria-describedby={fieldErrors.toWallet ? "transfer-to-wallet-error" : undefined}
            />
            <FieldError id="transfer-to-wallet-error" message={fieldErrors.toWallet} />
          </div>

          {activeWallets.length < 2 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
              You need at least two active wallets to transfer funds.
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="transfer-amount" className="block text-label-caps font-label-caps text-slate-500 uppercase">
              Amount{showCurrencySymbol ? " (₱)" : ""}
            </label>
            <input
              id="transfer-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={transfer.amount}
              onChange={(e) => {
                const amount = e.target.value;
                setTransfer({ ...transfer, amount });
                if (fieldErrors.amount) {
                  setFieldErrors((current) => ({
                    ...current,
                    amount: validateTransferAmount(amount),
                  }));
                }
              }}
              aria-invalid={Boolean(fieldErrors.amount)}
              aria-describedby={fieldErrors.amount ? "transfer-amount-error" : undefined}
              className={cn(
                "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-body-sm outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-primary/20",
                fieldErrors.amount && "border-red-500 focus:border-red-500 focus:ring-red-200",
              )}
              placeholder="0.00"
              required
            />
            <FieldError id="transfer-amount-error" message={fieldErrors.amount} />
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
              disabled={transferMutation.isPending || activeWallets.length < 2}
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
