import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, RefreshCw, Users, Clock, MapPin, CheckCircle, AlertTriangle, XCircle, Gavel } from 'lucide-react';

const courtRoomsData = [
  { id: 1, name: 'Court Room 1', judge: 'Justice R. Krishnan', status: 'in_session', currentCase: 'CIV-2024-1842', caseTitle: 'Property Dispute - Sharma vs Patel', startTime: '10:00 AM', type: 'Civil' },
  { id: 2, name: 'Court Room 2', judge: 'Justice S. Mehta', status: 'available', currentCase: null, caseTitle: null, startTime: null, type: null },
  { id: 3, name: 'Court Room 3', judge: 'Justice P. Reddy', status: 'in_session', currentCase: 'CRM-2024-0567', caseTitle: 'State vs Rajesh Kumar', startTime: '10:30 AM', type: 'Criminal' },
  { id: 5, name: 'Court Room 5', judge: 'Justice K. Iyer', status: 'recess', currentCase: 'FAM-2024-0234', caseTitle: 'Custody Case - Devi vs Devi', startTime: '11:00 AM', type: 'Family' },
  { id: 6, name: 'Principal Bench', judge: 'Chief Justice A. Roy', status: 'in_session', currentCase: 'CIV-2024-2001', caseTitle: 'Municipal Corporation vs Builder Association', startTime: '10:15 AM', type: 'Civil' },
  { id: 7, name: 'Consumer Forum Hall 2', judge: 'Justice M. Banerjee', status: 'available', currentCase: null, caseTitle: null, startTime: null, type: null },
  { id: 8, name: 'MACT Hall', judge: 'Justice V. Nair', status: 'in_session', currentCase: 'MACT-2024-0156', caseTitle: 'Accident Claim - Kumar Family', startTime: '11:30 AM', type: 'MACT' },
  { id: 9, name: 'Family Court Hall', judge: 'Justice L. Bose', status: 'closed', currentCase: null, caseTitle: null, startTime: null, type: null },
  { id: 12, name: 'Court Room 12', judge: 'Justice D. Sharma', status: 'in_session', currentCase: 'CNS-2024-0891', caseTitle: 'Consumer Fraud - Patel vs Electronics Ltd', startTime: '10:45 AM', type: 'Consumer' },
];

const statusConfig = {
  in_session: { label: 'In Session', icon: Gavel, color: 'bg-emerald-500', textColor: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  available: { label: 'Available', icon: CheckCircle, color: 'bg-blue-500', textColor: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  recess: { label: 'Recess', icon: Clock, color: 'bg-amber-500', textColor: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  closed: { label: 'Closed', icon: XCircle, color: 'bg-red-500', textColor: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
};

export function CourtRoomBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = () => { setIsRefreshing(true); setTimeout(() => { setIsRefreshing(false); setLastRefresh(new Date()); }, 1000); };

  const filtered = courtRoomsData.filter(r => {
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.judge.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  const statusCounts = { in_session: courtRoomsData.filter(r => r.status === 'in_session').length, available: courtRoomsData.filter(r => r.status === 'available').length, recess: courtRoomsData.filter(r => r.status === 'recess').length, closed: courtRoomsData.filter(r => r.status === 'closed').length };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Court Room Board</motion.h1>
          <p className="text-[#6b6b80]">Live status of court rooms • Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={refresh}
          className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all">
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />Refresh
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${config.color} flex items-center justify-center mb-3 shadow-lg`}><config.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{statusCounts[key]}</p>
            <p className="text-sm text-[#6b6b80]">{config.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search rooms or judges..."
            className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/30" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...Object.keys(statusConfig)].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-red-500/20 text-red-700 border-2 border-red-500/30' : 'bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80]'}`}>
              {f === 'all' ? 'All' : statusConfig[f]?.label}</button>))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((room, i) => {
          const config = statusConfig[room.status];
          return (
            <motion.div key={room.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className={`p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 ${config.bg} shadow-sm hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center shadow-lg`}><Building2 className="w-6 h-6 text-white" /></div>
                  <div><h3 className="font-bold text-[#1a1a2e] dark:text-white">{room.name}</h3><p className="text-xs text-[#6b6b80]">{room.judge}</p></div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.textColor} border`}>{config.label}</span>
              </div>
              {room.currentCase ? (
                <div className="p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e]">
                  <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-[#b4f461] bg-[#b4f461]/10 px-2 py-0.5 rounded">{room.currentCase}</span>
                    <span className="text-xs text-[#6b6b80] bg-[#e5e4df] dark:bg-[#2d2d45] px-2 py-0.5 rounded">{room.type}</span></div>
                  <p className="text-sm text-[#1a1a2e] dark:text-white font-medium">{room.caseTitle}</p>
                  <p className="text-xs text-[#6b6b80] mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />Started at {room.startTime}</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e] text-center">
                  <p className="text-sm text-[#6b6b80]">{room.status === 'closed' ? 'Court closed for the day' : 'No active hearing'}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16"><Building2 className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">No rooms found</h3><p className="text-[#6b6b80]">Try adjusting your filters</p></div>
      )}
    </div>
  );
}
