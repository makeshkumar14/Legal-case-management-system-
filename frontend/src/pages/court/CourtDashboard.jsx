import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Gavel, Users, BarChart3, Plus, Clock, QrCode, Edit, Trash2, Eye, Search, ScanLine, Download } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Modal, ConfirmModal } from '../../components/shared/Modal';
import { QRCodeViewer } from '../../components/shared/QRCodeViewer';
import { QRCodeScanner } from '../../components/shared/QRCodeScanner';
import { useToast } from '../../components/shared/Toast';
import { casesAPI, analyticsAPI, courtroomsAPI } from '../../services/api';
import { triggerBrowserDownload } from '../../utils/fileActions';
import { CASE_STATUS_OPTIONS, formatDate, getCaseNumber, getCaseRouteId, getCaseType, isHttpUrl, toDateInputValue } from '../../utils/legalData';

const defaultFormData = {
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
  nextHearing: '',
};

export function CourtDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const [formData, setFormData] = useState(defaultFormData);

  const [cases, setCases] = useState([]);
  const [courtrooms, setCourtrooms] = useState([]);
  const [qrLinks, setQrLinks] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({ totalCases: 0, pendingCases: 0, todayHearings: 0, casesTrend: [], casesByType: [], dailyHearings: [] });
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusSavingId, setStatusSavingId] = useState(null);

  const loadDashboard = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const [casesRes, dashRes, trendRes, typeRes, hearingsRes, perfRes, roomsRes] = await Promise.all([
        casesAPI.list(),
        analyticsAPI.dashboard(),
        analyticsAPI.casesTrend(),
        analyticsAPI.casesByType(),
        analyticsAPI.dailyHearings(),
        analyticsAPI.allAdvocates(),
        courtroomsAPI.list(),
      ]);
      const dash = dashRes.data || {};
      setCases(casesRes.data || []);
      setCourtrooms(roomsRes.data || []);
      setAnalyticsData({
        totalCases: dash.totalCases || 0,
        pendingCases: dash.pendingCases || 0,
        todayHearings: dash.todayHearings || 0,
        casesTrend: trendRes.data || [],
        casesByType: typeRes.data || [],
        dailyHearings: hearingsRes.data || [],
      });
      setAdvocates(perfRes.data || []);
    } catch (err) {
      console.error('Error fetching court data:', err);
      if (!silent) {
        addToast({ type: 'error', title: 'Unable to load court dashboard', message: err.message || 'Please try again.' });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Case Number', 'Title', 'Petitioner', 'Respondent', 'Type', 'Status', 'Priority', 'Judge', 'Court Room', 'Next Hearing'];
    const rows = cases.map(c => [
      getCaseNumber(c),
      c.title,
      c.petitioner,
      c.respondent,
      getCaseType(c),
      c.status,
      c.priority,
      c.judge,
      c.courtRoom || c.court_room_name,
      formatDate(c.nextHearing || c.next_hearing)
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

  const exportCaseCSV = async (caseItem) => {
    try {
      const response = await casesAPI.exportCsv(getCaseRouteId(caseItem));
      triggerBrowserDownload(response.blob, response.filename || `${getCaseNumber(caseItem)}-details.csv`);
    } catch (err) {
      console.error('Error exporting case CSV:', err);
      addToast({ type: 'error', title: 'Unable to export case CSV', message: err.message || 'Please try again.' });
    }
  };

  const openCaseQr = async (caseItem) => {
    try {
      const response = await casesAPI.reportLinks(getCaseRouteId(caseItem));
      setSelectedCase(caseItem);
      setQrLinks(response.data);
      setShowQRModal(true);
    } catch (err) {
      console.error('Error generating QR links:', err);
      addToast({ type: 'error', title: 'Unable to generate QR', message: err.message || 'Please try again.' });
    }
  };

  const openCaseDocuments = (caseItem) => {
    navigate(`/court/cases/${getCaseRouteId(caseItem)}?tab=documents`);
  };

  const updateCaseStatus = async (caseItem, nextStatus) => {
    const caseId = getCaseRouteId(caseItem);
    if (!caseId || caseItem.status === nextStatus) return;

    setStatusSavingId(caseId);
    try {
      const response = await casesAPI.update(caseId, { status: nextStatus });
      const updatedCase = response.data?.case || {};

      setCases((currentCases) =>
        currentCases.map((item) => (
          getCaseRouteId(item) === caseId
            ? { ...item, ...updatedCase, advocate: updatedCase.advocate || item.advocate }
            : item
        ))
      );

      setSelectedCase((currentCase) => (
        getCaseRouteId(currentCase) === caseId
          ? { ...currentCase, ...updatedCase, advocate: updatedCase.advocate || currentCase?.advocate }
          : currentCase
      ));

      addToast({
        type: 'success',
        title: 'Case status updated',
        message: `The case status is now ${nextStatus.replace(/_/g, ' ')}.`,
      });
      await loadDashboard({ silent: true });
    } catch (err) {
      console.error('Error updating case status:', err);
      addToast({ type: 'error', title: 'Unable to update case status', message: err.message || 'Please try again.' });
    } finally {
      setStatusSavingId(null);
    }
  };

  const filteredCases = useMemo(() => {
    const query = searchId.trim().toLowerCase();
    if (!query) return cases.slice(0, 5);

    return cases
      .filter((caseItem) =>
        [getCaseNumber(caseItem), caseItem.title, caseItem.petitioner, caseItem.respondent]
          .some((value) => String(value || '').toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [cases, searchId]);

  const runCaseSearch = (rawValue = searchId) => {
    const query = rawValue.replace('LCMS:', '').trim();
    if (!query) return;

    const exactMatch = cases.find(
      (caseItem) => getCaseNumber(caseItem).toLowerCase() === query.toLowerCase()
    );

    if (exactMatch) {
      navigate(`/court/cases/${getCaseRouteId(exactMatch)}`);
      return;
    }

    navigate(`/court/cases?q=${encodeURIComponent(query)}`);
  };

  const populateForm = (caseItem) => {
    setFormData({
      title: caseItem.title || '',
      caseType: getCaseType(caseItem),
      petitioner: caseItem.petitioner || '',
      respondent: caseItem.respondent || '',
      priority: caseItem.priority || 'medium',
      status: caseItem.status || 'filed',
      advocateId: String(caseItem.advocateId || caseItem.advocate_id || caseItem.advocate?.id || ''),
      description: caseItem.description || '',
      judge: caseItem.judge || '',
      courtRoom: caseItem.courtRoom || caseItem.court_room_name || '',
      nextHearing: toDateInputValue(caseItem.nextHearing || caseItem.next_hearing),
    });
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

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
              <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runCaseSearch()} placeholder="Search cases..."
                className="w-64 pl-12 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all shadow-sm" />
            </div>
            <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => runCaseSearch()}
              className="flex items-center gap-2 px-4 py-3 bg-[#1a1a2e] hover:bg-[#2d2d45] text-white font-bold rounded-xl transition-all shadow-sm">
              Search
            </motion.button>
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
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#232338] hover:bg-gray-50 dark:hover:bg-[#2d2d45] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#1a1a2e] dark:text-white font-bold rounded-xl transition-all shadow-sm">
            <Download className="w-5 h-5" />Export CSV
          </motion.button>

          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setFormData(defaultFormData); setShowCaseModal(true); }}
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
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white">{searchId.trim() ? 'Matching Cases' : 'Recent Cases'}</h3>
              {searchId.trim() && (
                <button onClick={() => navigate(`/court/cases?q=${encodeURIComponent(searchId.trim())}`)} className="text-sm font-semibold text-red-500 hover:text-red-600">
                  Open full results
                </button>
              )}
            </div>
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
                  {filteredCases.map((c, i) => (
                    <motion.tr key={getCaseRouteId(c) || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                      className="border-b border-[#e5e4df] dark:border-[#2d2d45] hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a2e] transition-colors group">
                      <td className="py-4 px-4 text-sm text-red-600 font-mono font-semibold">{getCaseNumber(c)}</td>
                      <td className="py-4 px-4 text-sm text-[#1a1a2e] dark:text-white max-w-xs truncate">{c.title}</td>
                      <td className="py-4 px-4 text-sm text-[#6b6b80] max-w-[150px] truncate" title={c.petitioner}>{c.petitioner || 'Unknown'}</td>
                      <td className="py-4 px-4 text-sm text-[#6b6b80] max-w-[150px] truncate" title={c.advocate ? c.advocate.name : 'Unassigned'}>{c.advocate ? c.advocate.name : 'Unassigned'}</td>
                      <td className="py-4 px-4">
                        <div className="space-y-2 min-w-[180px]">
                          <StatusBadge status={c.status} size="sm" />
                          <select
                            value={c.status || 'filed'}
                            disabled={statusSavingId === getCaseRouteId(c)}
                            onChange={(e) => updateCaseStatus(c, e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-lg text-xs text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-60"
                          >
                            {CASE_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openCaseQr(c)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-500 transition-colors" title="Generate QR"><QrCode className="w-4 h-4" /></button>
                          <button onClick={() => openCaseDocuments(c)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-500 transition-colors" title="View documents"><FileText className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedCase(c); setShowViewModal(true); }} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-500 transition-colors"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => exportCaseCSV(c)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-500 transition-colors" title="Export case CSV"><Download className="w-4 h-4" /></button>
                          <button onClick={() => { 
                            setSelectedCase(c); 
                            populateForm(c);
                            setShowEditModal(true); 
                          }} className="p-2 rounded-lg hover:bg-amber-500/20 text-[#6b6b80] hover:text-amber-400 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedCase(c); setShowDeleteConfirm(true); }} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => openCaseDocuments(selectedCase)} className="px-6 py-3 bg-white border-2 border-[#e5e4df] text-[#1a1a2e] rounded-xl font-bold hover:bg-[#f7f6f3] transition-all">View Documents</button>
              <button onClick={() => exportCaseCSV(selectedCase)} className="px-6 py-3 bg-white border-2 border-[#e5e4df] text-[#1a1a2e] rounded-xl font-bold hover:bg-[#f7f6f3] transition-all">Export CSV</button>
              <button onClick={() => setShowViewModal(false)} className="px-6 py-3 bg-[#1a1a2e] text-white rounded-xl font-bold hover:bg-[#2d2d45] transition-all">Close Details</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCaseModal} onClose={() => setShowCaseModal(false)} title="Register New Case" size="lg">
        <form className="space-y-5" onSubmit={async (e) => {
          e.preventDefault();
          if (!formData.title.trim() || !formData.petitioner.trim() || !formData.respondent.trim() || !formData.advocateId || !formData.courtRoom) {
            addToast({ type: 'warning', title: 'Missing case details', message: 'Title, petitioner, respondent, advocate, and court room are required.' });
            return;
          }
          try {
            await casesAPI.create(formData);
            setShowCaseModal(false);
            setFormData(defaultFormData);
            addToast({ type: 'success', title: 'Case created', message: 'The new case has been registered successfully.' });
            await loadDashboard();
          } catch (err) {
            addToast({ type: 'error', title: 'Unable to create case', message: err.message || 'Please try again.' });
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
              <select required value={formData.courtRoom} onChange={(e) => setFormData({...formData, courtRoom: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="">Select Court Room...</option>
                {courtrooms.map((room) => <option key={room.id} value={room.name}>{room.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                {CASE_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
          if (!formData.title.trim() || !formData.petitioner.trim() || !formData.respondent.trim() || !formData.advocateId || !formData.courtRoom) {
            addToast({ type: 'warning', title: 'Missing case details', message: 'Title, petitioner, respondent, advocate, and court room are required.' });
            return;
          }
          try {
            await casesAPI.update(getCaseRouteId(selectedCase), formData);
            setShowEditModal(false);
            addToast({ type: 'success', title: 'Case updated', message: 'The case details have been updated successfully.' });
            await loadDashboard();
          } catch (err) {
            addToast({ type: 'error', title: 'Unable to update case', message: err.message || 'Please try again.' });
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
              <select required value={formData.courtRoom} onChange={(e) => setFormData({...formData, courtRoom: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                <option value="">Select Court Room...</option>
                {courtrooms.map((room) => <option key={room.id} value={room.name}>{room.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Case Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500">
                {CASE_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
        {selectedCase && (
          <div className="flex flex-col items-center">
            <QRCodeViewer value={qrLinks?.pdfUrl || `LCMS:${getCaseNumber(selectedCase)}`} title={getCaseNumber(selectedCase)} />
            {qrLinks?.pdfUrl && (
              <a href={qrLinks.pdfUrl} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold">
                Open case PDF
              </a>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={async () => {
          try {
            await casesAPI.remove(getCaseRouteId(selectedCase));
            setShowDeleteConfirm(false);
            setSelectedCase(null);
            addToast({ type: 'success', title: 'Case deleted', message: 'The case has been removed successfully.' });
            await loadDashboard();
          } catch (err) {
            addToast({ type: 'error', title: 'Unable to delete case', message: err.message || 'Please try again.' });
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
          if (isHttpUrl(value)) {
            setShowScanner(false);
            navigate(`/court/qr?lookup=${encodeURIComponent(value)}`);
            return;
          }
          const caseNumber = value.replace('LCMS:', '').trim();
          setSearchId(caseNumber);
          setShowScanner(false);
          runCaseSearch(value);
        }}
      />
    </div>
  );
}
