import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X, ChevronDown, Calendar, FileText, AlertTriangle, Clock } from 'lucide-react';
import { casesAPI } from '../../services/api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const caseTypes = ['All Types', 'Civil', 'Criminal', 'Family', 'Consumer', 'MACT'];
const priorities = ['All', 'high', 'medium', 'low'];
const statuses = ['All', 'hearing_scheduled', 'under_review', 'investigation', 'evidence_review', 'closed', 'dismissed'];

export function AdvancedSearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('filingDate');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesAPI.list();
        setCases(res.data.cases || res.data || []);
      } catch (err) {
        console.error('Error fetching cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filtered = cases.filter(c => {
    if (query) { const q = query.toLowerCase(); if (![c.title, c.case_number || c.caseNumber, c.petitioner, c.respondent, c.description].some(f => f?.toLowerCase().includes(q))) return false; }
    if (selectedType !== 'All Types' && c.case_type !== selectedType && c.caseType !== selectedType) return false;
    if (selectedPriority !== 'All' && c.priority !== selectedPriority) return false;
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    return true;
  }).sort((a, b) => sortBy === 'title' ? a.title.localeCompare(b.title) : new Date(b.filing_date || b.filingDate) - new Date(a.filing_date || a.filingDate));

  const activeFilters = [selectedType !== 'All Types', selectedPriority !== 'All', selectedStatus !== 'All'].filter(Boolean).length;
  const clearFilters = () => { setSelectedType('All Types'); setSelectedPriority('All'); setSelectedStatus('All'); };

  return (
    <div className="space-y-6">
      <div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Search Cases</motion.h1>
        <p className="text-[#6b6b80]">Find cases by keyword, filters, or case number</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, case number, petitioner, respondent..."
            className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-2xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#b4f461]/30 focus:border-[#b4f461] transition-all text-lg" />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowFilters(!showFilters)}
          className="relative px-5 py-4 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-2xl text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white transition-all flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />Filters
          {activeFilters > 0 && <span className="w-5 h-5 rounded-full bg-[#b4f461] text-[#1a1a2e] text-xs font-bold flex items-center justify-center">{activeFilters}</span>}
        </motion.button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-white">Filters</h3>
            {activeFilters > 0 && <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-500">Clear all</button>}
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div><label className="block text-xs text-[#6b6b80] mb-2">Case Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2.5 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white focus:outline-none">
                {caseTypes.map(t => <option key={t} className="bg-white dark:bg-[#1a1a2e]">{t}</option>)}</select></div>
            <div><label className="block text-xs text-[#6b6b80] mb-2">Priority</label>
              <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2.5 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white focus:outline-none">
                {priorities.map(p => <option key={p} value={p} className="bg-white dark:bg-[#1a1a2e]">{p === 'All' ? 'All Priorities' : p}</option>)}</select></div>
            <div><label className="block text-xs text-[#6b6b80] mb-2">Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2.5 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white focus:outline-none">
                {statuses.map(s => <option key={s} value={s} className="bg-white dark:bg-[#1a1a2e]">{s === 'All' ? 'All Statuses' : s.replace('_',' ')}</option>)}</select></div>
            <div><label className="block text-xs text-[#6b6b80] mb-2">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2.5 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white focus:outline-none">
                <option value="filingDate" className="bg-white dark:bg-[#1a1a2e]">Filing Date</option><option value="title" className="bg-white dark:bg-[#1a1a2e]">Title</option></select></div>
          </div>
        </motion.div>
      )}

      <p className="text-sm text-[#6b6b80]">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</p>

      <div className="space-y-3">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => navigate(`/${user?.role}/cases/${c.id}`)}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-[#b4f461]/30 transition-all shadow-sm cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-[#b4f461] bg-[#b4f461]/10 px-2 py-0.5 rounded-lg">{c.caseNumber}</span>
                  <StatusBadge status={c.status} size="sm" />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.priority === 'high' ? 'bg-red-500/10 text-red-400' : c.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{c.priority}</span>
                </div>
                <h3 className="text-[#1a1a2e] dark:text-white font-semibold group-hover:text-[#2d6a25] transition-colors">{c.title}</h3>
              </div>
              <span className="text-xs text-[#6b6b80] bg-[#f7f6f3] dark:bg-[#1a1a2e] px-2 py-1 rounded-lg">{c.caseType}</span>
            </div>
            <p className="text-sm text-[#6b6b80] line-clamp-1 mb-3">{c.description}</p>
            <div className="flex items-center gap-4 text-xs text-[#6b6b80]">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.filingDate}</span>
              <span>Petitioner: {c.petitioner}</span>
              <span>vs {c.respondent}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">No cases found</h3>
          <p className="text-[#6b6b80]">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
