import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gavel, Plus, Calendar, Clock, MapPin, Users, FileText, Edit, Trash2, X, CheckCircle, Timer } from 'lucide-react';
import { cases } from '../../data/mockData';
import { StatusBadge } from '../../components/shared/StatusBadge';

const courtRooms = ['Court Room 1','Court Room 2','Court Room 3','Court Room 5','Court Room 12','Principal Bench','Consumer Forum Hall 2','MACT Hall','Family Court Hall'];
const hearingTypes = ['First Hearing','Arguments','Counter Arguments','Witness Examination','Evidence Submission','Final Arguments','Judgment','Urgent Mention','Preliminary Hearing'];
const allHearings = cases.flatMap(c => (c.hearings || []).map(h => ({...h, caseId: c.id, caseNumber: c.caseNumber, caseTitle: c.title, court: c.courtRoom})));

export function HearingScheduler() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const upcoming = allHearings.filter(h => h.status === 'scheduled');
  const completed = allHearings.filter(h => h.status === 'completed');
  const filtered = filter === 'all' ? allHearings : filter === 'scheduled' ? upcoming : completed;

  const stats = [
    { label: "Today's Hearings", value: '12', icon: Gavel, color: 'bg-red-500' },
    { label: 'This Week', value: '45', icon: Calendar, color: 'bg-red-500' },
    { label: 'Pending', value: upcoming.length, icon: Timer, color: 'bg-amber-500' },
    { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Hearing Scheduler</motion.h1>
          <p className="text-[#6b6b80]">Schedule and manage court hearings</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all">
          <Plus className="w-5 h-5" />Schedule Hearing
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-3 shadow-lg`}><stat.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{stat.value}</p>
            <p className="text-sm text-[#6b6b80]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        {['all', 'scheduled', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-red-500/20 text-red-700 border-2 border-red-500/30' : 'bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80]'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}</button>))}
      </div>

      <div className="space-y-3">
        {filtered.map((h, i) => (
          <motion.div key={`${h.caseId}-${h.date}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-red-500/30 transition-all shadow-sm group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${h.status === 'completed' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                {h.status === 'completed' ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Timer className="w-6 h-6 text-amber-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1"><h4 className="text-[#1a1a2e] dark:text-white font-semibold">{h.type}</h4><StatusBadge status={h.status} size="sm" /></div>
                <div className="flex items-center gap-3 text-xs text-[#6b6b80] flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{h.date}</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{h.caseNumber}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{h.court || 'TBD'}</span>
                </div>
                {h.notes && <p className="text-sm text-[#6b6b80] mt-2">{h.notes}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-500"><Edit className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#1a1a2e] rounded-3xl border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white">Schedule Hearing</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#232338] text-[#6b6b80]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Case</label>
                <select className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30">
                  {cases.map(c => <option key={c.id} className="bg-white dark:bg-[#1a1a2e]">{c.caseNumber} - {c.title}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Hearing Type</label>
                  <select className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                    {hearingTypes.map(t => <option key={t} className="bg-white dark:bg-[#1a1a2e]">{t}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Court Room</label>
                  <select className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                    {courtRooms.map(r => <option key={r} className="bg-white dark:bg-[#1a1a2e]">{r}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Time</label>
                  <input type="time" className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Notes</label>
                <textarea rows={3} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none resize-none" placeholder="Add notes..." /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] text-[#6b6b80] font-medium border-2 border-[#e5e4df] dark:border-[#2d2d45]">Cancel</button>
              <button className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/25">Schedule</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
