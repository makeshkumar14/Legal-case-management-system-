import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileText, Gavel, PieChart, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart as RechartsPie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { analyticsAPI, casesAPI } from '../../services/api';

export function ReportsPage() {
  const [reportData, setReportData] = useState({
    dashboard: null,
    trend: [],
    types: [],
    hearings: [],
    advocates: [],
  });
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, trendRes, typeRes, hearingRes, advocateRes, casesRes] = await Promise.all([
          analyticsAPI.dashboard(),
          analyticsAPI.casesTrend(),
          analyticsAPI.casesByType(),
          analyticsAPI.dailyHearings(),
          analyticsAPI.allAdvocates(),
          casesAPI.list(),
        ]);

        setReportData({
          dashboard: dashboardRes.data,
          trend: trendRes.data || [],
          types: typeRes.data || [],
          hearings: hearingRes.data || [],
          advocates: advocateRes.data || [],
        });
        setCases(casesRes.data || []);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const dashboard = reportData.dashboard || {};
    return [
      { label: 'Total Cases', value: dashboard.totalCases || 0, icon: FileText, color: 'bg-blue-500' },
      { label: 'Pending', value: dashboard.pendingCases || 0, icon: TrendingUp, color: 'bg-amber-500' },
      { label: 'Disposed', value: dashboard.closedCases || 0, icon: Gavel, color: 'bg-emerald-500' },
      { label: 'Advocates', value: reportData.advocates.length, icon: Users, color: 'bg-purple-500' },
    ];
  }, [reportData.advocates.length, reportData.dashboard]);

  const summaryRows = useMemo(() => {
    return reportData.types.map((typeItem) => {
      const matchingCases = cases.filter((item) => item.caseType === typeItem.name);
      const filed = matchingCases.length;
      const disposed = matchingCases.filter((item) => ['closed', 'dismissed'].includes(item.status)).length;
      const pending = filed - disposed;
      const rate = filed ? `${Math.round((disposed / filed) * 100)}%` : '0%';
      return {
        type: typeItem.name,
        filed,
        disposed,
        pending,
        rate,
      };
    });
  }, [cases, reportData.types]);

  const exportReport = () => {
    const rows = summaryRows.map((row) => `${row.type},${row.filed},${row.disposed},${row.pending},${row.rate}`);
    const content = ['Case Type,Filed,Disposed,Pending,Disposal Rate', ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `court_reports_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Reports & Analytics</motion.h1>
          <p className="text-[#6b6b80]">Court-level performance insights powered by the live analytics endpoints.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportReport} className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all">
          <Download className="w-5 h-5" />
          Export
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{stat.value}</p>
            <p className="text-sm text-[#6b6b80]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-[#1a1a2e] dark:text-white">Cases Filed vs Closed</h3><BarChart3 className="w-5 h-5 text-[#6b6b80]" /></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={reportData.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e4df" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b80', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b6b80', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="filed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Filed" />
              <Bar dataKey="closed" fill="#10b981" radius={[4, 4, 0, 0]} name="Closed" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-[#1a1a2e] dark:text-white">Cases by Type</h3><PieChart className="w-5 h-5 text-[#6b6b80]" /></div>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsPie>
              <Pie data={reportData.types} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {reportData.types.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px', color: '#fff' }} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-[#1a1a2e] dark:text-white">Daily Hearings</h3><TrendingUp className="w-5 h-5 text-[#6b6b80]" /></div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={reportData.hearings}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e4df" />
            <XAxis dataKey="day" tick={{ fill: '#6b6b80', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b6b80', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px', color: '#fff' }} />
            <Area type="monotone" dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
        <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Case Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#e5e4df] dark:border-[#2d2d45]">
                {['Case Type', 'Filed', 'Disposed', 'Pending', 'Disposal Rate'].map((header) => (
                  <th key={header} className="text-left py-3 px-4 text-[#6b6b80] font-medium">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row) => (
                <tr key={row.type} className="border-b border-[#e5e4df] dark:border-[#2d2d45]/50 hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a2e]">
                  <td className="py-3 px-4 text-[#1a1a2e] dark:text-white font-medium">{row.type}</td>
                  <td className="py-3 px-4 text-[#6b6b80]">{row.filed}</td>
                  <td className="py-3 px-4 text-emerald-500">{row.disposed}</td>
                  <td className="py-3 px-4 text-amber-500">{row.pending}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium">{row.rate}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
