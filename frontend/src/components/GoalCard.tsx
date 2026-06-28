import React from "react";

export type PriorityLevel = "High" | "Medium" | "Low";

export interface GoalCardProps {
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  priorityLevel?: PriorityLevel;
  deadline?: string | null;
  createdAt?: string;
  onContribute?: () => void;
  onDelete?: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// Priority drives the progress bar and badge color only — no structural gimmicks
const PRIORITY_STYLES: Record<
  PriorityLevel,
  { bar: string; badge: string; badgeText: string; dot: string }
> = {
  High: {
    bar:       "bg-rose-500",
    badge:     "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    dot:       "bg-rose-500",
  },
  Medium: {
    bar:       "bg-amber-400",
    badge:     "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    dot:       "bg-amber-400",
  },
  Low: {
    bar:       "bg-emerald-500",
    badge:     "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    dot:       "bg-emerald-400",
  },
};

function getMonthsRemaining(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  const m =
    (end.getFullYear() - now.getFullYear()) * 12 +
    (end.getMonth() - now.getMonth());
  return Math.max(0, m);
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  });
}

const GoalCard: React.FC<GoalCardProps> = ({
  title,
  targetAmount,
  currentAmount,
  icon,
  priorityLevel = "Medium",
  deadline,
  onContribute,
  onDelete,
}) => {
  const progressPct = Math.min(
    Math.round((currentAmount / targetAmount) * 100),
    100
  );
  const remaining = Math.max(0, targetAmount - currentAmount);
  const styles = PRIORITY_STYLES[priorityLevel];

  const monthsLeft = deadline ? getMonthsRemaining(deadline) : null;
  const monthlyNeeded =
    monthsLeft !== null && monthsLeft > 0
      ? Math.ceil(remaining / monthsLeft)
      : null;

  const daysLeft = deadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(deadline).getTime() - Date.now()) / 86400000
        )
      )
    : null;

  const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
  const isCompleted = progressPct >= 100;

  return (
    <div className="bg-white border border-outline-variant rounded-2xl flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 group">

      {/* Card header area */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-start">

          {/* Icon + title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-slate-600 text-[20px]">
                {isCompleted ? "check_circle" : icon}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-[15px] leading-snug">{title}</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {formatCurrency(targetAmount)} target
              </p>
            </div>
          </div>

          {/* Priority badge (dot + label) + delete */}
          <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
            {!isCompleted ? (
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${styles.badge} ${styles.badgeText}`}
              >
                {/* Simple colored dot — clear, not AI-generic */}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
                {priorityLevel}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                <span className="material-symbols-outlined text-[12px]">check</span>
                Done
              </span>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-slate-300 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Goal"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-1.5">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Saved</p>
              <p className="text-lg font-bold text-on-surface">{formatCurrency(currentAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Left</p>
              <p className="text-lg font-bold text-on-surface">{formatCurrency(remaining)}</p>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCompleted ? "bg-emerald-400" : styles.bar
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-slate-400 font-medium">{progressPct}% complete</span>
            {isCompleted && (
              <span className="text-[11px] font-bold text-emerald-600">🎉 Goal reached!</span>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mx-6" />

      {/* Analytics row */}
      <div className="px-6 py-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Monthly Goal
          </p>
          {monthlyNeeded !== null ? (
            <p className="text-[13px] font-bold text-on-surface">
              {formatCurrency(monthlyNeeded)}
              <span className="text-[10px] text-slate-400 font-normal">/mo</span>
            </p>
          ) : (
            <p className="text-[12px] text-slate-400">No deadline</p>
          )}
        </div>

        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Target Date
          </p>
          {deadline ? (
            <p className={`text-[13px] font-bold ${isUrgent ? "text-rose-600" : "text-on-surface"}`}>
              {formatDeadline(deadline)}
              <span className={`block text-[10px] font-medium ${isUrgent ? "text-rose-400" : "text-slate-400"}`}>
                {daysLeft === 0
                  ? "Due today!"
                  : isUrgent
                  ? `${daysLeft}d left!`
                  : `${daysLeft} days left`}
              </span>
            </p>
          ) : (
            <p className="text-[12px] text-slate-400">Not set</p>
          )}
        </div>
      </div>

      {/* Footer button */}
      <div className="px-6 pb-6">
        <button
          onClick={onContribute}
          disabled={isCompleted}
          className={`w-full py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
            isCompleted
              ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-default"
              : "bg-primary text-white hover:opacity-90"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCompleted ? "check_circle" : "add"}
          </span>
          {isCompleted ? "Goal Complete" : "Add Contribution"}
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
