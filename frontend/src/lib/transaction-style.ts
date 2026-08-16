export interface TransactionStyle {
  icon: string;
  iconBg: string;
  iconColor: string;
}

const TRANSACTION_STYLES: Record<string, TransactionStyle> = {
  food: {
    icon: "restaurant",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  dining: {
    icon: "restaurant",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  lunch: {
    icon: "restaurant",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  grocery: {
    icon: "shopping_cart",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  transport: {
    icon: "commute",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  commute: {
    icon: "commute",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  grab: {
    icon: "commute",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  travel: {
    icon: "flight_takeoff",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  trip: {
    icon: "flight_takeoff",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  savings: {
    icon: "savings",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
  },
  money: {
    icon: "payments",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  cash: {
    icon: "payments",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  salary: {
    icon: "payments",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  income: {
    icon: "payments",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  freelance: {
    icon: "work",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  bill: { icon: "receipt_long", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  bills: { icon: "receipt_long", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  electric: {
    icon: "bolt",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  internet: { icon: "wifi", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  shopping: {
    icon: "shopping_bag",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  subscription: {
    icon: "subscriptions",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  netflix: {
    icon: "subscriptions",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  health: {
    icon: "fitness_center",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  gym: {
    icon: "fitness_center",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  gas: {
    icon: "local_gas_station",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  coffee: {
    icon: "coffee",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  game: {
    icon: "sports_esports",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  transfer: {
    icon: "sync_alt",
    iconBg: "bg-surface-container-low",
    iconColor: "text-on-surface-variant",
  },
  other: {
    icon: "receipt_long",
    iconBg: "bg-surface-container-low",
    iconColor: "text-on-surface-variant",
  },
};

export function getTransactionStyle(
  category: string | null | undefined,
  description: string | null | undefined,
  type: string,
): TransactionStyle {
  const source = `${category || ""} ${description || ""}`.toLowerCase();

  for (const [key, style] of Object.entries(TRANSACTION_STYLES)) {
    if (source.includes(key)) return style;
  }

  if (type === "Income") return TRANSACTION_STYLES.income;
  if (type === "Transfer") return TRANSACTION_STYLES.transfer;
  return TRANSACTION_STYLES.other;
}
