import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Gavel, Users, BarChart3, Plus, TrendingUp, Clock, QrCode, Edit, Trash2, Eye, Search, ScanLine, Download } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Modal, ConfirmModal } from '../../components/shared/Modal';
import { QRCodeViewer } from '../../components/shared/QRCodeViewer';
import { QRCodeScanner } from '../../components/shared/QRCodeScanner';
import { casesAPI, analyticsAPI } from '../../services/api';

export function CourtDashboard() {
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    caseType: 'Civil',
    petitioner: '',
    respondent: '',
    priority: 'medium',
    status: 'filed',
    advocateId: '',
    description: '',
    judge: '',
    courtRoom: '',
    nextHearing: ''
  });

  const [cases, setCases] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({ totalCases: 0, pendingCases: 0, todayHearings: 0, casesTrend: [], casesByType: [], dailyHearings: [] });
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesRes, dashRes, trendRes, typeRes, hearingsRes, perfRes] = await Promise.all([
          casesAPI.list(),
          analyticsAPI.dashboard(),
          analyticsAPI.casesTrend(),
          analyticsAPI.casesByType(),
          analyticsAPI.dailyHearings(),
          analyticsAPI.allAdvocates()
        ]);
        setCases(casesRes.data.cases || casesRes.data || []);
        const dash = dashRes.data;
        setAnalyticsData({
          totalCases: dash.totalCases || 0,
          pendingCases: dash.pendingCases || 0,
          todayHearings: dash.todayHearings || 0,
          casesTrend: trendRes.data.trend || trendRes.data || [],
          casesByType: (typeRes.data.types || typeRes.data || []).map(t => ({ ...t, color: t.color || ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 5)] })),
          dailyHearings: hearingsRes.data.hearings || hearingsRes.data || [],
        });
        setAdvocates(perfRes.data || []);
      } catch (err) {
        console.error('Error fetching court data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Case Number', 'Title', 'Petitioner', 'Respondent', 'Type', 'Status', 'Priority', 'Judge', 'Court Room', 'Next Hearing'];
    const rows = cases.map(c => [
      c.caseNumber || c.case_number,
      c.title,
      c.petitioner,
      c.respondent,
      c.caseType,
      c.status,
      c.priority,
      c.judge,
      c.courtRoom || c.court_room_name,
      c.nextHearing ? new Date(c.nextHearing).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cases_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
    { label: 'Total Cases', value: analyticsData.totalCases, icon: FileText, color: 'bg-red-500', iconColor: 'text-white', trend: '+12%', up: true },
    { label: 'Pending', value: analyticsData.pendingCases, icon: Clock, color: 'bg-red-500', iconColor: 'text-white', trend: '-5%', up: false },
    { label: 'Advocates', value: advocates.length, icon: Users, color: 'bg-red-500', iconColor: 'text-white', trend: `${advocates.length}`, up: true },
    { label: "Today's Hearings", value: analyticsData.todayHearings, icon: Gavel, color: 'bg-red-500', iconColor: 'text-white', trend: 'scheduled', up: null },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">
            Court Administration
          </motion.h1>
          <p className="text-[#6b6b80]">Manage cases, hearings, and court operations</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
              <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Search cases..."
                className="w-64 pl-12 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all shadow-sm" />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(true)}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
              title="Scan QR Code"
            >
              <ScanLine className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a1a2e] dark:bg-[#232338] hover:bg-[#2d2d45] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#1a1a2e] dark:text-white font-bold rounded-xl transition-all shadow-sm">
            <Download className="w-5 h-5" />Export CSV
          </motion.button>

          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCaseModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all">
            <Plus className="w-5 h-5" />Register New Case
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-red-500/50 transition-all group shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              {stat.up !== null && (
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${stat.up ? 'bg-red-500/20 text-red-700' : 'bg-red-500/10 text-red-400'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-[#6b6b80]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white mb-6">Cases Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analyticsData.casesTrend}>
                <defs>
                  <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a1a2e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a1a2e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,107,128,0.1)" />
                <XAxis dataKey="month" stroke="#6b6b80" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b6b80" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d45', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} />
                <Area type="monotone" dataKey="filed" stroke="#ef4444" strokeWidth={2} fill="url(#colorFiled)" />
                <Area type="monotone" dataKey="closed" stroke="#1a1a2e" strokeWidth={2} fill="url(#colorClosed)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Cases Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white mb-4">Recent Cases</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e4df] dark:border-[#2d2d45]">
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#6b6b80] uppercase tracking-wider">Case No.</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#6b6b80] uppercase tracking-wider">Title</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#6b6b80] uppercase tracking-wider">Petitioner</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#6b6b80] uppercase tracking-wider">Advocate</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#6b6b80] uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-[#6b6b80] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.slice(0, 5).map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                      className="border-b border-[#e5e4df] dark:border-[#2d2d45] hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a2e] transition-colors group">
                      <td className="py-4 px-4 text-sm text-red-600 font-mono font-semibold">{c.case_number || c.caseNumber}</td>
                      <td className="py-4 px-4 text-sm text-[#1a1a2e] dark:text-white max-w-xs truncate">{c.title}</td>
                      <td className="py-4 px-4 text-sm text-[#6b6b80] max-w-[150px] truncate" title={c.petitioner}>{c.petitioner || 'Unknown'}</td>
                      <td className="py-4 px-4 text-sm text-[#6b6b80] max-w-[150px] truncate" title={c.advocate ? c.advocate.name : 'Unassigned'}>{c.advocate ? c.advocate.name : 'Unassigned'}</td>
                      <td className="py-4 px-4"><StatusBadge status={c.status} size="sm" /></td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setSelectedCase(c); setShowQRModal(true); }} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-500 transition-colors"><QrCode className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedCase(c); setShowViewModal(true); }} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-500 transition-colors"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { 
                            setSelectedCase(c); 
                            setFormData({
                              title: c.title,
                              caseType: c.caseType || c.case_type || 'Civil',
                              petitioner: c.petitioner,
                              respondent: c.respondent,
                              priority: c.priority || 'medium',
                              status: c.status || 'filed',
                              advocateId: c.advocate_id || (c.advocate ? c.advocate.id : ''),
                              description: c.description || '',
                              judge: c.judge || '',
                              courtRoom: c.courtRoom || c.court_room_name || '',
                              nextHearing: c.nextHearing ? c.nextHearing.split('T')[0] : ''
                            });
                            setShowEditModal(true); 
                          }} className="p-2 rounded-lg hover:bg-amber-500/20 text-[#6b6b80] hover:text-amber-400 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Cases by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analyticsData.casesByType} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {analyticsData.casesByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d45', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {analyticsData.casesByType.slice(0, 4).map(t => (
                <div key={t.name} className="flex items-center gap-2 p-2 rounded-lg bg-[#f7f6f3] dark:bg-[#1a1a2e]">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs text-[#6b6b80]">{t.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Daily Hearings</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={analyticsData.dailyHearings}>
                <XAxis dataKey="day" stroke="#6b6b80" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d45', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Top Advocates</h3>
            <div className="space-y-3">
              {advocates.slice(0, 3).map((a, i) => (
                <div key={a.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e] hover:bg-[#efeee9] dark:hover:bg-[#2d2d45] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                    {(a.name || 'A').split(' ').pop().charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a2e] dark:text-white font-medium truncate">{a.name}</p>
                    <p className="text-xs text-[#6b6b80]">{a.active_cases || 0} active cases</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-red-600 font-semibold">★ {a.rating || a.win_rate || '4.5'}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* View Case Details Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Case Details" size="lg">
        {selectedCase && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 bg-[#f7f6f3] dark:bg-[#1a1a2e] p-6 rounded-2xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
              <div>
                <p className="text-xs text-[#6b6b80] uppercase tracking-wider mb-1">Case Number</p>
                <p className="font-mono font-bold text-red-600 text-lg">{selectedCase.caseNumber || selectedCase.case_number}</p>
              </div>
              <div>
                <p className="text-xs text-[#6b6b80] uppercase tracking-wider mb-1">Status</p>
                <StatusBadge status={selectedCase.status} />
              </div>
              <div className="col-span-2">
                <p className="text-xs text-[#6b6b80] uppercase tracking-wider mb-1">Case Title</p>
                <p className="font-semibold text-lg text-[#1a1a2e] dark:text-white">{selectedCase.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-[#232338] rounded-xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
                  <p className="text-xs text-[#6b6b80] mb-1 font-medium">Petitioner (Client)</p>
                  <p className="text-[#1a1a2e] dark:text-white font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-500" /> {selectedCase.petitioner}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-[#232338] rounded-xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
                  <p className="text-xs text-[#6b6b80] mb-1 font-medium">Respondent</p>
                  <p className="text-[#1a1a2e] dark:text-white font-semibold">{selectedCase.respondent}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-[#232338] rounded-xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
                  <p className="text-xs text-[#6b6b80] mb-1 font-medium">Assigned Advocate</p>
                  <p className="text-[#1a1a2e] dark:text-white font-semibold">
                    {selectedCase.advocate ? selectedCase.advocate.name : 'Unassigned'}
                  </p>
                  {selectedCase.advocate && <p className="text-xs text-[#6b6b80] mt-1">{selectedCase.advocate.email}</p>}
                </div>
                <div className="p-4 bg-white dark:bg-[#232338] rounded-xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
                  <p className="text-xs text-[#6b6b80] mb-1 font-medium">Priority</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedCase.priority === 'high' ? 'bg-red-500' : selectedCase.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="capitalize text-[#1a1a2e] dark:text-white font-semibold">{selectedCase.priority}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[#f7f6f3] dark:bg-[#1a1a2e]/50 rounded-xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
                <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Case Type</p>
                <p className="text-sm font-semibold text-[#1a1a2e] dark:text-white">{selectedCase.caseType}</p>
              </div>
              <div className="p-4 bg-[#f7f6f3] dark:bg-[#1a1a2e]/50 rounded-xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
                <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Court Room</p>
                <p className="text-sm font-semibold text-[#1a1a2e] dark:text-white">{selectedCase.courtRoom || 'N/A'}</p>
              </div>
              <div className="p-4 bg-[#f7f6f3] dark:bg-[#1a1a2e]/50 rounded-xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
                <p className="text-[10px] text-[#6b6b80] uppercase mb-1">Judge</p>
                <p className="text-sm font-semibold text-[#1a1a2e] dark:text-white">{selectedCase.judge || 'N/A'}</p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#232338] rounded-xl border-2 border-[#e5e4df] dark:border-[#2d2d45]">
              <p className="text-xs text-[#6b6b80] mb-2 font-medium">Description</p>
              <p className="text-sm text-[#1a1a2e] dark:text-white leading-relaxed">{selectedCase.description || 'No description provided.'}</p>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-3 bg-[#1a1a2e] text-white rounded-xl font-bold hover:bg-[#2d2d45] transition-all">Close Details</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCaseModal} onClose={() => setShowCaseModal(false)} title="Register New Case" size="lg">
        <form className="space-y-5" onSubmit={async (e) => {
          e.preventDefault();
          try {
            await casesAPI.create(formData);
            setShowCaseModal(false);
            window.location.reload(); // Quick refresh to show new case
          } catch (err) {
            alert('Failed to create case: ' + err.message);
          }
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="e.g. Sharma vs State of Delhi" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Petitioner (Client Name)</label>
              <input type="text" required value={formData.petitioner} onChange={(e) => setFormData({...formData, petitioner: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="Full name of petitioner" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Respondent</label>
              <input type="text" required value={formData.respondent} onChange={(e) => setFormData({...formData, respondent: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="Opposing party" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Type</label>
              <select value={formData.caseType} onChange={(e) => setFormData({...formData, caseType: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="Civil">Civil</option>
                <option value="Criminal">Criminal</option>
                <option value="Family">Family</option>
                <option value="Consumer">Consumer</option>
                <option value="MACT">Motor Accident</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Assign Advocate</label>
              <select required value={formData.advocateId} onChange={(e) => setFormData({...formData, advocateId: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="">Select Advocate...</option>
                {advocates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Court Room</label>
              <input type="text" value={formData.courtRoom} onChange={(e) => setFormData({...formData, courtRoom: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="e.g. Room 102" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="filed">Filed</option>
                <option value="under_review">Under Review</option>
                <option value="hearing_scheduled">Hearing Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="judgment_reserved">Judgment Reserved</option>
                <option value="closed">Closed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Next Hearing Date</label>
              <input type="date" value={formData.nextHearing} onChange={(e) => setFormData({...formData, nextHearing: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Judge Name</label>
              <input type="text" value={formData.judge} onChange={(e) => setFormData({...formData, judge: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="e.g. Justice Dixit" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Description</label>
              <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="Brief summary of the case..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCaseModal(false)} className="px-5 py-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] hover:bg-[#efeee9] dark:hover:bg-[#2d2d45] text-[#6b6b80] font-medium transition-colors border-2 border-[#e5e4df] dark:border-[#2d2d45]">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all">Create Case</button>
          </div>
        </form>
      </Modal>

      {/* Edit Case Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Case Details" size="lg">
        <form className="space-y-5" onSubmit={async (e) => {
          e.preventDefault();
          try {
            await casesAPI.update(selectedCase.databaseId || selectedCase.id, formData);
            setShowEditModal(false);
            window.location.reload();
          } catch (err) {
            alert('Failed to update case: ' + err.message);
          }
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="e.g. Sharma vs State of Delhi" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Petitioner (Client Name)</label>
              <input type="text" required value={formData.petitioner} onChange={(e) => setFormData({...formData, petitioner: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="Full name of petitioner" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Respondent</label>
              <input type="text" required value={formData.respondent} onChange={(e) => setFormData({...formData, respondent: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="Full name of respondent" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Type</label>
              <select value={formData.caseType} onChange={(e) => setFormData({...formData, caseType: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="Civil">Civil</option>
                <option value="Criminal">Criminal</option>
                <option value="Family">Family</option>
                <option value="Consumer">Consumer</option>
                <option value="MACT">Motor Accident</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Assign Advocate</label>
              <select required value={formData.advocateId} onChange={(e) => setFormData({...formData, advocateId: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="">Select Advocate...</option>
                {advocates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Court Room</label>
              <input type="text" value={formData.courtRoom} onChange={(e) => setFormData({...formData, courtRoom: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="e.g. Room 102" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="filed">Filed</option>
                <option value="under_review">Under Review</option>
                <option value="hearing_scheduled">Hearing Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="judgment_reserved">Judgment Reserved</option>
                <option value="closed">Closed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Next Hearing Date</label>
              <input type="date" value={formData.nextHearing} onChange={(e) => setFormData({...formData, nextHearing: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Judge Name</label>
              <input type="text" value={formData.judge} onChange={(e) => setFormData({...formData, judge: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="e.g. Justice Dixit" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Description</label>
              <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500" placeholder="Brief summary of the case..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] hover:bg-[#efeee9] dark:hover:bg-[#2d2d45] text-[#6b6b80] font-medium transition-colors border-2 border-[#e5e4df] dark:border-[#2d2d45]">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/25 hover:shadow-orange-500/40 transition-all">Update Case</button>
          </div>
        </form>
      </Modal>


      {/* QR Code Modal */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="Case QR Code" size="sm">
        {selectedCase && <div className="flex flex-col items-center"><QRCodeViewer value={`LCMS:${selectedCase.id}`} title={selectedCase.caseNumber || selectedCase.case_number} /></div>}
      </Modal>

      <ConfirmModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={async () => {
          try {
            await casesAPI.remove(selectedCase.databaseId || selectedCase.id);
            setShowDeleteConfirm(false);
            window.location.reload();
          } catch (err) {
            alert('Failed to delete case: ' + err.message);
          }
        }} 
        title="Delete Case" 
        message="Are you sure you want to delete this case? This action cannot be undone." 
        confirmText="Delete" 
        variant="danger" 
      />

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
