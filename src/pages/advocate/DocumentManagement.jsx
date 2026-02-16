import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Search, Grid3X3, List, CheckCircle, Clock, X, File, Image } from 'lucide-react';
import { documentsAPI, casesAPI } from '../../services/api';
import { StatusBadge } from '../../components/shared/StatusBadge';

const fileTypeIcons = { pdf: FileText, image: Image, document: FileText };
const fileTypeColors = { pdf: 'bg-red-500/20 text-red-500', image: 'bg-purple-500/20 text-purple-500', document: 'bg-blue-500/20 text-blue-500' };

export function DocumentManagement() {
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [evidences, setEvidences] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, casesRes] = await Promise.all([
          documentsAPI.list(),
          casesAPI.list()
        ]);
        setEvidences(docsRes.data.documents || docsRes.data || []);
        setCases(casesRes.data.cases || casesRes.data || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = evidences.filter(e => {
    if (filter === 'verified' && e.status !== 'verified') return false;
    if (filter === 'pending' && e.status !== 'pending') return false;
    if (searchQuery) return e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const stats = [
    { label: 'Total Documents', value: evidences.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Verified', value: evidences.filter(e => e.status === 'verified').length, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Pending', value: evidences.filter(e => e.status === 'pending').length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Total Size', value: `${evidences.length * 3.5} MB`, icon: File, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Documents</motion.h1>
          <p className="text-[#6b6b80]">Manage case documents and evidence</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all">
          <Upload className="w-5 h-5" />Upload
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-3 shadow-lg`}><s.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{s.value}</p>
            <p className="text-sm text-[#6b6b80]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search documents..."
            className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
        </div>
        <div className="flex gap-2">
          {['all', 'verified', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-orange-500/20 text-orange-700 border-2 border-orange-500/30' : 'bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80]'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}</button>))}
          <div className="flex border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-orange-500/20 text-orange-600' : 'text-[#6b6b80]'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-orange-500/20 text-orange-600' : 'text-[#6b6b80]'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e, i) => {
            const fType = e.fileType?.includes('pdf') ? 'pdf' : e.fileType?.includes('image') ? 'image' : 'document';
            const Icon = fileTypeIcons[fType]; const colorClass = fileTypeColors[fType];
            return (
              <motion.div key={e.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-orange-500/30 transition-all shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}><Icon className="w-6 h-6" /></div>
                  <StatusBadge status={e.status} size="sm" />
                </div>
                <h4 className="text-[#1a1a2e] dark:text-white font-semibold text-sm mb-1">{e.title}</h4>
                <p className="text-xs text-[#6b6b80]">{e.fileType} • {e.fileSize}</p>
                <p className="text-xs text-[#6b6b80] mt-1">{cases.find(c => c.id === e.caseId)?.caseNumber}</p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="p-4 rounded-xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] flex items-center gap-4">
              <FileText className="w-5 h-5 text-blue-500" />
              <div className="flex-1"><h4 className="text-sm text-[#1a1a2e] dark:text-white font-medium">{e.title}</h4><p className="text-xs text-[#6b6b80]">{e.fileType} • {e.fileSize}</p></div>
              <StatusBadge status={e.status} size="sm" />
            </motion.div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#1a1a2e] rounded-3xl border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white">Upload Document</h3>
              <button onClick={() => setShowUpload(false)} className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#232338] text-[#6b6b80]"><X className="w-5 h-5" /></button>
            </div>
            <div onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)} onDragOver={(e) => e.preventDefault()} onDrop={() => setDragActive(false)}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive ? 'border-orange-500 bg-orange-500/5' : 'border-[#e5e4df] dark:border-[#2d2d45]'}`}>
              <Upload className="w-12 h-12 text-[#6b6b80] mx-auto mb-4" />
              <p className="text-[#1a1a2e] dark:text-white font-medium mb-1">Drag & drop files here</p>
              <p className="text-sm text-[#6b6b80]">or click to browse</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Link to Case</label>
              <select className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                {cases.map(c => <option key={c.id} className="bg-white dark:bg-[#1a1a2e]">{c.caseNumber} - {c.title}</option>)}</select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowUpload(false)} className="px-5 py-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] text-[#6b6b80] font-medium border-2 border-[#e5e4df] dark:border-[#2d2d45]">Cancel</button>
              <button className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25">Upload</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
