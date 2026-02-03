import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Upload, CheckCircle, Clock, AlertTriangle, ChevronRight, Filter, Plus, MoreHorizontal, Search, ScanLine } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { cases, tasks, evidences, calendarEvents } from '../../data/mockData';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { QRCodeScanner } from '../../components/shared/QRCodeScanner';

export function AdvocateDashboard() {
  const [filter, setFilter] = useState('all');
  const [searchId, setSearchId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const { isDark } = useTheme();
  const advocateCases = cases.slice(0, 4);
  const filteredCases = filter === 'all' ? advocateCases : advocateCases.filter(c => c.priority === filter);

  const stats = [
    { label: 'Active Cases', value: '12', icon: FileText, color: 'bg-orange-500', iconColor: 'text-white', trend: '+2' },
    { label: "Today's Hearings", value: '3', icon: Calendar, color: 'bg-orange-500', iconColor: 'text-white', trend: 'On track' },
    { label: 'Pending Tasks', value: '8', icon: Clock, color: 'bg-orange-500', iconColor: 'text-white', trend: '2 urgent' },
    { label: 'Evidence', value: '24', icon: Upload, color: 'bg-orange-500', iconColor: 'text-white', trend: '3 pending' },
  ];

  const priorityColors = {
    high: 'border-l-red-500 bg-red-500/5',
    medium: 'border-l-amber-500 bg-amber-500/5',
    low: 'border-l-orange-500 bg-orange-500/5',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">
            Advocate Dashboard
          </motion.h1>
          <p className="text-[#6b6b80]">Manage your cases, hearings, and evidence</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
              <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Search cases..."
                className="w-64 pl-12 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all shadow-sm" />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(true)}
              className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
              title="Scan QR Code"
            >
              <ScanLine className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all">
            <Plus className="w-5 h-5" />New Case
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-orange-500/50 transition-all group shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-[#6b6b80]">{stat.label}</p>
            <p className="text-xs text-orange-600 font-medium mt-2">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1a1a2e] dark:text-white">Case Queue</h2>
            <div className="flex items-center gap-2">
              {['all', 'high', 'medium'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-orange-500/20 text-orange-700' : 'text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {filteredCases.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                className={`p-5 rounded-2xl border-l-4 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-[#b4f461]/50 transition-all cursor-pointer group shadow-sm ${priorityColors[c.priority] || ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-[#6b6b80]">{c.caseNumber}</span>
                      <StatusBadge status={c.status} size="sm" />
                      <StatusBadge status={c.priority} size="sm" />
                    </div>
                    <h3 className="text-[#1a1a2e] dark:text-white font-medium mb-1 truncate group-hover:text-[#b4f461] transition-colors">{c.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-[#6b6b80]">
                      <span>{c.court}</span>
                      <span>•</span>
                      <span>{c.hearings?.[0]?.date || 'No hearing'}</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-[#b4f461]/10 text-[#6b6b80] opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tasks */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a1a2e] dark:text-white">Today's Tasks</h3>
              <span className="text-xs text-[#6b6b80]">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
            </div>
            <div className="space-y-2">
              {tasks.slice(0, 4).map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${task.completed ? 'bg-[#b4f461]/10' : 'bg-[#f7f6f3] dark:bg-[#1a1a2e]'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-[#b4f461] border-[#b4f461]' : 'border-[#6b6b80]'}`}>
                    {task.completed && <CheckCircle className="w-3 h-3 text-[#1a1a2e]" />}
                  </div>
                  <span className={`text-sm flex-1 ${task.completed ? 'text-[#6b6b80] line-through' : 'text-[#1a1a2e] dark:text-white'}`}>{task.title}</span>
                  {task.priority === 'high' && !task.completed && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Evidence Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Recent Evidence</h3>
            <div className="space-y-3">
              {evidences.slice(0, 3).map((e, i) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${e.fileType === 'pdf' ? 'bg-red-500/20 text-red-400' : e.fileType === 'jpg' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#b4f461]/20 text-[#b4f461]'}`}>
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a2e] dark:text-white truncate">{e.title}</p>
                    <p className="text-xs text-[#6b6b80]">{e.size}</p>
                  </div>
                  <StatusBadge status={e.verified ? 'verified' : 'pending'} size="sm" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
        <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white mb-4">Schedule</h3>
        <div className={isDark ? 'calendar-dark' : 'calendar-light'}>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            height={400}
            headerToolbar={{ left: 'prev,next', center: 'title', right: 'today' }}
          />
        </div>
      </motion.div>

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
