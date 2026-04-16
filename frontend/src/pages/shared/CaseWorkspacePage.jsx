import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Download, FileText, Filter, FolderOpen, Search, Timer } from 'lucide-react';
import { casesAPI } from '../../services/api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useToast } from '../../components/shared/Toast';
import { triggerBrowserDownload } from '../../utils/fileActions';
import { CASE_STATUS_OPTIONS, formatDate, getCaseCourtRoom, getCaseFilingDate, getCaseNextHearing, getCaseNumber, getCaseRouteId, getCaseType } from '../../utils/legalData';
import { getRoleTheme } from '../../utils/roleTheme';

function buildStats(role, items) {
  const active = items.filter((item) => !['closed', 'dismissed'].includes(item.status)).length;
  const scheduled = items.filter((item) => item.status === 'hearing_scheduled').length;
  const closed = items.filter((item) => item.status === 'closed').length;
  const nextHearing = items
    .map((item) => getCaseNextHearing(item))
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0];

  if (role === 'court') {
    return [
      { label: 'Total Cases', value: items.length, icon: FolderOpen },
      { label: 'Active Matters', value: active, icon: FileText },
      { label: 'Scheduled Hearings', value: scheduled, icon: Calendar },
      { label: 'Closed Cases', value: closed, icon: Timer },
    ];
  }

  if (role === 'advocate') {
    return [
      { label: 'Assigned Cases', value: items.length, icon: FolderOpen },
      { label: 'Active Briefs', value: active, icon: FileText },
      { label: 'Upcoming Hearings', value: scheduled, icon: Calendar },
      { label: 'Last Closed', value: closed, icon: Timer },
    ];
  }

  return [
    { label: 'My Cases', value: items.length, icon: FolderOpen },
    { label: 'Open Cases', value: active, icon: FileText },
    { label: 'Upcoming Hearings', value: nextHearing ? formatDate(nextHearing, { day: 'numeric', month: 'short' }) : 'None', icon: Calendar },
    { label: 'Resolved', value: closed, icon: Timer },
  ];
}

