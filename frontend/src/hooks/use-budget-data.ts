import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  budgetQueryKeys,
  publishBudgetSync,
  type BudgetSyncTopic,
} from "@/lib/budget-sync";
import {
  clearChatHistory,
  createTransaction,
  createWallet,
  deleteTransaction,
  deleteWallet,
  fetchChatHistory,
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  fetchTransactions,
  fetchWallets,
  transferFunds,
  updateWallet,
  type Transaction,
  type Wallet,
  type Goal,
} from "@/lib/api";

export { budgetQueryKeys } from "@/lib/budget-sync";

async function synchronizeBudgetQueries(
  queryClient: QueryClient,
  topics: BudgetSyncTopic[],
) {
  publishBudgetSync(topics);
  await Promise.all(
    topics.map((topic) =>
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys[topic] }),
    ),
  );
}

function useBudgetQueryIdentity(enabled = true) {
  const { user, isAuthenticated, isLoading } = useAuth();
  return {
    accountId: user?.acc_id ?? "anonymous",
    enabled: enabled && isAuthenticated && !isLoading,
  };
}

export function useWallets() {
  const identity = useBudgetQueryIdentity();
  return useQuery({
    queryKey: [...budgetQueryKeys.wallets, identity.accountId],
    queryFn: fetchWallets,
    enabled: identity.enabled,
  });
}

export function useTransactions() {
  const identity = useBudgetQueryIdentity();
  return useQuery({
    queryKey: [...budgetQueryKeys.transactions, identity.accountId],
    queryFn: fetchTransactions,
    enabled: identity.enabled,
  });
}

export function useGoals() {
  const identity = useBudgetQueryIdentity();
  return useQuery({
    queryKey: [...budgetQueryKeys.goals, identity.accountId],
    queryFn: fetchGoals,
    enabled: identity.enabled,
  });
}

export function useChatHistory(enabled = true) {
  const identity = useBudgetQueryIdentity(enabled);
  return useQuery({
    queryKey: [...budgetQueryKeys.chatHistory, identity.accountId],
    queryFn: fetchChatHistory,
    enabled: identity.enabled,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: async (transaction) => {
      queryClient.setQueriesData<Transaction[]>(
        { queryKey: budgetQueryKeys.transactions },
        (current) =>
          current
            ? [
                transaction,
                ...current.filter(
                  (item) => item.trans_id !== transaction.trans_id,
                ),
              ]
            : current,
      );
      await synchronizeBudgetQueries(queryClient, ["transactions", "wallets"]);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: async (transaction) => {
      if (transaction) {
        queryClient.setQueriesData<Transaction[]>(
          { queryKey: budgetQueryKeys.transactions },
          (current) =>
            current?.filter(
              (item) => item.trans_id !== transaction.trans_id,
            ),
        );
      }
      await synchronizeBudgetQueries(queryClient, ["transactions", "wallets"]);
    },
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWallet,
    onSuccess: async ({ wallet }) => {
      queryClient.setQueriesData<Wallet[]>(
        { queryKey: budgetQueryKeys.wallets },
        (current) =>
          current
            ? [
                ...current,
                {
                  ...wallet,
                  calculated_balance:
                    wallet.calculated_balance ?? wallet.initial_balance,
                },
              ]
            : current,
      );
      await synchronizeBudgetQueries(queryClient, ["wallets"]);
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWallet,
    onSuccess: async () => {
      await synchronizeBudgetQueries(queryClient, ["wallets", "transactions"]);
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWallet,
    onSuccess: async (_, walletId) => {
      queryClient.setQueriesData<Wallet[]>(
        { queryKey: budgetQueryKeys.wallets },
        (current) =>
          current?.filter((wallet) => wallet.wallet_id !== walletId),
      );
      await synchronizeBudgetQueries(queryClient, ["wallets", "transactions"]);
    },
  });
}

export function useTransferFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferFunds,
    onSuccess: async ({ row }) => {
      queryClient.setQueriesData<Transaction[]>(
        { queryKey: budgetQueryKeys.transactions },
        (current) =>
          current
            ? [
                row,
                ...current.filter((item) => item.trans_id !== row.trans_id),
              ]
            : current,
      );
      await synchronizeBudgetQueries(queryClient, ["wallets", "transactions"]);
    },
  });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearChatHistory,
    onSuccess: async () => {
      queryClient.setQueriesData(
        { queryKey: budgetQueryKeys.chatHistory },
        () => [],
      );
      await synchronizeBudgetQueries(queryClient, ["chatHistory"]);
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: async ({ goal }) => {
      queryClient.setQueriesData<Goal[]>(
        { queryKey: budgetQueryKeys.goals },
        (current) => (current ? [...current, goal] : current),
      );
      await synchronizeBudgetQueries(queryClient, ["goals"]);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGoal,
    onSuccess: async ({ goal }) => {
      queryClient.setQueriesData<Goal[]>(
        { queryKey: budgetQueryKeys.goals },
        (current) =>
          current?.map((item) => (item.goal_id === goal.goal_id ? goal : item)),
      );
      await synchronizeBudgetQueries(queryClient, ["goals"]);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: async (_, goalId) => {
      queryClient.setQueriesData<Goal[]>(
        { queryKey: budgetQueryKeys.goals },
        (current) => current?.filter((goal) => goal.goal_id !== goalId),
      );
      await synchronizeBudgetQueries(queryClient, ["goals"]);
    },
  });
}

export type { Transaction, Wallet, Goal };
