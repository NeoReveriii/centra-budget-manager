import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

let themeTransitionTimer: number | undefined;

function applyDocumentTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.add("theme-changing");
  root.classList.toggle("dark", theme === "dark");

  window.clearTimeout(themeTransitionTimer);
  themeTransitionTimer = window.setTimeout(() => {
    root.classList.remove("theme-changing");
  }, 80);
}

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  fabOpen: boolean;
  theme: ThemeMode;
  highContrast: boolean;
  showCurrencySymbol: boolean;
  txSearch: string;
  txTypeFilter: string;
  txWalletFilter: string;
  txPage: number;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setFabOpen: (open: boolean) => void;
  toggleFab: () => void;
  setTheme: (theme: ThemeMode) => void;
  setHighContrast: (enabled: boolean) => void;
  setShowCurrencySymbol: (enabled: boolean) => void;
  setTxSearch: (search: string) => void;
  setTxTypeFilter: (filter: string) => void;
  setTxWalletFilter: (filter: string) => void;
  setTxPage: (page: number) => void;
  resetTxFilters: () => void;
  addModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
  addModalDefaultType: string;
  setAddModalDefaultType: (type: string) => void;
  addModalDefaultWalletId: string;
  setAddModalDefaultWalletId: (walletId: string) => void;
  transferModalOpen: boolean;
  setTransferModalOpen: (open: boolean) => void;
  transferModalFromWalletId: string;
  setTransferModalFromWalletId: (walletId: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      fabOpen: false,
      theme: "light",
      highContrast: false,
      showCurrencySymbol: true,
      txSearch: "",
      txTypeFilter: "All Types",
      txWalletFilter: "All Wallets",
      txPage: 1,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
      setFabOpen: (fabOpen) => set({ fabOpen }),
      toggleFab: () => set((s) => ({ fabOpen: !s.fabOpen })),
      setTheme: (theme) => {
        applyDocumentTheme(theme);
        set({ theme });
      },
      setHighContrast: (highContrast) => {
        document.documentElement.classList.toggle("high-contrast", highContrast);
        set({ highContrast });
      },
      setShowCurrencySymbol: (showCurrencySymbol) => set({ showCurrencySymbol }),
      setTxSearch: (txSearch) => set({ txSearch, txPage: 1 }),
      setTxTypeFilter: (txTypeFilter) => set({ txTypeFilter, txPage: 1 }),
      setTxWalletFilter: (txWalletFilter) => set({ txWalletFilter, txPage: 1 }),
      setTxPage: (txPage) => set({ txPage }),
      resetTxFilters: () =>
        set({
          txSearch: "",
          txTypeFilter: "All Types",
          txWalletFilter: "All Wallets",
          txPage: 1,
        }),
      addModalOpen: false,
      setAddModalOpen: (addModalOpen) => set({ addModalOpen }),
      addModalDefaultType: "Expense",
      setAddModalDefaultType: (addModalDefaultType) => set({ addModalDefaultType }),
      addModalDefaultWalletId: "",
      setAddModalDefaultWalletId: (addModalDefaultWalletId) =>
        set({ addModalDefaultWalletId }),
      transferModalOpen: false,
      setTransferModalOpen: (transferModalOpen) => set({ transferModalOpen }),
      transferModalFromWalletId: "",
      setTransferModalFromWalletId: (transferModalFromWalletId) =>
        set({ transferModalFromWalletId }),
    }),
    {
      name: "centra-ui",
      partialize: (state) => ({
        theme: state.theme,
        highContrast: state.highContrast,
        showCurrencySymbol: state.showCurrencySymbol,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
