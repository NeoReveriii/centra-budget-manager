import React from "react";
import Sidebar from "./Sidebar";
import { useUiStore } from "@/stores/ui-store";
import { AddTransactionModal } from "./AddTransactionModal";
import { TransferFundsModal } from "./TransferFundsModal";

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
  const setTransferModalOpen = useUiStore((s) => s.setTransferModalOpen);

  const openFabAction = (type: "Income" | "Expense" | "Transfer") => {
    if (type === "Transfer") {
      setTransferModalOpen(true);
    } else {
      setAddModalDefaultType(type);
      setAddModalOpen(true);
    }

    setFabOpen(false);
  };

  return (
    <div className={`min-h-screen w-full bg-background transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${isSidebarCollapsed ? "md:pl-[80px]" : "md:pl-[300px]"}`}>
      <Sidebar />
      <div className="min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-outline-variant bg-white sticky top-0 z-40">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center cursor-pointer"
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
          className={`absolute bottom-full right-0 mb-4 flex flex-col gap-3 transition-all duration-300 origin-bottom ${isFabOpen ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 translate-y-4 scale-90 invisible"}`}
          aria-hidden={!isFabOpen}
        >
          <button
            onClick={() => openFabAction("Income")}
            className="group flex items-center gap-3 bg-white border border-outline-variant px-4 py-3 rounded-2xl shadow-xl hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="font-bold text-sm text-emerald-700">
              Add Income
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">
                payments
              </span>
            </div>
          </button>
          <button
            onClick={() => openFabAction("Expense")}
            className="group flex items-center gap-3 bg-white border border-outline-variant px-4 py-3 rounded-2xl shadow-xl hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="font-bold text-sm text-rose-700">Add Expense</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">
                shopping_cart
              </span>
            </div>
          </button>
          <button
            onClick={() => openFabAction("Transfer")}
            className="group flex items-center gap-3 bg-white border border-outline-variant px-4 py-3 rounded-2xl shadow-xl hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="font-bold text-sm text-blue-700">
              Add Transfer
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">
                sync_alt
              </span>
            </div>
          </button>
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setFabOpen(!isFabOpen)}
          className={`w-16 h-16 bg-[#003527] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group ${isFabOpen ? "ring-4 ring-primary/20" : ""}`}
        >
          <span
            className={`material-symbols-outlined text-[32px] transition-transform duration-500 ${isFabOpen ? "rotate-135" : "rotate-0"}`}
          >
            add
          </span>
        </button>
      </div>

      <AddTransactionModal />
      <TransferFundsModal />
    </div>
  );
};

export default Layout;
