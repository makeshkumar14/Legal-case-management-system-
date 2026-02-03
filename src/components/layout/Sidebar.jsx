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

// Role-specific color themes
const roleColors = {
  public: {
    primary: 'bg-[#b4f461]',
    primaryText: 'text-[#1a1a2e]',
    accent: 'text-[#b4f461]',
    shadow: 'shadow-[#b4f461]/20',
    hoverBg: 'hover:bg-[#b4f461]',
  },
  advocate: {
    primary: 'bg-orange-500',
    primaryText: 'text-white',
    accent: 'text-orange-400',
    shadow: 'shadow-orange-500/20',
    hoverBg: 'hover:bg-orange-500',
  },
  court: {
    primary: 'bg-red-500',
    primaryText: 'text-white',
    accent: 'text-red-400',
    shadow: 'shadow-red-500/20',
    hoverBg: 'hover:bg-red-500',
  },
};

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const menu = menuConfig[user?.role] || menuConfig.public;
  const colors = roleColors[user?.role] || roleColors.public;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-screen bg-[#1a1a2e] dark:bg-[#1a1a2e] backdrop-blur-2xl border-r border-[#2d2d45] z-40 flex flex-col transition-colors duration-300"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-5 border-b border-[#2d2d45]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-11 h-11 rounded-2xl ${colors.primary} flex items-center justify-center shadow-lg ${colors.shadow} flex-shrink-0`}>
            <Scale className={`w-6 h-6 ${user?.role === 'public' ? 'text-[#1a1a2e]' : 'text-white'}`} />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="overflow-hidden">
                <h1 className="font-bold text-white text-base whitespace-nowrap">Legal CMS</h1>
                <p className={`text-xs ${colors.accent} capitalize whitespace-nowrap`}>{user?.role} Portal</p>
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
                isActive 
                  ? `${colors.primary} ${colors.primaryText}` 
                  : 'text-[#a0a0b0] hover:bg-[#232338] hover:text-white'
              )}
            >
              {isActive && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-[#1a1a2e] rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <item.icon className={clsx('w-5 h-5 flex-shrink-0', isActive && colors.primaryText)} />
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
        className={`absolute -right-3 top-24 w-6 h-6 rounded-full bg-[#1a1a2e] border border-[#2d2d45] flex items-center justify-center ${colors.hoverBg} hover:border-transparent transition-all shadow-lg group`}
      >
        <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronLeft className={`w-4 h-4 text-[#a0a0b0] ${user?.role === 'public' ? 'group-hover:text-[#1a1a2e]' : 'group-hover:text-white'}`} />
        </motion.div>
      </button>

      {/* Settings */}
      <div className="p-3 border-t border-[#2d2d45]">
        <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#a0a0b0] hover:bg-[#232338] hover:text-white transition-all overflow-hidden">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
        </NavLink>
      </div>
    </motion.aside>
  );
}

