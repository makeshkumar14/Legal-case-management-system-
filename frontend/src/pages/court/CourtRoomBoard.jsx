import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Clock, Gavel, RefreshCw, Search, XCircle } from 'lucide-react';
import { courtroomsAPI } from '../../services/api';

const statusConfig = {
  in_session: { label: 'In Session', icon: Gavel, color: 'bg-emerald-500', textColor: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  available: { label: 'Available', icon: CheckCircle, color: 'bg-blue-500', textColor: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20' },
  recess: { label: 'Recess', icon: Clock, color: 'bg-amber-500', textColor: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/20' },
  closed: { label: 'Closed', icon: XCircle, color: 'bg-red-500', textColor: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20' },
};

export function CourtRoomBoard() {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchRooms = async () => {
    try {
      const res = await courtroomsAPI.list();
      setRooms(res.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching court rooms:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const refresh = async () => {
    setIsRefreshing(true);
    await fetchRooms();
    setIsRefreshing(false);
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (searchQuery && !room.name.toLowerCase().includes(searchQuery.toLowerCase()) && !String(room.judge || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filter !== 'all' && room.status !== filter) return false;
      return true;
    });
  }, [filter, rooms, searchQuery]);

  const statusCounts = {
    in_session: rooms.filter((room) => room.status === 'in_session').length,
    available: rooms.filter((room) => room.status === 'available').length,
    recess: rooms.filter((room) => room.status === 'recess').length,
    closed: rooms.filter((room) => room.status === 'closed').length,
  };

  const updateStatus = async (room, status) => {
    try {
      const response = await courtroomsAPI.update(room.id, { status });
      const updatedRoom = response.data?.courtroom || response.data;
      setRooms((prev) => prev.map((item) => (item.id === room.id ? updatedRoom : item)));
    } catch (err) {
      console.error('Error updating room status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Court Room Board</motion.h1>
          <p className="text-[#6b6b80]">Live courtroom status • Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={refresh} className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all">
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${config.color} flex items-center justify-center mb-3 shadow-lg`}>
              <config.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{statusCounts[key]}</p>
            <p className="text-sm text-[#6b6b80]">{config.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search rooms or judges..." className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/30" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...Object.keys(statusConfig)].map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === item ? 'bg-red-500/20 text-red-700 border-2 border-red-500/30' : 'bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80]'}`}>
              {item === 'all' ? 'All' : statusConfig[item]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room, index) => {
          const config = statusConfig[room.status] || statusConfig.available;
          return (
            <motion.div key={room.id || index} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className={`p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 ${config.bg} shadow-sm hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center shadow-lg`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a2e] dark:text-white">{room.name}</h3>
                    <p className="text-xs text-[#6b6b80]">{room.judge || 'Judge not assigned'}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.textColor} border`}>
                  {config.label}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e] space-y-2">
                <p className="text-sm text-[#1a1a2e] dark:text-white font-medium">{room.caseTitle || 'No active hearing'}</p>
                <p className="text-xs text-[#6b6b80]">{room.currentCase || 'No case assigned'}</p>
                <p className="text-xs text-[#6b6b80]">{room.startTime || 'Start time pending'}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.keys(statusConfig).map((status) => (
                  <button key={status} onClick={() => updateStatus(room, status)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${room.status === status ? 'bg-red-500 text-white' : 'bg-white border border-[#e5e4df] text-[#6b6b80] hover:border-red-500/30'}`}>
                    {statusConfig[status].label}
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-16"><Building2 className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">No court rooms found</h3><p className="text-[#6b6b80]">Try adjusting your search or status filters.</p></div>
      )}
    </div>
  );
}
