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

const PRIORITY_STYLES: Record<PriorityLevel, {
  badge: string;
  bar: string;
  leftBorder: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  label: string;
}> = {
  High: {
    badge: "bg-rose-100 text-rose-700 border-rose-300",
    bar: "bg-rose-500",
    leftBorder: "border-l-rose-500",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    icon: "priority_high",
    label: "High Priority",
  },
  Medium: {
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    bar: "bg-amber-400",
    leftBorder: "border-l-amber-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    icon: "density_medium",
    label: "Medium Priority",
  },
  Low: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-300",
    bar: "bg-emerald-500",
    leftBorder: "border-l-emerald-400",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    icon: "expand_more",
    label: "Low Priority",
  },
};

function getMonthsRemaining(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  const months =
    (end.getFullYear() - now.getFullYear()) * 12 +
    (end.getMonth() - now.getMonth());
  return Math.max(0, months);
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
  const progressPct = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  const remaining = targetAmount - currentAmount;
  const styles = PRIORITY_STYLES[priorityLevel];

  // Analytics
  const monthsLeft = deadline ? getMonthsRemaining(deadline) : null;
  const monthlyNeeded =
    monthsLeft !== null && monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : null;

  // Days until deadline
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000))
    : null;

  const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
  const isCompleted = progressPct >= 100;

  return (
    <div
      className={`bg-white border border-outline-variant border-l-4 ${
        isCompleted ? "border-l-emerald-400" : styles.leftBorder
      } rounded-2xl flex flex-col gap-0 hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
    >
      {/* No generic top bar — left border IS the indicator */}

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isCompleted ? "bg-emerald-50" : styles.iconBg
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${
                isCompleted ? "text-emerald-600" : styles.iconColor
              }`}>
                {isCompleted ? "check_circle" : icon}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-[15px] leading-tight">{title}</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Target: {formatCurrency(targetAmount)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Priority badge with icon */}
            {!isCompleted ? (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider uppercase flex items-center gap-1 ${styles.badge}`}>
                <span className="material-symbols-outlined text-[11px]">{styles.icon}</span>
                {priorityLevel}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider uppercase flex items-center gap-1 bg-emerald-100 text-emerald-700 border-emerald-300">
                <span className="material-symbols-outlined text-[11px]">verified</span>
                Done
              </span>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-slate-300 hover:text-error transition-colors opacity-0 group-hover:opacity-100 mt-1"
                title="Delete Goal"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Saved</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(currentAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Remaining</p>
              <p className="text-xl font-bold text-on-surface">{formatCurrency(Math.max(0, remaining))}</p>
            </div>
          </div>

          <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCompleted ? "bg-emerald-400" : styles.bar
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] font-bold text-slate-500">{progressPct}% complete</span>
            {isCompleted && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Goal reached!
              </span>
            )}
          </div>
        </div>

        {/* Analytics row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Monthly needed */}
          <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">calendar_month</span>
              Monthly Goal
            </p>
            {monthlyNeeded !== null ? (
              <p className="text-[13px] font-bold text-on-surface">{formatCurrency(monthlyNeeded)}</p>
            ) : (
              <p className="text-[12px] text-slate-400 italic">No deadline set</p>
            )}
          </div>

          {/* Deadline / days left */}
          <div
            className={`rounded-xl px-3 py-2.5 border ${
              isUrgent
                ? "bg-rose-50 border-rose-200"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <p
              className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${
                isUrgent ? "text-rose-400" : "text-slate-400"
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">flag</span>
              Target Date
            </p>
            {deadline ? (
              <p
                className={`text-[13px] font-bold ${
                  isUrgent ? "text-rose-700" : "text-on-surface"
                }`}
              >
                {formatDeadline(deadline)}
                {daysLeft !== null && (
                  <span
                    className={`block text-[10px] font-medium mt-0.5 ${
                      isUrgent ? "text-rose-500" : "text-slate-400"
                    }`}
                  >
                    {daysLeft === 0
                      ? "Due today!"
                      : isUrgent
                      ? `${daysLeft}d left — urgent!`
                      : `${daysLeft} days left`}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-[12px] text-slate-400 italic">No date set</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer action */}
      <div className="px-6 pb-6">
        <button
          onClick={onContribute}
          disabled={isCompleted}
          className={`w-full py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isCompleted
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
              : "bg-primary text-white hover:opacity-90 shadow-sm"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCompleted ? "check" : "payments"}
          </span>
          {isCompleted ? "Completed!" : "Contribute"}
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
