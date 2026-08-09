import React from "react";
import Sidebar from "./Sidebar";
import { useUiStore } from "@/stores/ui-store";
import { AddTransactionModal } from "./AddTransactionModal";
import { TransferFundsModal } from "./TransferFundsModal";
import { ArrowRightLeft, Plus, TrendingDown, TrendingUp, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isFabOpen = useUiStore((s) => s.fabOpen);
  const isSidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const setFabOpen = useUiStore((s) => s.setFabOpen);
  const setAddModalOpen = useUiStore((s) => s.setAddModalOpen);
  const setAddModalDefaultType = useUiStore((s) => s.setAddModalDefaultType);
  const setAddModalDefaultWalletId = useUiStore((s) => s.setAddModalDefaultWalletId);
  const setTransferModalOpen = useUiStore((s) => s.setTransferModalOpen);
  const setTransferModalFromWalletId = useUiStore((s) => s.setTransferModalFromWalletId);

  const openFabAction = (type: "Expense" | "Income" | "Transfer") => {
    if (type === "Transfer") {
      setTransferModalFromWalletId("");
      setTransferModalOpen(true);
    } else {
      setAddModalDefaultType(type);
      setAddModalDefaultWalletId("");
      setAddModalOpen(true);
    }

    setFabOpen(false);
  };

  return (
    <div className={`min-h-screen w-full bg-background transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] dark:bg-[#0a0a0a] ${isSidebarCollapsed ? "md:pl-[80px]" : "md:pl-[300px]"}`}>
      <Sidebar />
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#0a0a0a]">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-outline-variant bg-white p-4 dark:border-[#343434] dark:bg-[#121212] md:hidden">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center cursor-pointer dark:text-[#ededed] dark:hover:bg-[#242424]"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-bold text-primary text-lg" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.3px" }}>
            centra
          </h1>
          <div className="w-10"></div> {/* Spacer for center alignment */}
        </header>
        
        <main className="flex-1 pt-6 pb-12 px-4 md:pt-10 md:px-12 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Contextual FAB for Transaction */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {/* Animated Menu (Expanding Upwards) */}
        <div
          className={`absolute bottom-full right-0 mb-3 flex flex-col gap-2 transition-all duration-300 origin-bottom ${isFabOpen ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 translate-y-4 scale-90 invisible"}`}
          aria-hidden={!isFabOpen}
        >
          <button
            type="button"
            aria-label="Add expense"
            onClick={() => openFabAction("Expense")}
            className="group flex min-h-14 w-52 items-center justify-between gap-3 rounded-xl border border-outline-variant bg-white px-3 py-2 text-left shadow-[0_10px_24px_rgba(15,23,42,0.1)] transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:shadow-[0_14px_28px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30 active:translate-y-0"
          >
            <span className="text-sm font-extrabold text-slate-800">Add expenses</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 transition-transform duration-200 group-hover:scale-105">
              <TrendingDown className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </span>
          </button>
          <button
            type="button"
            aria-label="Add income"
            onClick={() => openFabAction("Income")}
            className="group flex min-h-14 w-52 items-center justify-between gap-3 rounded-xl border border-outline-variant bg-white px-3 py-2 text-left shadow-[0_10px_24px_rgba(15,23,42,0.1)] transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-[0_14px_28px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 active:translate-y-0"
          >
            <span className="text-sm font-extrabold text-slate-800">Add income</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-transform duration-200 group-hover:scale-105">
              <TrendingUp className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </span>
          </button>
          <button
            type="button"
            aria-label="Add transfer"
            onClick={() => openFabAction("Transfer")}
            className="group flex min-h-14 w-52 items-center justify-between gap-3 rounded-xl border border-outline-variant bg-white px-3 py-2 text-left shadow-[0_10px_24px_rgba(15,23,42,0.1)] transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow-[0_14px_28px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 active:translate-y-0"
          >
            <span className="text-sm font-extrabold text-slate-800">Add transfer</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-transform duration-200 group-hover:scale-105">
              <ArrowRightLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </span>
          </button>
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setFabOpen(!isFabOpen)}
          aria-label={isFabOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={isFabOpen}
          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003527] text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group ${isFabOpen ? "ring-4 ring-primary/20" : ""}`}
        >
          {isFabOpen ? (
            <X className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Plus className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      <AddTransactionModal />
      <TransferFundsModal />
    </div>
  );
};

export default Layout;
