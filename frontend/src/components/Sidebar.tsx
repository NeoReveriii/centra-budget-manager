import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CentraBrand } from '@/components/CentraBrand';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <CentraBrand variant="text" to="/dashboard" className="h-8" />
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-colors ${
              isActive 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-primary border-l-4 border-primary' 
                : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
        </NavLink>
        
        <NavLink 
          to="/transactions" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-colors ${
              isActive 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-primary border-l-4 border-primary' 
                : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span> Transactions
        </NavLink>
        
        <NavLink 
          to="/wallets" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-colors ${
              isActive 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-primary border-l-4 border-primary' 
                : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span> Wallets
        </NavLink>
        
        <NavLink 
          to="/goals" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-colors ${
              isActive 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-primary border-l-4 border-primary' 
                : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">target</span> Goals
        </NavLink>
        
        <NavLink 
          to="/kwarta-ai" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-colors ${
              isActive 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-primary border-l-4 border-primary' 
                : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span> Kwarta AI
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 overflow-hidden min-w-0">
          <div className="font-bold text-body-sm text-on-background dark:text-slate-100 truncate">
            {user?.username ?? 'Account'}
          </div>
          <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{user?.email ?? ''}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            title="Sign Out"
            className="text-slate-400 hover:text-error p-1 rounded-md transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
          <NavLink 
            to="/settings" 
            title="Settings"
            className={({ isActive }) => 
              `text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors ${isActive ? 'text-primary' : ''}`
            }
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

