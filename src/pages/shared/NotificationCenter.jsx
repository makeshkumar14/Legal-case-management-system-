import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Clock, FileText, Gavel, Info, Trash2, AlertTriangle } from 'lucide-react';
import { DATA_SYNC_EVENT, notificationsAPI } from '../../services/api';
import { formatDateTime } from '../../utils/legalData';
import { getRoleTheme } from '../../utils/roleTheme';
import { useAuth } from '../../context/AuthContext';

const typeConfig = {
  hearing: { icon: Gavel, tone: 'text-amber-500', bg: 'bg-amber-500/10' },
  update: { icon: FileText, tone: 'text-blue-500', bg: 'bg-blue-500/10' },
  case_update: { icon: FileText, tone: 'text-blue-500', bg: 'bg-blue-500/10' },
  document: { icon: FileText, tone: 'text-purple-500', bg: 'bg-purple-500/10' },
  urgent: { icon: AlertTriangle, tone: 'text-red-500', bg: 'bg-red-500/10' },
  system: { icon: Info, tone: 'text-[#6b6b80]', bg: 'bg-[#6b6b80]/10' },
};

export function NotificationCenter() {
  const { user } = useAuth();
  const theme = getRoleTheme(user?.role);

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.list();
      setItems(res.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const syncNotifications = (event) => {
      if (!event?.detail?.scope || event.detail.scope === 'notifications' || event.detail.scope === 'cases') {
        fetchNotifications();
      }
    };

    window.addEventListener(DATA_SYNC_EVENT, syncNotifications);
    return () => window.removeEventListener(DATA_SYNC_EVENT, syncNotifications);
  }, []);

  const unreadCount = items.filter((item) => !item.read).length;
  const filteredItems = useMemo(() => {
    if (filter === 'unread') return items.filter((item) => !item.read);
    if (filter === 'urgent') return items.filter((item) => item.priority === 'high' || item.type === 'urgent');
    return items;
  }, [filter, items]);

  const markRead = async (item) => {
    if (!item.databaseId || item.read) return;
    await notificationsAPI.markRead(item.databaseId);
    setItems((prev) => prev.map((current) => (current.databaseId === item.databaseId ? { ...current, read: true } : current)));
  };

  const removeItem = async (item) => {
    if (!item.databaseId) return;
    await notificationsAPI.remove(item.databaseId);
    setItems((prev) => prev.filter((current) => current.databaseId !== item.databaseId));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead(items);
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#e5e4df] border-t-[#1a1a2e] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">
            Notifications
          </motion.h1>
          <p className="text-[#6b6b80]">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className={['flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all', theme.accentSoftBg, theme.accentSoftText].join(' ')}>
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'urgent', label: 'Urgent' },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => setFilter(option.id)}
            className={
              filter === option.id
                ? ['px-4 py-2.5 rounded-xl text-sm font-medium text-white', theme.accentBg].join(' ')
                : 'px-4 py-2.5 rounded-xl text-sm font-medium bg-white/80 border-2 border-[#e5e4df] text-[#6b6b80]'
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredItems.map((item, index) => {
          const config = typeConfig[item.type] || typeConfig.system;
          return (
            <motion.div
              key={item.databaseId || item.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={['p-5 rounded-2xl border-2 transition-all group shadow-sm', item.read ? 'bg-white/70 border-[#e5e4df]' : `${theme.accentSoftBg} ${theme.accentBorder}`].join(' ')}
            >
              <div className="flex items-start gap-4">
                <div className={['w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', config.bg].join(' ')}>
                  <config.icon className={['w-5 h-5', config.tone].join(' ')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[#1a1a2e]">{item.title}</p>
                    {!item.read && <div className={['w-2 h-2 rounded-full', theme.accentBg].join(' ')} />}
                  </div>
                  <p className="text-sm text-[#6b6b80]">{item.message}</p>
                  <p className="text-xs text-[#6b6b80] mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(item.timestamp || item.time)}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!item.read && (
                    <button onClick={() => markRead(item)} className={['p-2 rounded-lg transition-colors', theme.accentSoftBg, theme.accentSoftText].join(' ')} title="Mark read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => removeItem(item)} className="p-2 rounded-lg hover:bg-red-500/10 text-[#6b6b80] hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white/70 border-2 border-dashed border-[#e5e4df]">
          <Bell className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[#1a1a2e] mb-2">No notifications to show</h3>
          <p className="text-[#6b6b80]">You&apos;re all caught up right now.</p>
        </div>
      )}
    </div>
  );
}
