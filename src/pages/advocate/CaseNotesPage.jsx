import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Edit, Trash2, Calendar, X, Save, Clock } from 'lucide-react';
import { notesAPI, casesAPI } from '../../services/api';

export function CaseNotesPage() {
  const [notes, setNotes] = useState([]);
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [newContent, setNewContent] = useState('');
  const [newCaseId, setNewCaseId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, casesRes] = await Promise.all([
          notesAPI.list(),
          casesAPI.list()
        ]);
        setNotes(notesRes.data.notes || notesRes.data || []);
        const casesData = casesRes.data.cases || casesRes.data || [];
        setCases(casesData);
        if (casesData.length > 0) setNewCaseId(casesData[0].id);
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = notes.filter(n => {
    if (selectedCase !== 'all' && n.case_id !== selectedCase && n.caseId !== selectedCase) return false;
    if (searchQuery) return (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });
  const getCaseInfo = (caseId) => cases.find(c => c.id === caseId);

  const handleSave = () => {
    if (!newContent.trim()) return;
    if (editNote) { setNotes(prev => prev.map(n => n.id === editNote.id ? { ...n, content: newContent, updatedAt: new Date().toISOString() } : n)); }
    else { setNotes(prev => [...prev, { id: `NOTE-${Date.now()}`, caseId: newCaseId, content: newContent, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]); }
    setShowEditor(false); setEditNote(null); setNewContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Legal Diary</motion.h1>
          <p className="text-[#6b6b80]">Case notes, research, and argument preparation</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditNote(null); setNewContent(''); setNewCaseId(cases[0]?.id || ''); setShowEditor(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all">
          <Plus className="w-5 h-5" />New Note</motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search notes..."
            className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
        </div>
        <select value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)} className="px-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
          <option value="all" className="bg-white dark:bg-[#1a1a2e]">All Cases</option>
          {cases.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-[#1a1a2e]">{c.caseNumber}</option>)}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((note, i) => {
          const caseInfo = getCaseInfo(note.caseId);
          return (
            <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-orange-500/30 transition-all shadow-sm group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-orange-600 bg-orange-500/10 px-2 py-1 rounded-lg">{caseInfo?.caseNumber}</span>
                  <span className="text-xs text-[#6b6b80]">{caseInfo?.title?.substring(0, 30)}...</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditNote(note); setNewContent(note.content); setNewCaseId(note.caseId); setShowEditor(true); }} className="p-1.5 rounded-lg hover:bg-orange-500/20 text-[#6b6b80] hover:text-orange-500"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setNotes(prev => prev.filter(n => n.id !== note.id))} className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-[#1a1a2e] dark:text-white text-sm leading-relaxed mb-4">{note.content}</p>
              <div className="flex items-center gap-3 text-xs text-[#6b6b80]">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(note.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16"><BookOpen className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">No notes found</h3><p className="text-[#6b6b80]">Start adding notes for your cases</p></div>
      )}

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditor(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#1a1a2e] rounded-3xl border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white">{editNote ? 'Edit Note' : 'New Note'}</h3>
              <button onClick={() => setShowEditor(false)} className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#232338] text-[#6b6b80]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Case</label>
                <select value={newCaseId} onChange={(e) => setNewCaseId(e.target.value)} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                  {cases.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-[#1a1a2e]">{c.caseNumber} - {c.title}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Note</label>
                <textarea rows={6} value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none resize-none" placeholder="Write your notes..." /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] text-[#6b6b80] font-medium border-2 border-[#e5e4df] dark:border-[#2d2d45]">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25"><Save className="w-4 h-4" />Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
