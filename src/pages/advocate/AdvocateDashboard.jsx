import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Upload, CheckCircle, Clock, AlertTriangle, ChevronRight, Filter, Plus, MoreHorizontal } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { cases, tasks, evidences, calendarEvents } from '../../data/mockData';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useTheme } from '../../context/ThemeContext';

export function AdvocateDashboard() {
  const [filter, setFilter] = useState('all');
  const { isDark } = useTheme();
  const advocateCases = cases.slice(0, 4);
  const filteredCases = filter === 'all' ? advocateCases : advocateCases.filter(c => c.priority === filter);

  const stats = [
    { label: 'Active Cases', value: '12', icon: FileText, gradient: 'from-indigo-500 to-violet-500', trend: '+2' },
    { label: "Today's Hearings", value: '3', icon: Calendar, gradient: 'from-emerald-500 to-cyan-500', trend: 'On track' },
    { label: 'Pending Tasks', value: '8', icon: Clock, gradient: 'from-amber-500 to-orange-500', trend: '2 urgent' },
    { label: 'Evidence', value: '24', icon: Upload, gradient: 'from-pink-500 to-rose-500', trend: '3 pending' },
  ];

  const priorityColors = {
    high: 'border-l-red-500 bg-red-500/5',
    medium: 'border-l-amber-500 bg-amber-500/5',
    low: 'border-l-emerald-500 bg-emerald-500/5',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Advocate Dashboard
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your cases, hearings, and evidence</p>
        </div>
        <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow">
          <Plus className="w-5 h-5" />New Case
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all group shadow-sm dark:shadow-none">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-xs text-emerald-400 mt-2">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Case Queue</h2>
            <div className="flex items-center gap-2">
              {['all', 'high', 'medium'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-white'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {filteredCases.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                className={`p-5 rounded-2xl border-l-4 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all cursor-pointer group shadow-sm dark:shadow-none ${priorityColors[c.priority] || ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-slate-500">{c.caseNumber}</span>
                      <StatusBadge status={c.status} size="sm" />
                      <StatusBadge status={c.priority} size="sm" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-medium mb-1 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{c.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{c.court}</span>
                      <span>•</span>
                      <span>{c.hearings?.[0]?.date || 'No hearing'}</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 opacity-0 group-hover:opacity-100 transition-all">
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
            className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Today's Tasks</h3>
              <span className="text-xs text-slate-500">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
            </div>
            <div className="space-y-2">
              {tasks.slice(0, 4).map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${task.completed ? 'bg-emerald-50 dark:bg-emerald-500/5' : 'bg-slate-50 dark:bg-white/[0.02]'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                    {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm flex-1 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</span>
                  {task.priority === 'high' && !task.completed && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Evidence Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Evidence</h3>
            <div className="space-y-3">
              {evidences.slice(0, 3).map((e, i) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${e.fileType === 'pdf' ? 'bg-red-500/20 text-red-400' : e.fileType === 'jpg' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white truncate">{e.title}</p>
                    <p className="text-xs text-slate-500">{e.size}</p>
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
        className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Schedule</h3>
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
    </div>
  );
}
