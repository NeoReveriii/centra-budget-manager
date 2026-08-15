import { useState } from "react";
import { Link } from "react-router-dom";
import { useUiStore } from "@/stores/ui-store";
import { StyledSelect } from "@/components/ui/styled-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { deleteAccount, fetchTransactions } from "@/lib/api";

function escapeCsvCell(value: unknown): string {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildTransactionCsv(
  transactions: Awaited<ReturnType<typeof fetchTransactions>>,
): string {
  const rows = transactions.map((transaction) => [
    transaction.dateoftrans,
    transaction.description,
    transaction.type,
    transaction.category ?? "",
    transaction.wallet_type,
    Number(transaction.amount).toFixed(2),
  ]);

  return [
    ["Date", "Description", "Type", "Category", "Wallet", "Amount"],
    ...rows,
  ]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}

const Settings = () => {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const highContrast = useUiStore((s) => s.highContrast);
  const setHighContrast = useUiStore((s) => s.setHighContrast);
  const showCurrencySymbol = useUiStore((s) => s.showCurrencySymbol);
  const setShowCurrencySymbol = useUiStore((s) => s.setShowCurrencySymbol);
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState("English");
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    setExportStatus("");
    try {
      const transactions = await fetchTransactions();
      const csv = `\uFEFF${buildTransactionCsv(transactions)}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `centra-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportStatus(
        transactions.length
          ? `Exported ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}.`
          : "Exported an empty transaction file.",
      );
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : "Unable to export transactions.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user || deleteConfirmation.trim() !== "DELETE") return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(user.acc_id);
      await logout();
      window.location.assign("/");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete the account.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[800px] animate-fade-in">
      <header className="mb-6">
        <h2 className="font-h1 text-h1 text-on-surface">Settings</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your account preferences and system configurations.
        </p>
      </header>

      {/* Appearance Section */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            palette
          </span>
          <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
            Appearance
          </h3>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden divide-y divide-outline-variant/30">
          {/* Dark Mode Row */}
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">
                Dark Mode
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Switch between standard and low-light interface themes.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform">
              <input
                className="sr-only peer"
                type="checkbox"
                aria-label="Dark Mode"
                checked={theme === "dark"}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
              />
              <div className="h-5 w-10 rounded-full bg-surface-container-high peer-focus:outline-none peer peer-checked:after:translate-x-5 peer-checked:after:border-on-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-outline-variant after:bg-surface-container-lowest after:content-[''] after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Contrast Row */}
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">
                Contrast Adjustment
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Toggle between normal and high contrast modes.
              </p>
            </div>
            <button
              type="button"
              aria-pressed={highContrast}
              onClick={() => setHighContrast(!highContrast)}
              className="shrink-0 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-surface-dim hover:text-primary-container active:scale-[0.98]"
            >
              {highContrast ? "High Contrast" : "Normal Contrast"}
            </button>
          </div>

          {/* Language Row */}
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">Language</p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Select your preferred display language.
              </p>
            </div>
            <div className="w-full shrink-0 sm:w-[186px]">
              <StyledSelect
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "English", label: "English" },
                  { value: "Filipino", label: "Filipino" },
                  { value: "Spanish", label: "Spanish" },
                ]}
                className="rounded-xl bg-surface-container-lowest text-on-surface"
                aria-label="Language"
              />
            </div>
          </div>

          {/* Currency Display Row */}
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">
                Currency Display
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Show or hide the Pesos symbol (₱) in amounts.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform">
              <input
                checked={showCurrencySymbol}
                onChange={(event) => setShowCurrencySymbol(event.target.checked)}
                className="sr-only peer"
                type="checkbox"
                aria-label="Currency Display"
              />
              <div className="h-5 w-10 rounded-full bg-surface-container-high peer-focus:outline-none peer peer-checked:after:translate-x-5 peer-checked:after:border-on-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-outline-variant after:bg-surface-container-lowest after:content-[''] after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            database
          </span>
          <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
            Data Management
          </h3>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">
                Export Data
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Download a CSV file containing all your transaction records.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-on-secondary shadow-sm transition-colors hover:bg-primary hover:text-on-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                download
              </span>
              {isExporting ? "Preparing..." : "Download CSV"}
            </button>
          </div>
          {exportStatus ? (
            <p role="status" className="border-t border-outline-variant/30 px-4 py-3 text-xs text-on-surface-variant">
              {exportStatus}
            </p>
          ) : null}
        </div>
      </section>

      {/* Legal Section */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            gavel
          </span>
          <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
            Legal
          </h3>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden divide-y divide-outline-variant/30">
          <div className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low group/row">
            <p className="text-sm font-bold text-on-surface">
              Privacy Policy
            </p>
            <Link to="/privacy" className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container group">
              View Policy
              <span
                className="material-symbols-outlined group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                style={{ fontSize: "16px" }}
              >
                open_in_new
              </span>
            </Link>
          </div>
          <div className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low group/row">
            <p className="text-sm font-bold text-on-surface">
              Terms of Use
            </p>
            <Link to="/terms" className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container group">
              View Terms
              <span
                className="material-symbols-outlined group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                style={{ fontSize: "16px" }}
              >
                open_in_new
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Danger Zone Section */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">
            warning
          </span>
          <h3 className="font-label-caps text-label-caps text-error uppercase tracking-widest">
            Danger Zone
          </h3>
        </div>
        <div className="bg-surface-container-lowest border border-error/20 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between gap-4 bg-error-container/10 p-4 transition-colors hover:bg-error-container/30">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-error-container">
                Delete Centra Data
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Permanently remove your Centra profile, wallets, transactions, goals, and saved chats.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmation("");
                setDeleteError("");
                setDeleteOpen(true);
              }}
              className="shrink-0 rounded-lg bg-error px-3 py-2 text-xs font-bold text-on-error shadow-sm transition-colors hover:bg-error/90 active:scale-[0.98]"
            >
              Delete Data
            </button>
          </div>
        </div>
      </section>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setDeleteOpen(open);
          if (!open) {
            setDeleteConfirmation("");
            setDeleteError("");
          }
        }}
      >
        <DialogContent className="max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Delete your Centra data?</DialogTitle>
            <DialogDescription>
              This permanently deletes your Centra profile, wallets, transactions, goals, and saved chats. Your separate authentication-provider identity may remain, and signing in again may create a new empty Centra profile. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="delete-account-confirmation">
              Type <span className="font-extrabold text-error">DELETE</span> to confirm
            </Label>
            <Input
              id="delete-account-confirmation"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              aria-describedby={deleteError ? "delete-account-error" : undefined}
              aria-invalid={Boolean(deleteError)}
            />
            {deleteError ? (
              <p id="delete-account-error" role="alert" className="text-xs font-semibold text-error">
                {deleteError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation.trim() !== "DELETE" || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete data permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
