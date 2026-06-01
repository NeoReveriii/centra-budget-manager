import { useMemo, useState } from 'react';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useWallets,
} from '@/hooks/use-budget-data';
import { useUiStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function formatCurrency(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const ICON_MAP: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  food: { icon: 'restaurant', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  dining: { icon: 'restaurant', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  transport: { icon: 'commute', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  grab: { icon: 'commute', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  bill: { icon: 'bolt', iconBg: 'bg-amber-50', iconColor: 'text-amber-700' },
  electric: { icon: 'bolt', iconBg: 'bg-amber-50', iconColor: 'text-amber-700' },
  internet: { icon: 'wifi', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  shopping: { icon: 'shopping_bag', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  subscription: { icon: 'subscriptions', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
  salary: { icon: 'payments', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
  income: { icon: 'payments', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
  freelance: { icon: 'work', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
  transfer: { icon: 'sync_alt', iconBg: 'bg-slate-50', iconColor: 'text-slate-600' },
  health: { icon: 'fitness_center', iconBg: 'bg-red-50', iconColor: 'text-red-600' },
  game: { icon: 'sports_esports', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
  gas: { icon: 'local_gas_station', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  coffee: { icon: 'coffee', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
};

function getIconStyle(desc: string, type: string) {
  const lower = desc.toLowerCase();
  for (const [key, style] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return style;
  }
  if (type === 'Income') return { icon: 'payments', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' };
  if (type === 'Transfer') return { icon: 'sync_alt', iconBg: 'bg-slate-50', iconColor: 'text-slate-600' };
  return { icon: 'receipt_long', iconBg: 'bg-slate-50', iconColor: 'text-slate-600' };
}

const ITEMS_PER_PAGE = 10;

const Transactions = () => {
  const { data: transactions = [], isLoading: loading } = useTransactions();
  const { data: wallets = [] } = useWallets();
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();

  const search = useUiStore((s) => s.txSearch);
  const typeFilter = useUiStore((s) => s.txTypeFilter);
  const walletFilter = useUiStore((s) => s.txWalletFilter);
  const page = useUiStore((s) => s.txPage);
  const setSearch = useUiStore((s) => s.setTxSearch);
  const setTypeFilter = useUiStore((s) => s.setTxTypeFilter);
  const setWalletFilter = useUiStore((s) => s.setTxWalletFilter);
  const setPage = useUiStore((s) => s.setTxPage);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ description: '', type: 'Expense', wallet_id: '', amount: '' });
  const [addError, setAddError] = useState('');

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filtering
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== 'All Types' && tx.type !== typeFilter) return false;
      if (walletFilter !== 'All Wallets' && tx.wallet_type !== walletFilter) return false;
      return true;
    });
  }, [transactions, search, typeFilter, walletFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');

    const wallet = wallets.find((w) => w.wallet_id === Number(newTx.wallet_id));
    if (!wallet) {
      setAddError('Please select a wallet');
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
      setShowAddModal(false);
      setNewTx({ description: '', type: 'Expense', wallet_id: '', amount: '' });
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteTx.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined animate-spin text-primary text-[48px]">progress_activity</span>
          <p className="text-slate-500 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 space-y-8 animate-fade-in">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="font-h1 text-h1 text-primary">Transactions</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Manage and monitor your financial activity across all accounts.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowAddModal(true)} className="rounded-xl gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Transaction
          </Button>
        </div>
      </header>

      {/* FILTERS */}
      <section className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="Search transactions..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="appearance-none px-4 pr-10 py-3 bg-white border border-outline-variant rounded-xl text-body-sm text-on-surface font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option>All Types</option>
          <option>Expense</option>
          <option>Income</option>
          <option>Transfer</option>
        </select>
        <select
          className="appearance-none px-4 pr-10 py-3 bg-white border border-outline-variant rounded-xl text-body-sm text-on-surface font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          value={walletFilter}
          onChange={(e) => setWalletFilter(e.target.value)}
        >
          <option>All Wallets</option>
          {wallets.map((w) => (
            <option key={w.wallet_id}>{w.name}</option>
          ))}
        </select>
      </section>

      {/* DATA TABLE */}
      <section className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-left font-label-caps text-label-caps text-slate-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="px-6 py-4 text-left font-label-caps text-label-caps text-slate-500 uppercase tracking-widest whitespace-nowrap">Description</th>
                <th className="px-6 py-4 text-left font-label-caps text-label-caps text-slate-500 uppercase tracking-widest whitespace-nowrap">Wallet</th>
                <th className="px-6 py-4 text-left font-label-caps text-label-caps text-slate-500 uppercase tracking-widest whitespace-nowrap">Type</th>
                <th className="px-6 py-4 text-right font-label-caps text-label-caps text-slate-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 text-center font-label-caps text-label-caps text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No transactions found</td></tr>
              ) : (
                paginated.map((tx) => {
                  const style = getIconStyle(tx.description, tx.type);
                  const amt = Number(tx.amount);
                  return (
                    <tr key={tx.trans_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <p className="text-body-sm font-bold text-slate-700">{formatDate(tx.dateoftrans)}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{formatTime(tx.dateoftrans)}</p>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${style.iconBg} ${style.iconColor} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                          </div>
                          <div className="font-bold text-on-surface">{tx.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-body-sm text-slate-600 font-bold whitespace-nowrap">{tx.wallet_type}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[12px] font-bold border ${
                          tx.type === 'Income' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          tx.type === 'Transfer' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>{tx.type}</span>
                      </td>
                      <td className={`px-6 py-5 text-right font-bold whitespace-nowrap ${
                        tx.type === 'Income' ? 'text-emerald-600' :
                        tx.type === 'Transfer' ? 'text-blue-600' :
                        'text-error'
                      }`}>
                        {tx.type === 'Income' ? '+' : tx.type === 'Expense' ? '-' : ''}{formatCurrency(amt)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => setDeleteId(tx.trans_id)}
                          className="p-1.5 text-slate-300 hover:text-error rounded-lg hover:bg-rose-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
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
            <p className="text-body-sm text-slate-500 font-medium">
              Showing <span className="text-on-surface font-bold">{(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="text-on-surface font-bold">{filtered.length}</span> transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >Previous</button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm cursor-pointer ${p === page ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                  >{p}</button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >Next</button>
            </div>
          </div>
        )}
      </section>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden" showCloseButton={false}>
          <DialogHeader className="p-6 border-b border-slate-100 text-left">
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Record income or expense against a wallet.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
            {addError && (
              <div className="p-3 bg-error-container/20 border border-error/20 rounded-xl text-error text-body-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>{addError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="tx-description">Description</Label>
              <Input
                id="tx-description"
                value={newTx.description}
                onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                placeholder="e.g. Lunch at Jollibee"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tx-type">Type</Label>
                <select
                  id="tx-type"
                  value={newTx.type}
                  onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-outline-variant rounded-xl text-body-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                  <option>Expense</option>
                  <option>Income</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-amount">Amount (₱)</Label>
                <Input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-wallet">Wallet</Label>
              <select
                id="tx-wallet"
                value={newTx.wallet_id}
                onChange={(e) => setNewTx({ ...newTx, wallet_id: e.target.value })}
                className="w-full h-11 px-4 bg-slate-50 border border-outline-variant rounded-xl text-body-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                required
              >
                <option value="">Select wallet</option>
                {wallets.map((w) => (
                  <option key={w.wallet_id} value={w.wallet_id}>{w.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="pt-2 sm:justify-stretch gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTx.isPending} className="flex-1 rounded-xl">
                {createTx.isPending ? 'Adding...' : 'Add Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm text-center" showCloseButton={false}>
          <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-error text-[32px]">delete</span>
          </div>
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleDelete} disabled={deleteTx.isPending}>
              {deleteTx.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
