export const budgetQueryKeys = {
  wallets: ["wallets"] as const,
  transactions: ["transactions"] as const,
  goals: ["goals"] as const,
  chatHistory: ["chatHistory"] as const,
};

export type BudgetSyncTopic = keyof typeof budgetQueryKeys;

interface BudgetSyncMessage {
  id: string;
  sourceId: string;
  topics: BudgetSyncTopic[];
  sentAt: number;
}

const CHANNEL_NAME = "centra-budget-sync-v1";
const STORAGE_KEY = "centra-budget-sync-event";
const VALID_TOPICS = new Set<BudgetSyncTopic>([
  "wallets",
  "transactions",
  "goals",
  "chatHistory",
]);
const sourceId =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `centra-${Date.now()}-${Math.random().toString(36).slice(2)}`;

let sharedChannel: BroadcastChannel | null | undefined;

function getChannel(): BroadcastChannel | null {
  if (sharedChannel !== undefined) return sharedChannel;
  sharedChannel =
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(CHANNEL_NAME);
  return sharedChannel;
}

function isBudgetSyncMessage(value: unknown): value is BudgetSyncMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<BudgetSyncMessage>;
  return (
    typeof message.id === "string" &&
    typeof message.sourceId === "string" &&
    Array.isArray(message.topics) &&
    message.topics.every((topic) => VALID_TOPICS.has(topic))
  );
}

export function publishBudgetSync(topics: BudgetSyncTopic[]) {
  if (typeof window === "undefined") return;

  const message: BudgetSyncMessage = {
    id:
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sourceId,
    topics: [...new Set(topics)],
    sentAt: Date.now(),
  };

  const channel = getChannel();
  if (channel) {
    channel.postMessage(message);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
}

export function subscribeToBudgetSync(
  listener: (topics: BudgetSyncTopic[]) => void,
) {
  if (typeof window === "undefined") return () => undefined;

  const receive = (value: unknown) => {
    if (!isBudgetSyncMessage(value) || value.sourceId === sourceId) return;
    listener(value.topics);
  };

  const channel = getChannel();
  if (channel) {
    const handleMessage = (event: MessageEvent<unknown>) => receive(event.data);
    channel.addEventListener("message", handleMessage);
    return () => channel.removeEventListener("message", handleMessage);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      receive(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed events from unrelated local storage writes.
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}
