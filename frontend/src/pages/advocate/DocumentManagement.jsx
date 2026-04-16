import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, FileText, Grid3X3, Image, List, Pencil, Search, Trash2, Upload, Video, X } from 'lucide-react';
import { DATA_SYNC_EVENT, casesAPI, documentsAPI } from '../../services/api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useToast } from '../../components/shared/Toast';
import { openBlobInNewTab, triggerBrowserDownload } from '../../utils/fileActions';
import { formatDateTime, getCaseNumber, getDatabaseId } from '../../utils/legalData';

const fileTypeIcons = {
  pdf: FileText,
  jpg: Image,
  jpeg: Image,
  png: Image,
  gif: Image,
  mp4: Video,
};

const fileTypeColors = {
  pdf: 'bg-red-500/20 text-red-500',
  jpg: 'bg-purple-500/20 text-purple-500',
  jpeg: 'bg-purple-500/20 text-purple-500',
  png: 'bg-purple-500/20 text-purple-500',
  gif: 'bg-purple-500/20 text-purple-500',
  mp4: 'bg-blue-500/20 text-blue-500',
};

const emptyForm = { title: '', caseId: '', file: null };

export function DocumentManagement() {
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [docsRes, casesRes] = await Promise.all([documentsAPI.list(), casesAPI.list()]);
      const documentRows = docsRes.data || [];
      const caseRows = casesRes.data || [];
      setDocuments(documentRows);
      setCases(caseRows);
      setUploadForm((prev) => ({
        ...prev,
        caseId: prev.caseId || String(caseRows[0]?.databaseId || ''),
      }));
    } catch (err) {
      console.error('Error fetching documents:', err);
      addToast({ type: 'error', title: 'Unable to load documents', message: err.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const syncData = async () => {
      if (!isMounted) return;
      await loadData();
    };

    syncData();
    window.addEventListener(DATA_SYNC_EVENT, syncData);
    return () => {
      isMounted = false;
      window.removeEventListener(DATA_SYNC_EVENT, syncData);
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((item) => {
      const linkedCase = cases.find((caseItem) => String(caseItem.databaseId) === String(item.caseId));
      const searchableText = [item.title, item.fileType, linkedCase?.title, linkedCase?.caseNumber].join(' ').toLowerCase();

      if (filter === 'verified' && item.status !== 'verified') return false;
      if (filter === 'pending' && item.status !== 'pending') return false;
      if (searchQuery && !searchableText.includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [cases, documents, filter, searchQuery]);

  const stats = [
    { label: 'Total Documents', value: documents.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Verified', value: documents.filter((item) => item.status === 'verified').length, icon: Upload, color: 'bg-emerald-500' },
    { label: 'Pending', value: documents.filter((item) => item.status === 'pending').length, icon: Upload, color: 'bg-amber-500' },
    { label: 'Linked Cases', value: new Set(documents.map((item) => item.caseId)).size, icon: FileText, color: 'bg-purple-500' },
  ];

  const resetForm = (caseId = '') => {
    setUploadForm({ ...emptyForm, caseId });
    setEditingDocument(null);
  };

  const openCreateModal = () => {
    resetForm(String(cases[0]?.databaseId || ''));
    setShowUpload(true);
  };

  const openEditModal = (document) => {
    setEditingDocument(document);
    setUploadForm({
      title: document.title || '',
      caseId: String(document.caseId || ''),
      file: null,
    });
    setShowUpload(true);
  };

  const submitDocument = async () => {
    if (!uploadForm.caseId) {
      addToast({ type: 'warning', title: 'Case required', message: 'Choose a case before saving the document.' });
      return;
    }

    if (!editingDocument && !uploadForm.file) {
      addToast({ type: 'warning', title: 'File required', message: 'Choose a file to upload.' });
      return;
    }

    try {
      const payload = new FormData();
      payload.append('caseId', uploadForm.caseId);
      payload.append('title', uploadForm.title || uploadForm.file?.name || editingDocument?.title || 'Document');
      if (uploadForm.file) {
        payload.append('file', uploadForm.file);
      }

      if (editingDocument) {
        await documentsAPI.update(getDatabaseId(editingDocument), payload);
        addToast({ type: 'success', title: 'Document updated', message: 'The evidence record has been updated successfully.' });
      } else {
        await documentsAPI.upload(payload);
        addToast({ type: 'success', title: 'Document uploaded', message: 'The evidence record has been added successfully.' });
      }

      setShowUpload(false);
      resetForm(String(uploadForm.caseId));
      await loadData();
    } catch (err) {
      console.error('Error saving document:', err);
      addToast({ type: 'error', title: 'Unable to save document', message: err.message || 'Please try again.' });
    }
  };

  const removeDocument = async (document) => {
    const databaseId = getDatabaseId(document);
    if (!databaseId) return;

    try {
      await documentsAPI.remove(databaseId);
      setDocuments((prev) => prev.filter((item) => getDatabaseId(item) !== databaseId));
      addToast({ type: 'success', title: 'Document removed', message: 'The document has been removed from this case.' });
    } catch (err) {
      console.error('Error deleting document:', err);
      addToast({ type: 'error', title: 'Unable to delete document', message: err.message || 'Please try again.' });
    }
  };

  const openDocument = async (document) => {
    try {
      const response = await documentsAPI.file(getDatabaseId(document));
      openBlobInNewTab(response.blob);
    } catch (err) {
      console.error('Error opening document:', err);
      addToast({ type: 'error', title: 'Unable to open document', message: err.message || 'Please try again.' });
    }
  };

  const downloadDocument = async (document) => {
    try {
      const response = await documentsAPI.file(getDatabaseId(document), { download: true });
      triggerBrowserDownload(response.blob, response.filename || `${document.title}.${document.fileType}`);
    } catch (err) {
      console.error('Error downloading document:', err);
      addToast({ type: 'error', title: 'Unable to download document', message: err.message || 'Please try again.' });
    }
  };

  const renderActions = (document) => (
    <div className="flex items-center gap-1">
      <button onClick={() => openDocument(document)} className="p-2 rounded-lg hover:bg-orange-500/10 text-[#6b6b80] hover:text-orange-500 transition-colors" title="View document">
        <Eye className="w-4 h-4" />
      </button>
      <button onClick={() => downloadDocument(document)} className="p-2 rounded-lg hover:bg-orange-500/10 text-[#6b6b80] hover:text-orange-500 transition-colors" title="Download document">
        <Download className="w-4 h-4" />
      </button>
      <button onClick={() => openEditModal(document)} className="p-2 rounded-lg hover:bg-orange-500/10 text-[#6b6b80] hover:text-orange-500 transition-colors" title="Edit document">
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={() => removeDocument(document)} className="p-2 rounded-lg hover:bg-red-500/10 text-[#6b6b80] hover:text-red-500 transition-colors" title="Delete document">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  const renderCard = (document) => {
    const fileType = document.fileType?.toLowerCase() || 'pdf';
    const Icon = fileTypeIcons[fileType] || FileText;
    const colorClass = fileTypeColors[fileType] || 'bg-blue-500/20 text-blue-500';
    const linkedCase = cases.find((item) => String(item.databaseId) === String(document.caseId));

    return (
      <div key={document.databaseId || document.id} className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-orange-500/30 transition-all shadow-sm group">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={document.status} size="sm" />
            {renderActions(document)}
          </div>
        </div>
        <h4 className="text-[#1a1a2e] dark:text-white font-semibold text-sm mb-1">{document.title}</h4>
        <p className="text-xs text-[#6b6b80]">{document.fileType?.toUpperCase()} • {document.fileSize || document.size}</p>
        <p className="text-xs text-[#6b6b80] mt-1">{linkedCase ? getCaseNumber(linkedCase) : `Case ${document.caseId}`}</p>
        <p className="text-xs text-[#6b6b80] mt-2">{formatDateTime(document.uploadedAt)}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Documents</motion.h1>
          <p className="text-[#6b6b80]">Upload, update, view, and organize evidence linked to your assigned cases.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreateModal} className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all">
          <Upload className="w-5 h-5" />
          Upload
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

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search documents..." className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
        </div>
        <div className="flex gap-2">
          {['all', 'verified', 'pending'].map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === item ? 'bg-orange-500/20 text-orange-700 border-2 border-orange-500/30' : 'bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80]'}`}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
          <div className="flex border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-orange-500/20 text-orange-600' : 'text-[#6b6b80]'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-orange-500/20 text-orange-600' : 'text-[#6b6b80]'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(renderCard)}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((document) => {
            const linkedCase = cases.find((item) => String(item.databaseId) === String(document.caseId));
            return (
              <div key={document.databaseId || document.id} className="p-4 rounded-xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] flex items-center gap-4">
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <h4 className="text-sm text-[#1a1a2e] dark:text-white font-medium">{document.title}</h4>
                  <p className="text-xs text-[#6b6b80]">{document.fileType?.toUpperCase()} • {document.fileSize || document.size} • {linkedCase ? getCaseNumber(linkedCase) : `Case ${document.caseId}`} • {formatDateTime(document.uploadedAt)}</p>
                </div>
                <StatusBadge status={document.status} size="sm" />
                {renderActions(document)}
              </div>
            );
          })}
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white/70 border-2 border-dashed border-[#e5e4df] dark:border-[#2d2d45]">
          <FileText className="w-14 h-14 text-[#6b6b80] mx-auto mb-4 opacity-60" />
          <p className="text-[#6b6b80]">No documents match your current filters.</p>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-[#1a1a2e] rounded-3xl border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white">{editingDocument ? 'Update Document' : 'Upload Document'}</h3>
              <button onClick={() => setShowUpload(false)} className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#232338] text-[#6b6b80]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Document Title</label>
                <input type="text" value={uploadForm.title} onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" placeholder="Optional display title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Link to Case</label>
                <select value={uploadForm.caseId} onChange={(e) => setUploadForm((prev) => ({ ...prev, caseId: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                  <option value="">Select case...</option>
                  {cases.map((caseItem) => (
                    <option key={caseItem.databaseId} value={caseItem.databaseId}>
                      {getCaseNumber(caseItem)} - {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="border-2 border-dashed border-[#e5e4df] dark:border-[#2d2d45] rounded-2xl p-8 text-center">
                <Upload className="w-12 h-12 text-[#6b6b80] mx-auto mb-4" />
                <p className="text-[#1a1a2e] dark:text-white font-medium mb-1">
                  {uploadForm.file ? uploadForm.file.name : editingDocument ? `Current file: ${editingDocument.fileName || editingDocument.title}` : 'Select a file to upload'}
                </p>
                <p className="text-sm text-[#6b6b80] mb-4">
                  {editingDocument ? 'Choose a new file only if you want to replace the current evidence.' : 'Supported: PDF, images, videos, Office documents'}
                </p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setUploadForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
                <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold shadow-lg shadow-orange-500/25">
                  {editingDocument ? 'Replace File' : 'Choose File'}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowUpload(false)} className="px-5 py-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] text-[#6b6b80] font-medium border-2 border-[#e5e4df] dark:border-[#2d2d45]">Cancel</button>
              <button onClick={submitDocument} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25">
                {editingDocument ? 'Update' : 'Upload'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
