import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { useUiStore } from "@/stores/ui-store";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const isCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  // Shared nav link class builder
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 ease-out active:scale-[0.97] outline-none focus:outline-none border group cursor-pointer ${
      isActive
        ? "bg-white text-[#0f5a5c] font-medium shadow-[0_0_12px_rgba(0,0,0,0.06)] border-[#bccabe]/10"
        : "text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#e0e3e5] font-medium border-transparent"
    } ${isCollapsed ? "md:justify-center md:gap-0 md:px-0 md:w-10 md:h-10 md:mx-auto" : ""}`;

  const renderTooltip = (label: string) => {
    return isCollapsed ? (
      <span className="hidden md:block absolute left-14 bg-[#191c1e] text-white text-[12px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {label}
      </span>
    ) : null;
  };  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={`group fixed left-0 top-0 h-[100dvh] bg-[#f2f4f6] border-r border-[#bccabe] py-6 px-4 flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${isCollapsed ? "w-[300px] md:w-[80px] md:px-3" : "w-[300px]"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div className={`relative flex items-center px-2 mb-8 ${isCollapsed ? "md:px-0 md:justify-center" : ""}`}>
          <img
            src="/favicon-32.png"
            alt="Centra logo"
            className="w-8 h-8 object-contain shrink-0"
          />
          <div className={`ml-1 overflow-hidden transition-all duration-300 ${isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
            <h1
              className="text-[20px] leading-tight"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#1a7a5e",
                letterSpacing: "-0.3px",
              }}
            >
              centra
            </h1>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden ml-auto w-8 h-8 flex items-center justify-center border border-transparent rounded-full text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#e0e3e5] transition-all duration-300 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Desktop Toggle Button */}
          <button 
            onClick={toggleSidebar}
            className={`hidden md:flex ml-auto shrink-0 w-8 h-8 items-center justify-center border border-transparent rounded-full text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#e0e3e5] opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer z-10 ${isCollapsed ? "md:absolute md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2" : ""}`}>
            <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isCollapsed ? "" : "scale-x-[-1]"}`}>
              keyboard_tab
            </span>
          </button>
        </div>

      <div className="mx-4 mb-6 border-b border-[#bccabe]/30"></div>

      {/* Navigation Tabs */}
      <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <NavLink to="/dashboard" className={navClass} onClick={() => setMobileSidebarOpen(false)}>
          <span className="material-symbols-outlined shrink-0 text-[20px]">dashboard</span>
          <span className={`text-[14px] whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>Dashboard</span>
          {renderTooltip("Dashboard")}
        </NavLink>

        <NavLink to="/transactions" className={navClass} onClick={() => setMobileSidebarOpen(false)}>
          <span className="material-symbols-outlined shrink-0 text-[20px]">receipt_long</span>
          <span className={`text-[14px] whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>Transactions</span>
          {renderTooltip("Transactions")}
        </NavLink>

        <NavLink to="/wallets" className={navClass} onClick={() => setMobileSidebarOpen(false)}>
          <span className="material-symbols-outlined shrink-0 text-[20px]">account_balance_wallet</span>
          <span className={`text-[14px] whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>Wallets</span>
          {renderTooltip("Wallets")}
        </NavLink>

        <NavLink to="/goals" className={navClass} onClick={() => setMobileSidebarOpen(false)}>
          <span className="material-symbols-outlined shrink-0 text-[20px]">target</span>
          <span className={`text-[14px] whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>Goals</span>
          {renderTooltip("Goals")}
        </NavLink>

        <NavLink to="/kwarta-ai" className={navClass} onClick={() => setMobileSidebarOpen(false)}>
          <span className="material-symbols-outlined shrink-0 text-[20px]">auto_awesome</span>
          <span className={`text-[14px] whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>Kwarta AI</span>
          {renderTooltip("Kwarta AI")}
        </NavLink>
      </nav>

      {/* Footer Actions */}
      <div className={`mt-4 pt-4 shrink-0 border-t border-[#bccabe]/30 space-y-2 ${isCollapsed ? "md:flex md:flex-col md:items-center" : ""}`}>
        <NavLink to="/settings" className={navClass} onClick={() => setMobileSidebarOpen(false)}>
          <span className="material-symbols-outlined shrink-0 text-[20px]">settings</span>
          <span className={`text-[14px] whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>Settings</span>
          {renderTooltip("Settings")}
        </NavLink>

        <button
          onClick={async () => {
            await logout();
            window.location.href = "/";
          }}
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 ease-out active:scale-[0.97] outline-none focus:outline-none border border-transparent font-medium text-[#3d4a40] hover:text-red-600 hover:bg-red-50 hover:border-red-100 cursor-pointer ${isCollapsed ? "md:justify-center md:gap-0 md:px-0 md:w-10 md:h-10 md:mx-auto" : "w-full"} group`}
        >
          <span className="material-symbols-outlined shrink-0 text-[20px]">logout</span>
          <span className={`text-[14px] whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>Sign Out</span>
          {renderTooltip("Sign Out")}
        </button>
      </div>

      {/* Profile */}
      <div className={`mt-4 shrink-0 ${isCollapsed ? "md:flex md:justify-center" : ""}`}>
        <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${isCollapsed ? "md:p-0 md:border-transparent md:bg-transparent" : "bg-[#f2f4f6] p-4 border-[#bccabe]/50"}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? "md:justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-[#0f5a5c] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#bccabe]">
              {initials}
            </div>
            <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${isCollapsed ? "md:max-w-0 md:opacity-0" : "max-w-[200px] opacity-100"}`}>
              <p className="text-[14px] font-bold text-[#191c1e] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                {user?.username ?? "Account"}
              </p>
              <p className="text-[13px] text-[#3d4a40] truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                {user?.email ?? ""}
              </p>
            </div>
            <span className={`material-symbols-outlined text-[#3d4a40] text-sm cursor-pointer hover:text-[#0f5a5c] transition-all duration-300 ${isCollapsed ? "md:hidden" : ""}`}>
              unfold_more
            </span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
