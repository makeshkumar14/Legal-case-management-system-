import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileText, Calendar, Filter, TrendingUp, Users, Gavel, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const casesByMonth = [
  { month: 'Jul', filed: 45, disposed: 32 }, { month: 'Aug', filed: 52, disposed: 38 },
  { month: 'Sep', filed: 48, disposed: 45 }, { month: 'Oct', filed: 61, disposed: 42 },
  { month: 'Nov', filed: 55, disposed: 48 }, { month: 'Dec', filed: 58, disposed: 52 },
  { month: 'Jan', filed: 65, disposed: 55 }, { month: 'Feb', filed: 42, disposed: 38 },
];

const casesByType = [
  { name: 'Civil', value: 145, color: '#3b82f6' }, { name: 'Criminal', value: 98, color: '#ef4444' },
  { name: 'Family', value: 67, color: '#f59e0b' }, { name: 'Consumer', value: 45, color: '#8b5cf6' },
  { name: 'MACT', value: 32, color: '#10b981' },
];

const pendingTrend = [
  { month: 'Jul', pending: 320 }, { month: 'Aug', pending: 334 }, { month: 'Sep', pending: 337 },
  { month: 'Oct', pending: 356 }, { month: 'Nov', pending: 363 }, { month: 'Dec', pending: 369 },
  { month: 'Jan', pending: 379 }, { month: 'Feb', pending: 383 },
];

const reportTypes = ['Case Statistics', 'Hearing Analytics', 'Advocate Performance', 'Pendency Report'];

export function ReportsPage() {
  const [period, setPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('Case Statistics');
  const stats = [
    { label: 'Total Cases', value: '1,247', icon: FileText, change: '+12%', color: 'bg-blue-500' },
    { label: 'Disposed', value: '864', icon: Gavel, change: '+8%', color: 'bg-emerald-500' },
    { label: 'Pending', value: '383', icon: TrendingUp, change: '-3%', color: 'bg-amber-500' },
    { label: 'Advocates', value: '156', icon: Users, change: '+5%', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Reports & Analytics</motion.h1>
          <p className="text-[#6b6b80]">Comprehensive court performance insights</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all">
          <Download className="w-5 h-5" />Export
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-3 shadow-lg`}><stat.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{stat.value}</p>
            <div className="flex items-center gap-2"><p className="text-sm text-[#6b6b80]">{stat.label}</p>
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.change}</span></div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {reportTypes.map(r => (
          <button key={r} onClick={() => setSelectedReport(r)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedReport === r ? 'bg-red-500/20 text-red-700 border-2 border-red-500/30' : 'bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80]'}`}>
            {r}</button>))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-[#1a1a2e] dark:text-white">Cases Filed vs Disposed</h3>
            <BarChart3 className="w-5 h-5 text-[#6b6b80]" /></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={casesByMonth} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e4df" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b80', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b6b80', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="filed" fill="#ef4444" radius={[4,4,0,0]} name="Filed" />
              <Bar dataKey="disposed" fill="#10b981" radius={[4,4,0,0]} name="Disposed" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-[#1a1a2e] dark:text-white">Cases by Type</h3>
            <PieChart className="w-5 h-5 text-[#6b6b80]" /></div>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsPie>
              <Pie data={casesByType} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {casesByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px', color: '#fff' }} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-[#1a1a2e] dark:text-white">Pendency Trend</h3>
          <TrendingUp className="w-5 h-5 text-[#6b6b80]" /></div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={pendingTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e4df" />
            <XAxis dataKey="month" tick={{ fill: '#6b6b80', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b6b80', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px', color: '#fff' }} />
            <Area type="monotone" dataKey="pending" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
        <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Case Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b-2 border-[#e5e4df] dark:border-[#2d2d45]">
              {['Case Type', 'Filed', 'Disposed', 'Pending', 'Disposal Rate'].map(h => <th key={h} className="text-left py-3 px-4 text-[#6b6b80] font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {[['Civil', 145, 98, 47, '67.6%'], ['Criminal', 98, 64, 34, '65.3%'], ['Family', 67, 45, 22, '67.2%'], ['Consumer', 45, 38, 7, '84.4%'], ['MACT', 32, 21, 11, '65.6%']].map(([type, filed, disposed, pending, rate]) => (
                <tr key={type} className="border-b border-[#e5e4df] dark:border-[#2d2d45]/50 hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a2e]">
                  <td className="py-3 px-4 text-[#1a1a2e] dark:text-white font-medium">{type}</td>
                  <td className="py-3 px-4 text-[#6b6b80]">{filed}</td>
                  <td className="py-3 px-4 text-emerald-500">{disposed}</td>
                  <td className="py-3 px-4 text-amber-500">{pending}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium">{rate}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