export function CaseWorkspacePage({ title, description, role }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const theme = getRoleTheme(role);

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusSavingId, setStatusSavingId] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesAPI.list();
        setCases(res.data || []);
      } catch (err) {
        console.error('Error fetching cases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  useEffect(() => {
    const current = searchParams.get('q') || '';
    const nextValue = searchQuery.trim();
    if (current === nextValue) return;

    const next = new URLSearchParams(searchParams);
    if (nextValue) next.set('q', nextValue);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  }, [searchQuery, searchParams, setSearchParams]);

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const matchesSearch = !searchQuery || [
        item.title,
        item.description,
        getCaseNumber(item),
        item.petitioner,
        item.respondent,
        getCaseType(item),
      ].some((value) => String(value || '').toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      return true;
    });
  }, [cases, priorityFilter, searchQuery, statusFilter]);

  const stats = buildStats(role, cases);
  const statuses = ['all', ...new Set(cases.map((item) => item.status).filter(Boolean))];

  const exportCaseCSV = async (caseItem) => {
    try {
      const response = await casesAPI.exportCsv(getCaseRouteId(caseItem));
      triggerBrowserDownload(response.blob, response.filename || `${getCaseNumber(caseItem)}-details.csv`);
    } catch (err) {
      console.error('Error exporting case CSV:', err);
      addToast({ type: 'error', title: 'Unable to export case CSV', message: err.message || 'Please try again.' });
    }
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
      addToast({
        type: 'success',
        title: 'Case status updated',
        message: `The case status is now ${nextStatus.replace(/_/g, ' ')}.`,
      });
    } catch (err) {
      console.error('Error updating case status:', err);
      addToast({ type: 'error', title: 'Unable to update case status', message: err.message || 'Please try again.' });
    } finally {
      setStatusSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={['w-8 h-8 border-4 rounded-full animate-spin', theme.accentBorder, theme.accentBg].join(' ')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">
            {title}
          </motion.h1>
          <p className="text-[#6b6b80]">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="p-5 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm"
          >
            <div className={['w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-lg text-white', theme.accentBg, theme.shadow].join(' ')}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#1a1a2e]">{stat.value}</p>
            <p className="text-sm text-[#6b6b80]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case number, title, or party..."
            className={['w-full pl-11 pr-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] placeholder:text-[#6b6b80] focus:outline-none', theme.accentRing].join(' ')}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#6b6b80]">
            <Filter className="w-4 h-4" />
            Filters
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-sm text-[#1a1a2e]">
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-sm text-[#1a1a2e]">
            {['all', 'high', 'medium', 'low'].map((priority) => (
              <option key={priority} value={priority}>
                {priority === 'all' ? 'All Priorities' : priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredCases.map((item, index) => (
          <motion.div
            key={getCaseRouteId(item) || item.id || index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={['p-5 rounded-2xl bg-white/80 border-2 border-[#e5e4df] transition-all shadow-sm', theme.hoverBorder].join(' ')}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={['text-xs font-mono px-2.5 py-1 rounded-full', theme.pill].join(' ')}>{getCaseNumber(item)}</span>
                  <StatusBadge status={item.status} size="sm" />
                  <StatusBadge status={item.priority} size="sm" />
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#f7f6f3] text-[#6b6b80]">{getCaseType(item)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1a1a2e]">{item.title}</h3>
                  <p className="text-sm text-[#6b6b80] line-clamp-2 mt-1">{item.description || 'No case summary has been added yet.'}</p>
                </div>
                <div className="grid md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-[#f7f6f3]">
                    <p className="text-xs text-[#6b6b80] mb-1">Petitioner</p>
                    <p className="text-[#1a1a2e] font-medium">{item.petitioner}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f7f6f3]">
                    <p className="text-xs text-[#6b6b80] mb-1">Respondent</p>
                    <p className="text-[#1a1a2e] font-medium">{item.respondent}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f7f6f3]">
                    <p className="text-xs text-[#6b6b80] mb-1">Filed</p>
                    <p className="text-[#1a1a2e] font-medium">{formatDate(getCaseFilingDate(item))}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f7f6f3]">
                    <p className="text-xs text-[#6b6b80] mb-1">Court Room</p>
                    <p className="text-[#1a1a2e] font-medium">{getCaseCourtRoom(item)}</p>
                  </div>
                </div>
              </div>

              <div className="min-w-52 space-y-3">
                <div className="p-4 rounded-2xl bg-[#f7f6f3]">
                  <p className="text-xs text-[#6b6b80] mb-1">Next Hearing</p>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{formatDate(getCaseNextHearing(item))}</p>
                  <p className="text-xs text-[#6b6b80] mt-1">{item.judge || 'Judge not assigned'}</p>
                </div>
                {role === 'court' ? (
                  <div className="space-y-2">
                    <div className="p-4 rounded-2xl bg-[#f7f6f3]">
                      <p className="text-xs text-[#6b6b80] mb-2">Update Status</p>
                      <select
                        value={item.status || 'filed'}
                        disabled={statusSavingId === getCaseRouteId(item)}
                        onChange={(e) => updateCaseStatus(item, e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-[#e5e4df] rounded-xl text-sm text-[#1a1a2e] focus:outline-none"
                      >
                        {CASE_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        const routeId = getCaseRouteId(item);
                        if (routeId) navigate(`/${role}/cases/${routeId}?tab=documents`);
                      }}
                      className="w-full px-4 py-3 rounded-xl font-semibold transition-all border-2 border-[#e5e4df] bg-white text-[#1a1a2e] hover:bg-[#f7f6f3]"
                    >
                      View documents
                    </button>
                    <button
                      onClick={() => exportCaseCSV(item)}
                      className="w-full px-4 py-3 rounded-xl font-semibold transition-all border-2 border-[#e5e4df] bg-white text-[#1a1a2e] hover:bg-[#f7f6f3] inline-flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        const routeId = getCaseRouteId(item);
                        if (routeId) navigate(`/${role}/cases/${routeId}`);
                      }}
                      className={['w-full px-4 py-3 rounded-xl font-semibold transition-all text-white', theme.accentBg, theme.accentHoverBg].join(' ')}
                    >
                      View case details
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const routeId = getCaseRouteId(item);
                      if (routeId) navigate(`/${role}/cases/${routeId}`);
                    }}
                    className={['w-full px-4 py-3 rounded-xl font-semibold transition-all text-white', theme.accentBg, theme.accentHoverBg].join(' ')}
                  >
                    View case details
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-20 rounded-2xl bg-white/70 border-2 border-dashed border-[#e5e4df]">
          <FolderOpen className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[#1a1a2e] mb-2">No cases matched your filters</h3>
          <p className="text-[#6b6b80]">Try clearing the filters or using a different search term.</p>
        </div>
      )}
    </div>
  );
}
