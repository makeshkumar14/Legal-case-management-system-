import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, ChevronRight, Clock, Download, Eye, FileText, MapPin, QrCode, Save, Scale, Users } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DATA_SYNC_EVENT, casesAPI, documentsAPI, notesAPI } from '../../services/api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useToast } from '../../components/shared/Toast';
import { getRoleTheme } from '../../utils/roleTheme';
import { useAuth } from '../../context/AuthContext';
import { openBlobInNewTab, triggerBrowserDownload } from '../../utils/fileActions';
import { formatDate, formatDateTime, formatTime, getCaseCourtRoom, getCaseFilingDate, getCaseNumber, getCaseType, getDatabaseId } from '../../utils/legalData';
import { QRCodeViewer } from '../../components/shared/QRCodeViewer';
import { Modal } from '../../components/shared/Modal';

export function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const theme = getRoleTheme(user?.role);
  const tabs = useMemo(() => ['overview', 'hearings', 'documents', 'timeline', 'notes'], []);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [showQR, setShowQR] = useState(false);
  const [reportLinks, setReportLinks] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [loading, setLoading] = useState(true);

  const filingDateValue = getCaseFilingDate(caseData);
  const daysActive = filingDateValue
    ? Math.max(0, Math.floor((Date.now() - new Date(filingDateValue).getTime()) / 86400000) || 0)
    : 0;

  const fetchCaseDetails = async () => {
    try {
      const caseRes = await casesAPI.get(id);
      setCaseData(caseRes.data);
      const [docsRes, notesRes] = await Promise.all([
        documentsAPI.list({ case_id: id }),
        notesAPI.list({ case_id: id }),
      ]);
      setDocuments(docsRes.data || []);
      setNotes(notesRes.data || []);
    } catch (err) {
      console.error('Error fetching case:', err);
      addToast({ type: 'error', title: 'Unable to load case', message: err.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab && tabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
      return;
    }
    if (!requestedTab) {
      setActiveTab('overview');
    }
  }, [searchParams, tabs]);

  useEffect(() => {
    const syncCase = () => fetchCaseDetails();
    window.addEventListener(DATA_SYNC_EVENT, syncCase);
    return () => window.removeEventListener(DATA_SYNC_EVENT, syncCase);
  }, [id]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === 'overview') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const saveNote = async () => {
    if (!noteDraft.trim()) return;
    try {
      const response = await notesAPI.create({ caseId: Number(id), content: noteDraft.trim() });
      const createdNote = response.data?.note || response.data;
      setNotes((prev) => [createdNote, ...prev]);
      setNoteDraft('');
      switchTab('notes');
      addToast({ type: 'success', title: 'Note saved', message: 'The case note has been added.' });
    } catch (err) {
      console.error('Error saving note:', err);
      addToast({ type: 'error', title: 'Unable to save note', message: err.message || 'Please try again.' });
    }
  };

  const openCaseQr = async () => {
    try {
      const response = await casesAPI.reportLinks(id);
      setReportLinks(response.data);
      setShowQR(true);
    } catch (err) {
      console.error('Error fetching report links:', err);
      addToast({ type: 'error', title: 'Unable to generate QR', message: err.message || 'Please try again.' });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#e5e4df] border-t-[#1a1a2e] rounded-full animate-spin" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-[#1a1a2e] dark:text-white mb-2">Case not found</h2>
        <p className="text-[#6b6b80] mb-6">The requested case could not be found.</p>
        <button onClick={() => navigate(-1)} className={['px-6 py-3 rounded-xl font-bold text-white', theme.accentBg].join(' ')}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#6b6b80]">
        <button onClick={() => navigate(-1)} className="hover:text-[#1a1a2e] dark:hover:text-white">Cases</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#1a1a2e] dark:text-white font-medium">{getCaseNumber(caseData)}</span>
      </div>

      <div className="p-6 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{caseData.title}</h1>
              <StatusBadge status={caseData.status} />
              <StatusBadge status={caseData.priority} />
            </div>
            <p className="text-sm text-[#6b6b80] font-mono">{getCaseNumber(caseData)} • {getCaseType(caseData)}</p>
          </div>
          <button onClick={openCaseQr} className={['p-3 rounded-xl text-white shadow-lg', theme.accentBg, theme.shadow].join(' ')}>
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[#6b6b80] text-sm mb-4">{caseData.description || 'No case description available.'}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Petitioner', value: caseData.petitioner },
            { icon: Users, label: 'Respondent', value: caseData.respondent },
            { icon: Scale, label: 'Judge', value: caseData.judge || 'Pending assignment' },
            { icon: MapPin, label: 'Court Room', value: getCaseCourtRoom(caseData) },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-[#f7f6f3]">
              <div className="flex items-center gap-2 text-xs text-[#6b6b80] mb-1">
                <item.icon className="w-3 h-3" />
                {item.label}
              </div>
              <p className="text-sm text-[#1a1a2e] font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/80 border-2 border-[#e5e4df] w-fit flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? `${theme.accentBg} text-white` : 'text-[#6b6b80] hover:text-[#1a1a2e]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] mb-4">Case Details</h3>
            <div className="space-y-3">
              {[
                ['Filing Date', formatDate(getCaseFilingDate(caseData))],
                ['Priority', caseData.priority],
                ['Status', caseData.status.replace(/_/g, ' ')],
                ['Advocate', caseData.advocate?.name || 'Not assigned'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-[#e5e4df]">
                  <span className="text-sm text-[#6b6b80]">{label}</span>
                  <span className="text-sm text-[#1a1a2e] font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] mb-4">Quick Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Hearings', caseData.hearings?.length || 0],
                ['Documents', documents.length],
                ['Notes', notes.length],
                ['Days Active', daysActive],
              ].map(([label, value]) => (
                <div key={label} className="p-3 rounded-xl bg-[#f7f6f3] text-center">
                  <p className="text-2xl font-bold text-[#1a1a2e]">{value}</p>
                  <p className="text-xs text-[#6b6b80]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'hearings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {(caseData.hearings || []).map((hearing) => (
            <div key={hearing.id} className="p-5 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm flex items-start gap-4">
              <div className={['w-12 h-12 rounded-xl flex items-center justify-center', hearing.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : theme.accentSoftBg].join(' ')}>
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[#1a1a2e] font-semibold">{hearing.type}</h4>
                  <StatusBadge status={hearing.status} size="sm" />
                </div>
                <p className="text-sm text-[#6b6b80]">
                  {formatDate(hearing.date)} • {hearing.location || getCaseCourtRoom(caseData)} • {hearing.startTime ? formatTime(hearing.startTime) : 'Time pending'}
                </p>
                {hearing.notes && <p className="text-sm text-[#6b6b80] mt-2">{hearing.notes}</p>}
              </div>
            </div>
          ))}
          {(!caseData.hearings || caseData.hearings.length === 0) && <p className="text-center text-[#6b6b80] py-8">No hearings scheduled for this matter yet.</p>}
        </motion.div>
      )}

      {activeTab === 'documents' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {documents.map((document) => (
            <div key={document.databaseId || document.id} className="p-5 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-[#1a1a2e] font-semibold">{document.title}</h4>
                <p className="text-xs text-[#6b6b80] mt-1">{document.fileType?.toUpperCase()} • {document.fileSize || document.size} • {formatDateTime(document.uploadedAt)}</p>
              </div>
              <StatusBadge status={document.status} size="sm" />
              <button onClick={() => openDocument(document)} className="p-2 rounded-lg hover:bg-blue-500/10 text-[#6b6b80] hover:text-blue-600 transition-colors" title="View document">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => downloadDocument(document)} className="p-2 rounded-lg hover:bg-blue-500/10 text-[#6b6b80] hover:text-blue-600 transition-colors" title="Download document">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
          {documents.length === 0 && <p className="text-center text-[#6b6b80] py-8">No documents uploaded for this case yet.</p>}
        </motion.div>
      )}

      {activeTab === 'timeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm">
          <div className="space-y-6">
            {(caseData.timeline || []).map((item, index) => (
              <div key={`${item.event}-${index}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={['w-3 h-3 rounded-full mt-1.5', theme.accentBg].join(' ')} />
                  {index < (caseData.timeline || []).length - 1 && <div className="w-0.5 flex-1 bg-[#e5e4df]" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs text-[#6b6b80]">{formatDate(item.date)}</p>
                  <p className="text-sm text-[#1a1a2e] font-medium">{item.event}</p>
                  <p className="text-xs text-[#6b6b80] mt-1">{item.description}</p>
                </div>
              </div>
            ))}
            {(!caseData.timeline || caseData.timeline.length === 0) && <p className="text-[#6b6b80]">No timeline entries are available yet.</p>}
          </div>
        </motion.div>
      )}

      {activeTab === 'notes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {(user?.role === 'advocate' || user?.role === 'court') && (
            <div className="p-5 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm">
              <h3 className="font-semibold text-[#1a1a2e] mb-3">Add a working note</h3>
              <textarea rows={4} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} className="w-full px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-[#1a1a2e] focus:outline-none resize-none" placeholder="Capture strategy notes, hearing prep, or follow-up items..." />
              <button onClick={saveNote} className={['mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-lg', theme.accentBg, theme.shadow].join(' ')}>
                <Save className="w-4 h-4" />
                Save note
              </button>
            </div>
          )}

          {notes.map((note) => (
            <div key={note.databaseId || note.id} className="p-5 rounded-2xl bg-white/80 border-2 border-[#e5e4df] shadow-sm">
              <p className="text-sm text-[#1a1a2e]">{note.content}</p>
              <p className="text-xs text-[#6b6b80] mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDateTime(note.updatedAt || note.createdAt)}
              </p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-center text-[#6b6b80] py-8">No notes have been added yet.</p>}
        </motion.div>
      )}

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="Case QR Code" size="sm">
        <div className="flex flex-col items-center">
          <QRCodeViewer value={reportLinks?.pdfUrl || `LCMS:${getCaseNumber(caseData)}`} title={getCaseNumber(caseData)} />
          {reportLinks?.pdfUrl && (
            <a href={reportLinks.pdfUrl} target="_blank" rel="noreferrer" className={['mt-4 px-4 py-2.5 rounded-xl text-white font-semibold', theme.accentBg].join(' ')}>
              Open case PDF
            </a>
          )}
        </div>
      </Modal>
    </div>
  );
}
