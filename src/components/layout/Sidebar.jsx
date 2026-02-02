import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Calendar, Upload, Users, Settings, ChevronLeft, Scale, ClipboardList, BarChart3, Search, QrCode, Gavel } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../layouts/DashboardLayout';
import clsx from 'clsx';

const menuConfig = {
  public: [
    { path: '/public', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/public/cases', icon: FileText, label: 'My Cases' },
    { path: '/public/search', icon: Search, label: 'Search Case' },
    { path: '/public/notifications', icon: ClipboardList, label: 'Notifications' },
  ],
  advocate: [
    { path: '/advocate', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/advocate/cases', icon: FileText, label: 'Case List' },
    { path: '/advocate/evidence', icon: Upload, label: 'Evidence' },
    { path: '/advocate/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/advocate/notes', icon: ClipboardList, label: 'Notes & Tasks' },
  ],
  court: [
    { path: '/court', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/court/cases', icon: FileText, label: 'Case Management' },
    { path: '/court/hearings', icon: Gavel, label: 'Hearings' },
    { path: '/court/advocates', icon: Users, label: 'Advocates' },
    { path: '/court/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/court/qr', icon: QrCode, label: 'QR Generator' },
  ],
};

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const menu = menuConfig[user?.role] || menuConfig.public;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-screen bg-white/95 dark:bg-[#0a0f1a]/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 z-40 flex flex-col transition-colors duration-300"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-5 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="overflow-hidden">
                <h1 className="font-bold text-slate-900 dark:text-white text-base whitespace-nowrap">Legal CMS</h1>
                <p className="text-xs text-slate-500 capitalize whitespace-nowrap">{user?.role} Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}
              className={clsx(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                isActive ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {isActive && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <item.icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-indigo-400')} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-lg"
      >
        <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      {/* Settings */}
      <div className="p-3 border-t border-slate-200 dark:border-white/5">
        <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all overflow-hidden">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
        </NavLink>
      </div>
    </motion.aside>
  );
}
