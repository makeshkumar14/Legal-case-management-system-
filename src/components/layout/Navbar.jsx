import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, Search, ChevronDown, LogOut, User, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '../../data/mockData';
import clsx from 'clsx';

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  return (
    <header className="h-16 bg-white/80 dark:bg-[#1a1a2e]/90 backdrop-blur-xl border-b border-[#e5e4df] dark:border-[#2d2d45] flex items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-300">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        {breadcrumbs.map((c, i) => (
          <div key={c.path} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-4 h-4 text-[#6b6b80]" />}
            <span className={clsx('text-sm', i === breadcrumbs.length - 1 ? 'text-[#1a1a2e] dark:text-white font-medium' : 'text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white cursor-pointer')} onClick={() => i < breadcrumbs.length - 1 && navigate(c.path)}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] group-focus-within:text-[#b4f461] transition-colors" />
          <input type="text" placeholder="Search..."
            className="w-48 focus:w-64 pl-10 pr-4 py-2 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#b4f461]/30 focus:border-[#b4f461] transition-all duration-300" />
        </div>

        {/* Theme */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:bg-[#efeee9] dark:hover:bg-[#2d2d45] hover:border-[#b4f461] transition-colors">
          {isDark ? <Sun className="w-4 h-4 text-[#b4f461]" /> : <Moon className="w-4 h-4 text-[#1a1a2e]" />}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:bg-[#efeee9] dark:hover:bg-[#2d2d45] hover:border-[#b4f461] transition-colors relative">
            <Bell className="w-4 h-4 text-[#6b6b80]" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b4f461] rounded-full text-[10px] font-bold text-[#1a1a2e] flex items-center justify-center">{unreadCount}</span>}
          </motion.button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-[#e5e4df] dark:border-[#2d2d45] flex justify-between items-center">
                  <span className="font-semibold text-[#1a1a2e] dark:text-white text-sm">Notifications</span>
                  <span className="text-xs text-[#b4f461] cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.slice(0, 4).map(n => (
                    <div key={n.id} className={clsx('p-4 border-b border-[#e5e4df] dark:border-[#2d2d45] hover:bg-[#f7f6f3] dark:hover:bg-[#232338] cursor-pointer', !n.read && 'bg-[#b4f461]/10')}>
                      <p className="text-sm font-medium text-[#1a1a2e] dark:text-white">{n.title}</p>
                      <p className="text-xs text-[#6b6b80] mt-1 line-clamp-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:bg-[#efeee9] dark:hover:bg-[#2d2d45] hover:border-[#b4f461] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#b4f461] flex items-center justify-center text-[#1a1a2e] text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-[#1a1a2e] dark:text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[#b4f461] capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#6b6b80] hidden md:block" />
          </motion.button>
          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-44 bg-white dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-2xl shadow-2xl overflow-hidden">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f7f6f3] dark:hover:bg-[#232338] text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white text-sm"><User className="w-4 h-4" />Profile</button>
                <div className="h-px bg-[#e5e4df] dark:bg-[#2d2d45]" />
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 text-sm"><LogOut className="w-4 h-4" />Logout</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {(showNotifications || showProfile) && <div className="fixed inset-0 z-[-1]" onClick={() => { setShowNotifications(false); setShowProfile(false); }} />}
    </header>
  );
}
