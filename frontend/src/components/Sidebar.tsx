import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#f2f4f6] border-r border-[#bccabe] py-6 px-4 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 bg-[#0f5a5c] rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">account_balance</span>
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-[#191c1e] leading-tight">
            Centra
          </h1>
        </div>
        <button className="ml-auto p-1.5 flex items-center justify-center border border-[#bccabe]/30 rounded-lg bg-white text-[#3d4a40] hover:text-[#0f5a5c] transition-colors">
          <span className="material-symbols-outlined text-[20px] scale-x-[-1]">
            keyboard_tab
          </span>
        </button>
      </div>

      <div className="mx-4 mb-6 border-b border-[#bccabe]/30"></div>

      {/* Navigation Tabs */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 ease-out active:scale-[0.97] outline-none focus:outline-none border group ${isActive
              ? "bg-white text-[#0f5a5c] font-['Inter'] font-medium shadow-[0_0_12px_rgba(0,0,0,0.06)] border-[#bccabe]/10"
              : "text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#e0e3e5] font-['Inter'] font-medium border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[14px]">Dashboard</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 ease-out active:scale-[0.97] outline-none focus:outline-none border group ${isActive
              ? "bg-white text-[#0f5a5c] font-['Inter'] font-medium shadow-[0_0_12px_rgba(0,0,0,0.06)] border-[#bccabe]/10"
              : "text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#e0e3e5] font-['Inter'] font-medium border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[14px]">Transactions</span>
        </NavLink>

        <NavLink
          to="/wallets"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 ease-out active:scale-[0.97] outline-none focus:outline-none border group ${isActive
              ? "bg-white text-[#0f5a5c] font-['Inter'] font-medium shadow-[0_0_12px_rgba(0,0,0,0.06)] border-[#bccabe]/10"
              : "text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#e0e3e5] font-['Inter'] font-medium border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-[14px]">Wallets</span>
        </NavLink>

        <NavLink
          to="/goals"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 ease-out active:scale-[0.97] outline-none focus:outline-none border group ${isActive
              ? "bg-white text-[#0f5a5c] font-['Inter'] font-medium shadow-[0_0_12px_rgba(0,0,0,0.06)] border-[#bccabe]/10"
              : "text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#e0e3e5] font-['Inter'] font-medium border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">target</span>
          <span className="text-[14px]">Goals</span>
        </NavLink>

        <NavLink
          to="/kwarta-ai"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 ease-out active:scale-[0.97] outline-none focus:outline-none border group ${isActive
              ? "bg-white text-[#0f5a5c] font-['Inter'] font-medium shadow-[0_0_12px_rgba(0,0,0,0.06)] border-[#bccabe]/10"
              : "text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#e0e3e5] font-['Inter'] font-medium border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="text-[14px]">Kwarta AI</span>
        </NavLink>
      </nav>

      {/* Footer Actions */}
      <div className="mt-4 pt-4 border-t border-[#bccabe]/30 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-300 ease-out active:scale-[0.97] outline-none focus:outline-none border group ${isActive
              ? "bg-white text-[#0f5a5c] font-['Inter'] font-medium shadow-[0_0_12px_rgba(0,0,0,0.06)] border-[#bccabe]/10"
              : "text-[#3d4a40] hover:text-[#0f5a5c] hover:bg-[#f2f4f6] font-['Inter'] font-medium border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[14px]">Settings</span>
        </NavLink>
        <button
          onClick={async () => {
            await logout();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[#3d4a40] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
        >
          <span className="material-symbols-outlined group-hover:text-red-600">logout</span>
          <span className="text-[14px] font-medium">Sign Out</span>
        </button>
      </div>

      {/* Pro Mode & Profile */}
      <div className="mt-6">
        <div className="bg-[#f2f4f6] rounded-xl p-4 border border-[#bccabe]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0f5a5c] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#bccabe]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-[#191c1e] truncate font-['Inter']">
                {user?.username ?? "Account"}
              </p>
              <p className="text-[13px] text-[#3d4a40] truncate font-['Inter']">
                {user?.email ?? ""}
              </p>
            </div>
            <span className="material-symbols-outlined text-[#3d4a40] text-sm cursor-pointer hover:text-[#0f5a5c] transition-colors">
              unfold_more
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
