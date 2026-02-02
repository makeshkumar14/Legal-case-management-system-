import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Calendar, Clock, Bell, ChevronRight, QrCode, AlertCircle, CheckCircle, Timer, TrendingUp } from 'lucide-react';
import { cases, notifications } from '../../data/mockData';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Modal } from '../../components/shared/Modal';
import { QRCodeViewer } from '../../components/shared/QRCodeViewer';
import { Timeline } from '../../components/shared/Timeline';
import { CountdownTimer } from '../../components/shared/CountdownTimer';

export function PublicDashboard() {
  const [searchId, setSearchId] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const userCases = cases.slice(0, 3);
  const nextHearing = cases[0]?.hearings?.[0];

  const stats = [
    { label: 'Active Cases', value: '3', icon: FileText, gradient: 'from-indigo-500 to-purple-500', change: '+1 this month' },
    { label: 'Next Hearing', value: '2d 14h', icon: Calendar, gradient: 'from-emerald-500 to-teal-500', change: 'Court Room 5' },
    { label: 'Documents', value: '12', icon: Clock, gradient: 'from-amber-500 to-orange-500', change: '2 pending review' },
    { label: 'Notifications', value: '5', icon: Bell, gradient: 'from-pink-500 to-rose-500', change: '3 unread' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome back, Citizen
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400">Track your cases and upcoming hearings</p>
        </div>
        
        {/* Search */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Search by Citizen ID..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all shadow-sm dark:shadow-none" />
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="relative group p-5 rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-white/[0.05] dark:to-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all overflow-hidden shadow-sm dark:shadow-none"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${stat.gradient.replace('from-', '').split(' ')[0]}10, transparent)` }} />
            <div className="relative">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-xs text-slate-600 mt-2">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Cases</h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button>
          </div>
          
          <div className="space-y-3">
            {userCases.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm dark:shadow-none ${
                  selectedCase?.id === c.id 
                    ? 'bg-gradient-to-r from-indigo-50 dark:from-indigo-500/10 to-purple-50 dark:to-purple-500/5 border-indigo-300 dark:border-indigo-500/30' 
                    : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">{c.caseNumber}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-medium mb-1 truncate">{c.title}</h3>
                    <p className="text-sm text-slate-500">{c.court}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setShowQR(c); }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors">
                    <QrCode className="w-5 h-5" />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {selectedCase?.id === c.id && c.timeline && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-5 mt-5 border-t border-white/5">
                        <Timeline items={c.timeline} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Hearing Countdown */}
          {nextHearing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                  <Timer className="w-5 h-5" />
                  <span className="text-sm font-medium">Next Hearing</span>
                </div>
                <CountdownTimer targetDate={nextHearing.date} />
                <p className="text-sm text-slate-400 mt-4">{nextHearing.type}</p>
                <p className="text-xs text-slate-600">{nextHearing.court}</p>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
              <span className="px-2 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-medium">3 new</span>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                  className={`p-3 rounded-xl ${n.type === 'urgent' ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20' : 'bg-slate-50 dark:bg-white/[0.02]'}`}>
                  <div className="flex items-start gap-3">
                    {n.type === 'urgent' ? <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" /> : <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Modal */}
      <Modal isOpen={!!showQR} onClose={() => setShowQR(false)} title="Case QR Code" size="sm">
        {showQR && <div className="flex flex-col items-center"><QRCodeViewer value={`LCMS:${showQR.id}`} title={showQR.caseNumber} /></div>}
      </Modal>
    </div>
  );
}
