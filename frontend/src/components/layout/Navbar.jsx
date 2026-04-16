import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronDown, LogOut, User, ChevronRight, ExternalLink, CheckCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { DATA_SYNC_EVENT, notificationsAPI } from '../../services/api';
import { getRoleTheme } from '../../utils/roleTheme';
import clsx from 'clsx';

function getSearchTarget(role, query) {
  const trimmed = query.trim();
  if (!trimmed) return null;
  if (role === 'public') return `/${role}/search?q=${encodeURIComponent(trimmed)}`;
  return `/${role}/cases?q=${encodeURIComponent(trimmed)}`;
}

export function Navbar() {
  useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = getRoleTheme(user?.role);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.list();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [location.pathname]);

  useEffect(() => {
    const syncNotifications = (event) => {
      if (!event?.detail?.scope || event.detail.scope === 'notifications' || event.detail.scope === 'cases') {
        fetchNotifications();
      }
    };

    window.addEventListener(DATA_SYNC_EVENT, syncNotifications);
    return () => window.removeEventListener(DATA_SYNC_EVENT, syncNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  const searchPlaceholder = useMemo(() => {
    if (user?.role === 'public') return 'Search case number or party...';
    if (user?.role === 'advocate') return 'Search assigned cases...';
    return 'Search court cases...';
  }, [user?.role]);

  const handleSearch = () => {
    const target = getSearchTarget(user?.role, searchQuery);
    if (target) navigate(target);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead(notifications);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#1a1a2e]/90 backdrop-blur-xl border-b border-[#e5e4df] dark:border-[#2d2d45] flex items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-2 min-w-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2 min-w-0">
            {index > 0 && <ChevronRight className="w-4 h-4 text-[#6b6b80] flex-shrink-0" />}
            <span
              className={clsx(
                'text-sm truncate',
                index === breadcrumbs.length - 1
                  ? 'text-[#1a1a2e] dark:text-white font-medium'
                  : 'text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white cursor-pointer'
              )}
              onClick={() => index < breadcrumbs.length - 1 && navigate(crumb.path)}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative group hidden md:block">
          <Search className={clsx('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80] transition-colors', theme.accentText)} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={searchPlaceholder}
            className={clsx(
              'w-52 focus:w-72 pl-10 pr-4 py-2 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none transition-all duration-300',
              theme.accentRing
            )}
          />
        </div>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications((value) => !value)}
            className="p-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:bg-[#efeee9] dark:hover:bg-[#2d2d45] transition-colors relative"
          >
            <Bell className="w-4 h-4 text-[#6b6b80]" />
            {unreadCount > 0 && (
              <span className={clsx('absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center', theme.accentBg)}>
                {unreadCount}
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-[22rem] bg-white border-2 border-[#e5e4df] rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-[#e5e4df] flex justify-between items-center">
                  <span className="font-semibold text-[#1a1a2e] text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className={clsx('text-xs font-medium cursor-pointer hover:underline flex items-center gap-1', theme.accentText)}>
                      <CheckCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="p-5 text-sm text-[#6b6b80] text-center">No new notifications</div>
                  )}
                  {notifications.slice(0, 5).map((notification) => (
                    <button
                      key={notification.databaseId || notification.id}
                      onClick={async () => {
                        if (!notification.read && notification.databaseId) {
                          await notificationsAPI.markRead(notification.databaseId);
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.databaseId === notification.databaseId ? { ...item, read: true } : item
                            )
                          );
                        }
                        navigate(`/${user?.role}/notifications`);
                        setShowNotifications(false);
                      }}
                      className={clsx(
                        'w-full text-left p-4 border-b border-[#e5e4df] hover:bg-[#f7f6f3] transition-colors',
                        !notification.read && theme.accentSoftBg
                      )}
                    >
                      <p className="text-sm font-medium text-[#1a1a2e]">{notification.title}</p>
                      <p className="text-xs text-[#6b6b80] mt-1 line-clamp-1">{notification.message}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    navigate(`/${user?.role}/notifications`);
                    setShowNotifications(false);
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-[#1a1a2e] hover:bg-[#f7f6f3] transition-colors flex items-center justify-center gap-2"
                >
                  View all
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowProfile((value) => !value)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:bg-[#efeee9] dark:hover:bg-[#2d2d45] transition-colors"
          >
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold', theme.accentBg)}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-[#1a1a2e] dark:text-white leading-tight">{user?.name || 'User'}</p>
              <p className={clsx('text-[10px] font-medium capitalize', theme.accentText)}>{user?.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#6b6b80] hidden md:block" />
          </motion.button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-12 w-44 bg-white border-2 border-[#e5e4df] rounded-2xl shadow-2xl overflow-hidden"
              >
                <button
                  onClick={() => {
                    navigate(`/${user?.role}/settings`);
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f7f6f3] text-[#6b6b80] hover:text-[#1a1a2e] text-sm"
                >
                  <User className="w-4 h-4" />
                  Settings
                </button>
                <div className="h-px bg-[#e5e4df]" />
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {(showNotifications || showProfile) && (
        <div className="fixed inset-0 z-[-1]" onClick={() => { setShowNotifications(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
