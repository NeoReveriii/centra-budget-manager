import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearChatHistory,
  createTransaction,
  createWallet,
  deleteTransaction,
  deleteWallet,
  fetchChatHistory,
  fetchGoals,
  fetchTransactions,
  fetchWallets,
  transferFunds,
  type Transaction,
  type Wallet,
} from "@/lib/api";

export const budgetQueryKeys = {
  wallets: ["wallets"] as const,
  transactions: ["transactions"] as const,
  goals: ["goals"] as const,
  chatHistory: ["chatHistory"] as const,
};

export function useWallets() {
  return useQuery({
    queryKey: budgetQueryKeys.wallets,
    queryFn: fetchWallets,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: budgetQueryKeys.transactions,
    queryFn: fetchTransactions,
  });
}

export function useGoals() {
  return useQuery({
    queryKey: budgetQueryKeys.goals,
    queryFn: fetchGoals,
  });
}

export function useChatHistory(enabled = true) {
  return useQuery({
    queryKey: budgetQueryKeys.chatHistory,
    queryFn: fetchChatHistory,
    enabled,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets });
    },
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions });
    },
  });
}

export function useTransferFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferFunds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.transactions });
    },
  });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearChatHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.chatHistory });
    },
  });
}

export type { Transaction, Wallet };
