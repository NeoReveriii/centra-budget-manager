import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  fabOpen: boolean;
  theme: ThemeMode;
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
  setTxSearch: (search: string) => void;
  setTxTypeFilter: (filter: string) => void;
  setTxWalletFilter: (filter: string) => void;
  setTxPage: (page: number) => void;
  resetTxFilters: () => void;
  addModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
  addModalDefaultType: string;
  setAddModalDefaultType: (type: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      fabOpen: false,
      theme: "light",
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
        document.documentElement.classList.toggle("dark", theme === "dark");
        set({ theme });
      },
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
    }),
    {
      name: "centra-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
