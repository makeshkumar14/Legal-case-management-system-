import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Calendar, Clock, Bell, ChevronRight, QrCode, AlertCircle, CheckCircle, Timer, TrendingUp, ScanLine } from 'lucide-react';
import { casesAPI, notificationsAPI } from '../../services/api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Modal } from '../../components/shared/Modal';
import { QRCodeViewer } from '../../components/shared/QRCodeViewer';
import { Timeline } from '../../components/shared/Timeline';
import { CountdownTimer } from '../../components/shared/CountdownTimer';
import { QRCodeScanner } from '../../components/shared/QRCodeScanner';
import { useAuth } from '../../context/AuthContext';

export function PublicDashboard() {
  const [searchId, setSearchId] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [userCases, setUserCases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesRes, notifRes] = await Promise.all([
          casesAPI.list(),
          notificationsAPI.list()
        ]);
        setUserCases(casesRes.data.cases || casesRes.data || []);
        setNotifications(notifRes.data.notifications || notifRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextHearing = userCases[0]?.hearings?.[0];

  const stats = [
    { label: 'Active Cases', value: userCases.length.toString(), icon: FileText, color: 'bg-[#1a1a2e]', iconColor: 'text-[#b4f461]', change: `${userCases.filter(c => c.status === 'active').length} active` },
    { label: 'Next Hearing', value: nextHearing ? '2d 14h' : 'None', icon: Calendar, color: 'bg-[#1a1a2e]', iconColor: 'text-[#b4f461]', change: nextHearing?.court || 'No upcoming' },
    { label: 'Documents', value: userCases.reduce((sum, c) => sum + (c.documents?.length || 0), 0).toString(), icon: Clock, color: 'bg-[#1a1a2e]', iconColor: 'text-[#b4f461]', change: 'Total files' },
    { label: 'Notifications', value: notifications.length.toString(), icon: Bell, color: 'bg-[#1a1a2e]', iconColor: 'text-[#b4f461]', change: `${notifications.filter(n => !n.read).length} unread` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#b4f461]/30 border-t-[#b4f461] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">
            Welcome back, {user?.name || 'Citizen'}
          </motion.h1>
          <p className="text-[#6b6b80]">Track your cases and upcoming hearings</p>
        </div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative w-full lg:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
            <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Search by Case ID..."
              className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#b4f461]/40 focus:border-[#b4f461] transition-all shadow-sm" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScanner(true)}
            className="p-3 bg-[#b4f461] hover:bg-[#a3e350] text-[#1a1a2e] rounded-xl shadow-lg shadow-[#b4f461]/25 hover:shadow-[#b4f461]/40 transition-all"
            title="Scan QR Code"
          >
            <ScanLine className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="relative group p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-[#b4f461]/50 transition-all overflow-hidden shadow-sm"
          >
            <div className="relative">
              <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-[#6b6b80]">{stat.label}</p>
              <p className="text-xs text-[#2d6a25] font-medium mt-2">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1a1a2e] dark:text-white">Your Cases</h2>
            <button className="text-sm text-[#2d6a25] hover:text-[#1a5a1a] font-medium flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="space-y-3">
            {userCases.slice(0, 5).map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 shadow-sm ${selectedCase?.id === c.id
                  ? 'bg-[#b4f461]/10 border-[#b4f461]/50'
                  : 'bg-white/80 dark:bg-[#232338] border-[#e5e4df] dark:border-[#2d2d45] hover:border-[#b4f461]/50'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-[#2d6a25] bg-[#b4f461]/20 px-2 py-1 rounded-lg">{c.case_number || c.caseNumber}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <h3 className="text-[#1a1a2e] dark:text-white font-medium mb-1 truncate">{c.title}</h3>
                    <p className="text-sm text-[#6b6b80]">{c.court}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setShowQR(c); }}
                    className="p-2 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e] hover:bg-[#b4f461]/20 text-[#6b6b80] hover:text-[#b4f461] transition-colors">
                    <QrCode className="w-5 h-5" />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {selectedCase?.id === c.id && c.timeline && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-5 mt-5 border-t border-[#e5e4df] dark:border-[#2d2d45]">
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
              className="p-6 rounded-2xl bg-[#b4f461]/10 border-2 border-[#b4f461]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#b4f461]/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-[#1a1a2e] dark:text-[#b4f461] mb-4">
                  <Timer className="w-5 h-5" />
                  <span className="text-sm font-medium">Next Hearing</span>
                </div>
                <CountdownTimer targetDate={nextHearing.date} />
                <p className="text-sm text-[#6b6b80] mt-4">{nextHearing.type}</p>
                <p className="text-xs text-[#6b6b80]">{nextHearing.court}</p>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a1a2e] dark:text-white">Recent Alerts</h3>
              <span className="px-2 py-1 rounded-full bg-[#b4f461]/20 text-[#1a1a2e] dark:text-[#b4f461] text-xs font-medium">{notifications.filter(n => !n.read).length} new</span>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                  className={`p-3 rounded-xl ${n.type === 'urgent' ? 'bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20' : 'bg-[#f7f6f3] dark:bg-[#1a1a2e]'}`}>
                  <div className="flex items-start gap-3">
                    {n.type === 'urgent' ? <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" /> : <CheckCircle className="w-4 h-4 text-[#2d6a25] mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-[#1a1a2e] dark:text-white">{n.title || n.message}</p>
                      <p className="text-xs text-[#6b6b80] mt-1">{n.time || n.created_at}</p>
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
        {showQR && <div className="flex flex-col items-center"><QRCodeViewer value={`LCMS:${showQR.id}`} title={showQR.case_number || showQR.caseNumber} /></div>}
      </Modal>

      {/* QR Scanner */}
      <QRCodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(value) => {
          const id = value.replace('LCMS:', '');
          setSearchId(id);
        }}
      />
    </div>
  );
}
