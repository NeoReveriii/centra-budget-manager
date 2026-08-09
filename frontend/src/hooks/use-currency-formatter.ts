import { useCallback } from "react";
import { useUiStore } from "@/stores/ui-store";

interface CurrencyFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatPesoAmount(
  amount: number,
  showCurrencySymbol: boolean,
  options: CurrencyFormatOptions = {},
): string {
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;

  return new Intl.NumberFormat("en-PH", {
    style: showCurrencySymbol ? "currency" : "decimal",
    ...(showCurrencySymbol
      ? { currency: "PHP", currencyDisplay: "narrowSymbol" as const }
      : {}),
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

export function useCurrencyFormatter(options: CurrencyFormatOptions = {}) {
  const showCurrencySymbol = useUiStore((state) => state.showCurrencySymbol);
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;

  return useCallback(
    (amount: number) =>
      formatPesoAmount(amount, showCurrencySymbol, {
        minimumFractionDigits,
        maximumFractionDigits,
      }),
    [showCurrencySymbol, minimumFractionDigits, maximumFractionDigits],
  );
}
