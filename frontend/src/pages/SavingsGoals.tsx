import React, { useState } from "react";
import GoalCard from "../components/GoalCard";
import type { PriorityLevel } from "../components/GoalCard";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "../hooks/use-budget-data";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

const CATEGORY_ICONS: Record<string, string> = {
  Emergency: "security",
  Travel: "flight",
  Gadget: "laptop",
  Housing: "house",
  Savings: "savings",
};

const SavingsGoals: React.FC = () => {
  const { data: goals = [], isLoading } = useGoals();
  const createGoalMut = useCreateGoal();
  const updateGoalMut = useUpdateGoal();
  const deleteGoalMut = useDeleteGoal();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  
  // Add Goal Form State
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("Savings");
  
  // Contribute Form State
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeNote, setContributeNote] = useState("");

  const totalSavings = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const momentumPercent = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    createGoalMut.mutate({
      title,
      target_amount: Number(targetAmount),
      category,
      priority: 3, // Default priority (Medium)
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setTitle("");
        setTargetAmount("");
        setCategory("Savings");
      }
    });
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoalId) {
      updateGoalMut.mutate({
        goal_id: selectedGoalId,
        add_amount: Number(contributeAmount),
        note: contributeNote,
      }, {
        onSuccess: () => {
          setIsContributeOpen(false);
          setContributeAmount("");
          setContributeNote("");
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMut.mutate(id);
    }
  };

  const openContribute = (id: number) => {
    setSelectedGoalId(id);
    setIsContributeOpen(true);
  };

  return (
    <div className="flex flex-col min-h-full animate-fade-in">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-h1 text-h1 text-primary">Savings Goals</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage and track your institutional-grade financial objectives.
          </p>
        </div>
      </header>

      {/* Summary Section */}
      <section className="mb-10 w-full">
        <div className="p-8 rounded-2xl bg-primary-container text-on-primary-container shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute -right-8 -top-8 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="z-10 text-center md:text-left">
            <p className="font-label-caps text-label-caps opacity-80 mb-2">
              TOTAL SAVINGS
            </p>
            <h2 className="font-display text-display mb-3">₱{totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <div className="flex items-center gap-2 bg-primary/30 w-fit px-3 py-1.5 rounded-full mx-auto md:mx-0">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span className="font-body-sm text-body-sm">{momentumPercent.toFixed(1)}% Completed</span>
            </div>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button className="z-10 bg-primary text-on-primary px-8 py-4 rounded-xl font-h3 text-h3 hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-3 w-full md:w-auto cursor-pointer">
                <span className="material-symbols-outlined">add_circle</span>
                Add New Goal
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddGoal}>
                <DialogHeader>
                  <DialogTitle>Add New Goal</DialogTitle>
                  <DialogDescription>
                    Create a new financial goal to track your progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="target" className="text-right">
                      Target (₱)
                    </Label>
                    <Input
                      id="target"
                      type="number"
                      step="0.01"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Travel">Travel</option>
                      <option value="Gadget">Gadget</option>
                      <option value="Housing">Housing</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createGoalMut.isPending}>
                    {createGoalMut.isPending ? "Saving..." : "Save Goal"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Grid of Goals Section */}
      <section>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              // Map priority (1-5) to PriorityLevel
              let priorityLevel: PriorityLevel = "Medium";
              if (goal.priority >= 4) priorityLevel = "High";
              else if (goal.priority <= 2) priorityLevel = "Low";

              return (
                <GoalCard
                  key={goal.goal_id}
                  title={goal.title}
                  targetAmount={Number(goal.target_amount)}
                  currentAmount={Number(goal.current_amount)}
                  icon={CATEGORY_ICONS[goal.category || "Savings"] || "savings"}
                  priorityLevel={priorityLevel}
                  onContribute={() => openContribute(goal.goal_id)}
                  onDelete={() => handleDelete(goal.goal_id)}
                />
              );
            })}
            {goals.length === 0 && (
              <div className="col-span-full text-center py-12 text-on-surface-variant">
                <p>No savings goals found. Start by adding one above!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Contribute Dialog */}
      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleContribute}>
            <DialogHeader>
              <DialogTitle>Contribute to Goal</DialogTitle>
              <DialogDescription>
                Add funds to your savings goal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contributeAmount" className="text-right">
                  Amount (₱)
                </Label>
                <Input
                  id="contributeAmount"
                  type="number"
                  step="0.01"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contributeNote" className="text-right">
                  Note
                </Label>
                <Input
                  id="contributeNote"
                  value={contributeNote}
                  onChange={(e) => setContributeNote(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateGoalMut.isPending}>
                {updateGoalMut.isPending ? "Adding..." : "Add Funds"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingsGoals;
