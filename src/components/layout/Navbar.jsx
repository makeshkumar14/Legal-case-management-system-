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
    <header className="h-16 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        {breadcrumbs.map((c, i) => (
          <div key={c.path} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-4 h-4 text-slate-700" />}
            <span className={clsx('text-sm', i === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-slate-500 hover:text-white cursor-pointer')} onClick={() => i < breadcrumbs.length - 1 && navigate(c.path)}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
          <input type="text" placeholder="Search..."
            className="w-48 focus:w-64 pl-10 pr-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all duration-300" />
        </div>

        {/* Theme */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors relative">
            <Bell className="w-4 h-4 text-slate-400" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{unreadCount}</span>}
          </motion.button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-80 bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                  <span className="font-semibold text-white text-sm">Notifications</span>
                  <span className="text-xs text-indigo-400 cursor-pointer">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.slice(0, 4).map(n => (
                    <div key={n.id} className={clsx('p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer', !n.read && 'bg-indigo-500/5')}>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{n.message}</p>
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
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500 hidden md:block" />
          </motion.button>
          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-44 bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-300 text-sm"><User className="w-4 h-4" />Profile</button>
                <div className="h-px bg-white/5" />
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 text-sm"><LogOut className="w-4 h-4" />Logout</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {(showNotifications || showProfile) && <div className="fixed inset-0 z-[-1]" onClick={() => { setShowNotifications(false); setShowProfile(false); }} />}
    </header>
  );
}
