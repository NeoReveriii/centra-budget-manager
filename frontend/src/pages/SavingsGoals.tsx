import React from "react";
import GoalCard from "../components/GoalCard";
import type { PriorityLevel } from "../components/GoalCard";

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  priorityLevel: PriorityLevel;
  nextMilestoneAmount?: number;
}

const SavingsGoals: React.FC = () => {
  const MOCK_GOALS: Goal[] = [
    {
      id: "1",
      title: "Emergency Fund",
      targetAmount: 300000,
      currentAmount: 180000,
      icon: "security",
      priorityLevel: "High",
      nextMilestoneAmount: 5000,
    },
    {
      id: "2",
      title: "Japan Trip",
      targetAmount: 45000,
      currentAmount: 38250,
      icon: "flight",
      priorityLevel: "Medium",
      nextMilestoneAmount: 2000,
    },
    {
      id: "3",
      title: "New Laptop",
      targetAmount: 85000,
      currentAmount: 21250,
      icon: "laptop",
      priorityLevel: "Low",
      nextMilestoneAmount: 12000,
    },
    {
      id: "4",
      title: "House Downpayment",
      targetAmount: 1500000,
      currentAmount: 300000,
      icon: "house",
      priorityLevel: "High",
      nextMilestoneAmount: 50000,
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
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
            <h2 className="font-display text-display mb-3">₱1,480,000</h2>
            <div className="flex items-center gap-2 bg-primary/30 w-fit px-3 py-1.5 rounded-full mx-auto md:mx-0">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span className="font-body-sm text-body-sm">+12.4% Momentum</span>
            </div>
          </div>

          <button className="z-10 bg-primary text-on-primary px-8 py-4 rounded-xl font-h3 text-h3 hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-3 w-full md:w-auto">
            <span className="material-symbols-outlined">add_circle</span>
            Add New Goal
          </button>
        </div>
      </section>

      {/* Grid of Goals Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_GOALS.map((goal) => (
            <GoalCard
              key={goal.id}
              title={goal.title}
              targetAmount={goal.targetAmount}
              currentAmount={goal.currentAmount}
              icon={goal.icon}
              priorityLevel={goal.priorityLevel}
              nextMilestoneAmount={goal.nextMilestoneAmount}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default SavingsGoals;
