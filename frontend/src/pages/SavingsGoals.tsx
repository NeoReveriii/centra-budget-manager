import React, { useState } from "react";
import GoalCard from "../components/GoalCard";
import type { PriorityLevel } from "../components/GoalCard";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "../hooks/use-budget-data";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

const CATEGORY_ICONS: Record<string, string> = {
  Emergency: "security",
  Travel:    "flight",
  Gadget:    "laptop",
  Housing:   "house",
  Vehicle:   "directions_car",
  Education: "school",
  Savings:   "savings",
};

const SELECT_CLS =
  "w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm " +
  "outline-none focus:border-primary focus:ring-0 transition-colors cursor-pointer " +
  "disabled:cursor-not-allowed disabled:opacity-50";

function formatCurrency(n: number) {
  return (
    "₱" +
    n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthsRemaining(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  const m = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  return Math.max(0, m);
}

// ─── Component ───────────────────────────────────────────────────────────────

const SavingsGoals: React.FC = () => {
  const { data: goals = [], isLoading } = useGoals();
  const createGoalMut  = useCreateGoal();
  const updateGoalMut  = useUpdateGoal();
  const deleteGoalMut  = useDeleteGoal();

  // ── Add Goal State ──
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title,        setTitle]        = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category,     setCategory]     = useState("Savings");
  const [priority,     setPriority]     = useState<number>(3);
  const [deadline,     setDeadline]     = useState("");

  // ── Contribute State ──
  const [isContributeOpen, setIsContributeOpen]   = useState(false);
  const [selectedGoalId,   setSelectedGoalId]     = useState<number | null>(null);
  const [contributeAmount, setContributeAmount]   = useState("");
  const [contributeNote,   setContributeNote]     = useState("");

  // ── Delete Confirm State ──
  const [deleteGoalId, setDeleteGoalId] = useState<number | null>(null);

  // ── Analytics ──
  const totalSavings      = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget       = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalRemaining    = Math.max(0, totalTarget - totalSavings);
  const momentumPct       = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;
  const completedGoals    = goals.filter(g => Number(g.current_amount) >= Number(g.target_amount)).length;
  const activeGoals       = goals.length - completedGoals;

  // Nearest deadline with remaining amount
  const upcomingGoal = [...goals]
    .filter(g => g.deadline && Number(g.current_amount) < Number(g.target_amount))
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0];

  // Monthly needed across all goals with deadlines
  const totalMonthlyNeeded = goals.reduce((sum, g) => {
    if (!g.deadline) return sum;
    const months = getMonthsRemaining(g.deadline);
    if (months === 0) return sum;
    const rem = Math.max(0, Number(g.target_amount) - Number(g.current_amount));
    return sum + Math.ceil(rem / months);
  }, 0);

  // ── Handlers ──
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    createGoalMut.mutate(
      {
        title,
        target_amount: Number(targetAmount),
        category,
        priority,
        deadline: deadline || undefined,
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          setTitle("");
          setTargetAmount("");
          setCategory("Savings");
          setPriority(3);
          setDeadline("");
        },
      }
    );
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) return;
    updateGoalMut.mutate(
      { goal_id: selectedGoalId, add_amount: Number(contributeAmount), note: contributeNote },
      {
        onSuccess: () => {
          setIsContributeOpen(false);
          setContributeAmount("");
          setContributeNote("");
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    setDeleteGoalId(id);
  };

  const confirmDelete = () => {
    if (deleteGoalId) {
      deleteGoalMut.mutate(deleteGoalId, {
        onSuccess: () => setDeleteGoalId(null),
      });
    }
  };

  const openContribute = (id: number) => {
    setSelectedGoalId(id);
    setIsContributeOpen(true);
  };

  // Priority number → label
  function priorityLabel(p: number): PriorityLevel {
    if (p >= 4) return "High";
    if (p <= 2) return "Low";
    return "Medium";
  }

  // ── Min date for deadline picker = today ──
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col min-h-full animate-fade-in space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-primary">Savings Goals</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Track your financial milestones and stay on target.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-body-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              New Goal
            </button>
          </DialogTrigger>

          {/* ── Add Goal Dialog ── */}
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleAddGoal}>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a title, target amount, priority, and an optional deadline.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 py-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g. Emergency Fund, Japan Trip…"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Target Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="goal-target">Target Amount (₱)</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Category + Priority row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-category">Category</Label>
                    <select
                      id="goal-category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className={SELECT_CLS}
                    >
                      {Object.keys(CATEGORY_ICONS).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="goal-priority">Priority</Label>
                    <select
                      id="goal-priority"
                      value={priority}
                      onChange={e => setPriority(Number(e.target.value))}
                      className={SELECT_CLS}
                    >
                      <option value={5}>🔴 High (Urgent)</option>
                      <option value={4}>🟠 High</option>
                      <option value={3}>🟡 Medium</option>
                      <option value={2}>🟢 Low</option>
                      <option value={1}>⚪ Very Low</option>
                    </select>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <Label htmlFor="goal-deadline" className="flex items-center gap-2">
                    Target Date
                    <span className="text-[10px] text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="goal-deadline"
                    type="date"
                    min={todayStr}
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                  />
                  {deadline && targetAmount && Number(targetAmount) > 0 && (() => {
                    const months = getMonthsRemaining(deadline);
                    if (months > 0) {
                      const mo = Math.ceil(Number(targetAmount) / months);
                      return (
                        <p className="text-[12px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                          You need to save <strong className="mx-1">{formatCurrency(mo)}/month</strong> to hit this target.
                        </p>
                      );
                    }
                    return (
                      <p className="text-[12px] text-rose-600 font-medium mt-1">
                        ⚠ Deadline is in the same month or past.
                      </p>
                    );
                  })()}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createGoalMut.isPending}>
                  {createGoalMut.isPending ? "Saving…" : "Create Goal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* ── Summary Banner ─────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Saved */}
        <div className="col-span-2 md:col-span-1 bg-primary text-white rounded-2xl p-5 relative overflow-hidden shadow-md">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">Total Saved</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
          <p className="text-[11px] opacity-70 mt-1">{momentumPct.toFixed(1)}% of all targets</p>
        </div>

        {/* Monthly Needed */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-500 text-[20px]">calendar_month</span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Needed</p>
          </div>
          <p className="text-xl font-bold text-on-surface">
            {totalMonthlyNeeded > 0 ? formatCurrency(totalMonthlyNeeded) : "—"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across all deadlines</p>
        </div>

        {/* Remaining */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-rose-500 text-[20px]">savings</span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Still Needed</p>
          </div>
          <p className="text-xl font-bold text-on-surface">{formatCurrency(totalRemaining)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Until all goals met</p>
        </div>

        {/* Goals count */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-500 text-[20px]">task_alt</span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Goals</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-emerald-600">{completedGoals}</p>
            <p className="text-xl font-bold text-slate-300">/</p>
            <p className="text-xl font-bold text-on-surface">{goals.length}</p>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{activeGoals} active</p>
        </div>
      </section>

      {/* Upcoming deadline banner */}
      {upcomingGoal && (() => {
        const daysLeft = Math.max(0, Math.ceil((new Date(upcomingGoal.deadline!).getTime() - Date.now()) / 86400000));
        const months   = getMonthsRemaining(upcomingGoal.deadline!);
        const rem      = Math.max(0, Number(upcomingGoal.target_amount) - Number(upcomingGoal.current_amount));
        const mo       = months > 0 ? Math.ceil(rem / months) : rem;
        return (
          <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${
            daysLeft <= 30
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <span className="material-symbols-outlined text-[24px]">
              {daysLeft <= 30 ? "warning" : "notifications_active"}
            </span>
            <div className="flex-1">
              <p className="font-bold text-[13px]">
                {daysLeft <= 30 ? "Urgent! " : "Upcoming: "}
                <span className="font-normal">{upcomingGoal.title}</span>
              </p>
              <p className="text-[12px] opacity-80">
                {daysLeft} days left · Save {formatCurrency(mo)}/month to reach your goal.
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── Goal Cards ─────────────────────────────────────────── */}
      <section>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">
              progress_activity
            </span>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-[56px] text-slate-200">savings</span>
            <p className="mt-4 font-bold text-on-surface">No goals yet</p>
            <p className="text-body-sm mt-1">Click "New Goal" to set your first financial milestone.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <GoalCard
                key={goal.goal_id}
                title={goal.title}
                targetAmount={Number(goal.target_amount)}
                currentAmount={Number(goal.current_amount)}
                icon={CATEGORY_ICONS[goal.category || "Savings"] || "savings"}
                priorityLevel={priorityLabel(goal.priority)}
                deadline={goal.deadline}
                createdAt={goal.created_at}
                onContribute={() => openContribute(goal.goal_id)}
                onDelete={() => handleDelete(goal.goal_id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Contribute Dialog ──────────────────────────────────── */}
      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleContribute}>
            <DialogHeader>
              <DialogTitle>Contribute to Goal</DialogTitle>
              <DialogDescription>Add funds to accelerate your progress.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="contribute-amount">Amount (₱)</Label>
                <Input
                  id="contribute-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={contributeAmount}
                  onChange={e => setContributeAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contribute-note">
                  Note
                  <span className="text-[10px] text-slate-400 font-normal ml-2">(optional)</span>
                </Label>
                <Input
                  id="contribute-note"
                  placeholder="e.g. Monthly allocation"
                  value={contributeNote}
                  onChange={e => setContributeNote(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContributeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateGoalMut.isPending}>
                {updateGoalMut.isPending ? "Adding…" : "Add Funds"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────── */}
      <Dialog open={deleteGoalId !== null} onOpenChange={(open) => !open && setDeleteGoalId(null)}>
        <DialogContent className="max-w-[360px] text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-error text-[30px]">delete</span>
          </div>
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle>Delete Goal?</DialogTitle>
            <DialogDescription>
              This goal and all its contribution history will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDeleteGoalId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={confirmDelete}
              disabled={deleteGoalMut.isPending}
            >
              {deleteGoalMut.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingsGoals;
