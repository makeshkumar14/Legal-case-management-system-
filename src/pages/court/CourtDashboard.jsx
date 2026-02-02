import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Gavel, Users, BarChart3, Plus, TrendingUp, Clock, QrCode, Edit, Trash2, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Modal, ConfirmModal } from '../../components/shared/Modal';
import { QRCodeViewer } from '../../components/shared/QRCodeViewer';
import { cases, advocates, analyticsData } from '../../data/mockData';

export function CourtDashboard() {
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const stats = [
    { label: 'Total Cases', value: analyticsData.totalCases, icon: FileText, gradient: 'from-indigo-500 to-violet-500', trend: '+12%', up: true },
    { label: 'Pending', value: analyticsData.pendingCases, icon: Clock, gradient: 'from-amber-500 to-orange-500', trend: '-5%', up: false },
    { label: 'Advocates', value: advocates.length, icon: Users, gradient: 'from-emerald-500 to-cyan-500', trend: '+2', up: true },
    { label: "Today's Hearings", value: analyticsData.todayHearings, icon: Gavel, gradient: 'from-pink-500 to-rose-500', trend: '3 pending', up: null },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Court Administration
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400">Manage cases, hearings, and court operations</p>
        </div>
        <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCaseModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow">
          <Plus className="w-5 h-5" />Register New Case
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all group shadow-sm dark:shadow-none">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              {stat.up !== null && (
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Cases Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analyticsData.casesTrend}>
                <defs>
                  <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} />
                <Area type="monotone" dataKey="filed" stroke="#6366f1" strokeWidth={2} fill="url(#colorFiled)" />
                <Area type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} fill="url(#colorClosed)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Cases Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Cases</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Case No.</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.slice(0, 5).map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-4 text-sm text-indigo-400 font-mono">{c.caseNumber}</td>
                      <td className="py-4 px-4 text-sm text-slate-900 dark:text-white max-w-xs truncate">{c.title}</td>
                      <td className="py-4 px-4"><StatusBadge status={c.status} size="sm" /></td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setSelectedCase(c); setShowQRModal(true); }} className="p-2 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors"><QrCode className="w-4 h-4" /></button>
                          <button className="p-2 rounded-lg hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors"><Eye className="w-4 h-4" /></button>
                          <button className="p-2 rounded-lg hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Cases by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analyticsData.casesByType} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {analyticsData.casesByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {analyticsData.casesByType.slice(0, 4).map(t => (
                <div key={t.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs text-slate-400">{t.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Daily Hearings</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={analyticsData.dailyHearings}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Top Advocates</h3>
            <div className="space-y-3">
              {advocates.slice(0, 3).map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {a.name.split(' ').pop().charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.activeCases} active cases</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-amber-400">★ {a.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="Case QR Code" size="sm">
        {selectedCase && <div className="flex flex-col items-center"><QRCodeViewer value={`LCMS:${selectedCase.id}`} title={selectedCase.caseNumber} /></div>}
      </Modal>

      <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={() => {}} title="Delete Case" message="Are you sure you want to delete this case? This action cannot be undone." confirmText="Delete" variant="danger" />

      <Modal isOpen={showCaseModal} onClose={() => setShowCaseModal(false)} title="Register New Case" size="lg">
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Case Title</label>
            <input type="text" className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30" placeholder="Enter case title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Case Type</label>
              <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30">
                <option className="bg-slate-900">Civil</option><option className="bg-slate-900">Criminal</option><option className="bg-slate-900">Family</option><option className="bg-slate-900">Consumer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Assign Advocate</label>
              <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30">
                {advocates.map(a => <option key={a.id} className="bg-slate-900">{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCaseModal(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow">Create Case</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
