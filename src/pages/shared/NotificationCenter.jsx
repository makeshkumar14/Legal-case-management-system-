import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Calendar, FileText, Gavel, AlertTriangle, Info, Clock, CheckCheck } from 'lucide-react';
import { notificationsAPI } from '../../services/api';

const typeConfig = {
  hearing: { icon: Gavel, color: 'bg-amber-500', bg: 'bg-amber-500/10' },
  case_update: { icon: FileText, color: 'bg-blue-500', bg: 'bg-blue-500/10' },
  document: { icon: FileText, color: 'bg-purple-500', bg: 'bg-purple-500/10' },
  urgent: { icon: AlertTriangle, color: 'bg-red-500', bg: 'bg-red-500/10' },
  system: { icon: Info, color: 'bg-[#6b6b80]', bg: 'bg-[#6b6b80]/10' },
};

export function NotificationCenter() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationsAPI.list();
        const data = res.data.notifications || res.data || [];
        setItems(data.map((n, i) => ({ ...n, id: n.id || i, read: n.read || i > 2 })));
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filtered = filter === 'all' ? items : filter === 'unread' ? items.filter(n => !n.read) : items.filter(n => n.type === 'urgent');
  const unreadCount = items.filter(n => !n.read).length;
  const markRead = (id) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const removeItem = (id) => setItems(prev => prev.filter(n => n.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Notifications</motion.h1>
          <p className="text-[#6b6b80]">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2.5 bg-[#b4f461]/20 text-[#2d6a25] font-medium rounded-xl text-sm hover:bg-[#b4f461]/30 transition-all"><CheckCheck className="w-4 h-4" />Mark all read</button>}
      </div>

      <div className="flex gap-2">
        {[{ id: 'all', label: 'All' }, { id: 'unread', label: `Unread (${unreadCount})` }, { id: 'urgent', label: 'Urgent' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f.id ? 'bg-[#1a1a2e] text-[#b4f461]' : 'bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80]'}`}>
            {f.label}</button>))}
      </div>

      <div className="space-y-2">
        {filtered.map((n, i) => {
          const config = typeConfig[n.type] || typeConfig.system;
          return (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`p-5 rounded-2xl border-2 transition-all group ${!n.read ? 'bg-white dark:bg-[#232338] border-[#b4f461]/30 shadow-sm' : 'bg-white/60 dark:bg-[#232338]/60 border-[#e5e4df] dark:border-[#2d2d45]'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <config.icon className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${!n.read ? 'text-[#1a1a2e] dark:text-white' : 'text-[#6b6b80]'}`}>{n.message}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-[#b4f461] flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-[#6b6b80] mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{n.time || 'Just now'}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && <button onClick={() => markRead(n.id)} className="p-2 rounded-lg hover:bg-[#b4f461]/20 text-[#6b6b80] hover:text-[#2d6a25]" title="Mark read"><Check className="w-4 h-4" /></button>}
                  <button onClick={() => removeItem(n.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16"><Bell className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-50" /><h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">No notifications</h3><p className="text-[#6b6b80]">You&apos;re all caught up!</p></div>
      )}
    </div>
  );
}
