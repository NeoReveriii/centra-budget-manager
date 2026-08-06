import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
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

export const budgetQueryKeys = {
  wallets: ["wallets"] as const,
  transactions: ["transactions"] as const,
  goals: ["goals"] as const,
  chatHistory: ["chatHistory"] as const,
};

export const LIVE_REFRESH_INTERVAL_MS = 10_000;

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
    refetchInterval: LIVE_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useTransactions() {
  const identity = useBudgetQueryIdentity();
  return useQuery({
    queryKey: [...budgetQueryKeys.transactions, identity.accountId],
    queryFn: fetchTransactions,
    enabled: identity.enabled,
    refetchInterval: LIVE_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useGoals() {
  const identity = useBudgetQueryIdentity();
  return useQuery({
    queryKey: [...budgetQueryKeys.goals, identity.accountId],
    queryFn: fetchGoals,
    enabled: identity.enabled,
    refetchInterval: LIVE_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions }),
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets }),
      ]);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions }),
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets }),
      ]);
    },
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWallet,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWallet,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets }),
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions }),
      ]);
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWallet,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets }),
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions }),
      ]);
    },
  });
}

export function useTransferFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferFunds,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets }),
        queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions }),
      ]);
    },
  });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearChatHistory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetQueryKeys.chatHistory });
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetQueryKeys.goals });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetQueryKeys.goals });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetQueryKeys.goals });
    },
  });
}

export type { Transaction, Wallet, Goal };
