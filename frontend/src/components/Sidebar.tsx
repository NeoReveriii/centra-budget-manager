import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUiStore } from "@/stores/ui-store";

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/transactions", icon: "receipt_long", label: "Transactions" },
  { to: "/wallets", icon: "account_balance_wallet", label: "Wallets" },
  { to: "/goals", icon: "target", label: "Goals" },
  { to: "/kwarta-ai", icon: "auto_awesome", label: "Kwarta AI" },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const isCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  const [btnHover, setBtnHover] = useState(false);

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "U";

  // Expand sidebar on clicking empty space when collapsed
  const handleSidebarClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsed) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest(".cursor-pointer")) {
      return;
    }
    toggleSidebar();
  };

  // Nav item class — transitions width and centers in collapsed state
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center h-10 rounded-2xl cursor-pointer transition-all duration-300 ${
      isCollapsed ? "w-10 mx-auto justify-center" : "w-full"
    } ${
      isActive
        ? "bg-[#c8d8d0] text-[#0f5a5c] font-semibold"
        : "text-[#3d4a40] hover:bg-[#e0e3e5] font-medium"
    }`;

  // Label fades out quickly when collapsing — opacity is instant to hide before sidebar finishes narrowing
  const labelVisible = !isCollapsed;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        onClick={handleSidebarClick}
        className={`
          group/sidebar
          fixed left-0 top-0 h-[100dvh]
          bg-[#f2f4f6] border-r border-[#bccabe]
          flex flex-col z-50
          overflow-hidden
          transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-[300px] md:w-[80px] cursor-col-resize" : "w-[300px]"}
        `}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >

        {/* ── HEADER ──────────────────────────────────────────────
            The toggle button ALWAYS occupies px-3 from the left.
            Logo sits to its right and fades when collapsing.
        ──────────────────────────────────────────────────────── */}
        <div className="h-16 flex items-center shrink-0 px-3 relative">
          {/* Logo — fades out first, then aside narrows (opacity transition is fast) */}
          <div
            className="flex items-center gap-2 transition-opacity duration-150 pointer-events-none absolute left-[14px]"
            style={{ opacity: labelVisible ? 1 : 0 }}
            aria-hidden={isCollapsed}
          >
            <img src="/favicon-32.png" alt="Centra logo" className="w-7 h-7 object-contain shrink-0" />
            <span
              className="text-[19px] font-bold whitespace-nowrap"
              style={{ color: "#1a7a5e", letterSpacing: "-0.3px" }}
            >
              centra
            </span>
          </div>

          {/* Desktop toggle — centered when collapsed, left-aligned at expanded offset */}
          <button
            onClick={toggleSidebar}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden md:flex w-10 h-10 shrink-0 items-center justify-center rounded-full
                       text-[#3d4a40] hover:bg-[#e0e3e5] transition-[colors,left] duration-300 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer
                       absolute ${isCollapsed ? "left-5" : "left-[248px]"}`}
          >
            {isCollapsed ? (
              btnHover ? (
                <span className="material-symbols-outlined text-[22px]">menu</span>
              ) : (
                <img src="/favicon-32.png" alt="Centra logo" className="w-6 h-6 object-contain" />
              )
            ) : (
              <span className="material-symbols-outlined text-[22px]">menu_open</span>
            )}
          </button>

          {/* Mobile close button — aligned on the right */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-full
                       text-[#3d4a40] hover:bg-[#e0e3e5] transition-colors cursor-pointer ml-auto"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-3 mb-1 border-b border-[#bccabe]/30 shrink-0" />

        {/* ── NAVIGATION ──────────────────────────────────────────
            Each item: [fixed 40px icon zone] [label that fades].
            The aside's overflow:hidden clips the label as it narrows.
        ──────────────────────────────────────────────────────── */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={navLinkClass}
              title={isCollapsed ? label : undefined}
              onClick={() => setMobileSidebarOpen(false)}
            >
              {/* Icon zone — w-10 h-10, always at x=8 (px-2 on nav).
                  Never shifts regardless of sidebar state. */}
              <span className="w-10 h-10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </span>

              {/* Label — fades to opacity-0 quickly when collapsing.
                  The aside overflow:hidden is the structural clip. */}
              <span
                className={`ml-2 text-[14px] whitespace-nowrap transition-all duration-150 ${
                  isCollapsed ? "w-0 opacity-0 overflow-hidden ml-0" : "w-auto opacity-100"
                }`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div className="px-2 py-2 shrink-0 border-t border-[#bccabe]/30 space-y-0.5">
          <NavLink
            to="/settings"
            className={navLinkClass}
            title={isCollapsed ? "Settings" : undefined}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <span className="w-10 h-10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </span>
            <span
              className={`ml-2 text-[14px] whitespace-nowrap transition-all duration-150 ${
                isCollapsed ? "w-0 opacity-0 overflow-hidden ml-0" : "w-auto opacity-100"
              }`}
            >
              Settings
            </span>
          </NavLink>

          <button
            onClick={async () => {
              await logout();
              window.location.href = "/";
            }}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`flex items-center h-10 rounded-2xl cursor-pointer transition-all
                       duration-300 text-[#3d4a40] hover:text-rose-600 hover:bg-rose-50 font-medium ${
                         isCollapsed ? "w-10 mx-auto justify-center" : "w-full"
                       }`}
          >
            <span className="w-10 h-10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </span>
            <span
              className={`ml-2 text-[14px] whitespace-nowrap transition-all duration-150 ${
                isCollapsed ? "w-0 opacity-0 overflow-hidden ml-0" : "w-auto opacity-100"
              }`}
            >
              Sign Out
            </span>
          </button>
        </div>

        {/* ── PROFILE ─────────────────────────────────────────────
            Avatar always in a fixed slot (px-3 from left edge).
            Name/email/caret fade away when collapsed.
        ──────────────────────────────────────────────────────── */}
        <div className="px-2 pb-4 shrink-0">
          <div
            className={`flex items-center h-12 rounded-2xl hover:bg-[#e0e3e5]
                       cursor-pointer transition-all duration-300 ${
                         isCollapsed ? "w-10 mx-auto justify-center" : "w-full"
                       }`}
            title={isCollapsed ? (user?.username ?? "Account") : undefined}
          >
            {/* Avatar — same x-position as all icons (w-10 zone at px-2 on parent) */}
            <span className="w-10 h-10 flex items-center justify-center shrink-0">
              <span className="w-8 h-8 rounded-full bg-[#0f5a5c] text-white flex items-center
                              justify-center font-bold text-xs border border-[#0f5a5c]/20">
                {initials}
              </span>
            </span>

            {/* User info + caret — fades out with the same timing as nav labels */}
            <div
              className={`flex items-center flex-1 min-w-0 gap-1 transition-all duration-150 ${
                isCollapsed ? "w-0 opacity-0 overflow-hidden ml-0" : "w-auto opacity-100"
              }`}
              aria-hidden={isCollapsed}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#191c1e] truncate">
                  {user?.username ?? "Account"}
                </p>
                <p className="text-[12px] text-[#3d4a40] truncate">
                  {user?.email ?? ""}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#3d4a40] text-[18px] shrink-0 mr-1">
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
