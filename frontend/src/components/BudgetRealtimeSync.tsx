import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  budgetQueryKeys,
  subscribeToBudgetSync,
} from "@/lib/budget-sync";

export function BudgetRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      subscribeToBudgetSync((topics) => {
        void Promise.all(
          topics.map((topic) =>
            queryClient.invalidateQueries({
              queryKey: budgetQueryKeys[topic],
            }),
          ),
        );
      }),
    [queryClient],
  );

  return null;
}
