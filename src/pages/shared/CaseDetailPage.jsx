import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, MapPin, Users, Clock, QrCode, X, ChevronRight, Scale, AlertCircle, CheckCircle, Timer } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { casesAPI, documentsAPI, notesAPI } from '../../services/api';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showQR, setShowQR] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [caseEvidence, setCaseEvidence] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const caseRes = await casesAPI.get(id);
        setCaseData(caseRes.data);
        const [docsRes, notesRes] = await Promise.all([
          documentsAPI.list({ case_id: id }),
          notesAPI.list({ case_id: id })
        ]);
        setCaseEvidence(docsRes.data.documents || docsRes.data || []);
        setNotes(notesRes.data.notes || notesRes.data || []);
      } catch (err) {
        console.error('Error fetching case:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#b4f461]/30 border-t-[#b4f461] rounded-full animate-spin" />
    </div>
  );

  if (!caseData) return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      <h2 className="text-2xl font-bold text-[#1a1a2e] dark:text-white mb-2">Case Not Found</h2>
      <p className="text-[#6b6b80] mb-6">The requested case could not be found.</p>
      <button onClick={() => navigate(-1)} className="px-6 py-3 bg-[#b4f461] text-[#1a1a2e] font-bold rounded-xl">Go Back</button>
    </div>
  );

  const tabs = ['overview', 'hearings', 'documents', 'timeline', 'notes'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#6b6b80]">
        <button onClick={() => navigate(-1)} className="hover:text-[#1a1a2e] dark:hover:text-white">Cases</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#1a1a2e] dark:text-white font-medium">{caseData.caseNumber}</span>
      </div>

      <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{caseData.title}</h1>
              <StatusBadge status={caseData.status} />
            </div>
            <p className="text-sm text-[#6b6b80] font-mono">{caseData.caseNumber} • {caseData.caseType}</p>
          </div>
          <button onClick={() => setShowQR(true)} className="p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e] hover:bg-[#b4f461]/20 text-[#6b6b80] hover:text-[#2d6a25] transition-all">
            <QrCode className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[#6b6b80] text-sm mb-4">{caseData.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Petitioner', value: caseData.petitioner },
            { icon: Users, label: 'Respondent', value: caseData.respondent },
            { icon: Scale, label: 'Judge', value: caseData.judge },
            { icon: MapPin, label: 'Court Room', value: caseData.courtRoom },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e]">
              <div className="flex items-center gap-2 text-xs text-[#6b6b80] mb-1"><item.icon className="w-3 h-3" />{item.label}</div>
              <p className="text-sm text-[#1a1a2e] dark:text-white font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] w-fit">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-[#b4f461] text-[#1a1a2e]' : 'text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Case Details</h3>
            <div className="space-y-3">
              {[['Filing Date', caseData.filingDate], ['Priority', caseData.priority], ['Status', caseData.status.replace('_',' ')], ['Advocate', caseData.advocate]].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[#e5e4df] dark:border-[#2d2d45]">
                  <span className="text-sm text-[#6b6b80]">{k}</span>
                  <span className="text-sm text-[#1a1a2e] dark:text-white font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[['Hearings', caseData.hearings?.length || 0], ['Documents', caseEvidence.length], ['Notes', notes.length], ['Days Active', Math.floor((Date.now() - new Date(caseData.filingDate).getTime()) / 86400000)]].map(([k,v]) => (
                <div key={k} className="p-3 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e] text-center">
                  <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{v}</p>
                  <p className="text-xs text-[#6b6b80]">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'hearings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {(caseData.hearings || []).map((h, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${h.status === 'completed' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                {h.status === 'completed' ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Timer className="w-6 h-6 text-amber-500" />}
              </div>
              <div className="flex-1">
                <h4 className="text-[#1a1a2e] dark:text-white font-semibold">{h.type}</h4>
                <div className="flex items-center gap-3 text-xs text-[#6b6b80] mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{h.date}</span>
                  <StatusBadge status={h.status} size="sm" />
                </div>
                {h.notes && <p className="text-sm text-[#6b6b80] mt-2">{h.notes}</p>}
              </div>
            </div>
          ))}
          {(!caseData.hearings || caseData.hearings.length === 0) && <p className="text-center text-[#6b6b80] py-8">No hearings scheduled</p>}
        </motion.div>
      )}

      {activeTab === 'documents' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {caseEvidence.map((e, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"><FileText className="w-6 h-6 text-blue-500" /></div>
              <div className="flex-1">
                <h4 className="text-[#1a1a2e] dark:text-white font-semibold">{e.title}</h4>
                <p className="text-xs text-[#6b6b80] mt-1">{e.fileType} • {e.fileSize} • {e.uploadedAt}</p>
              </div>
              <StatusBadge status={e.status} size="sm" />
            </div>
          ))}
          {caseEvidence.length === 0 && <p className="text-center text-[#6b6b80] py-8">No documents uploaded</p>}
        </motion.div>
      )}

      {activeTab === 'timeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <div className="space-y-6">
            {[{ date: caseData.filingDate, event: 'Case Filed', desc: `${caseData.caseType} case registered` },
              ...(caseData.hearings || []).map(h => ({ date: h.date, event: h.type, desc: h.notes || `Hearing ${h.status}` }))
            ].sort((a,b) => new Date(b.date) - new Date(a.date)).map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full bg-[#b4f461] mt-1.5" />{i < 5 && <div className="w-0.5 flex-1 bg-[#e5e4df] dark:bg-[#2d2d45]" />}</div>
                <div className="pb-4"><p className="text-xs text-[#6b6b80]">{item.date}</p><p className="text-sm text-[#1a1a2e] dark:text-white font-medium">{item.event}</p><p className="text-xs text-[#6b6b80] mt-1">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'notes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {notes.map((n, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
              <p className="text-sm text-[#1a1a2e] dark:text-white">{n.content}</p>
              <p className="text-xs text-[#6b6b80] mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-center text-[#6b6b80] py-8">No notes added</p>}
        </motion.div>
      )}

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#1a1a2e] rounded-3xl p-8 text-center border-2 border-[#e5e4df] dark:border-[#2d2d45]">
            <h3 className="text-lg font-bold text-[#1a1a2e] dark:text-white mb-4">Case QR Code</h3>
            <div className="w-48 h-48 bg-[#f7f6f3] rounded-xl mx-auto mb-4 flex items-center justify-center"><QrCode className="w-24 h-24 text-[#1a1a2e]" /></div>
            <p className="text-sm text-[#6b6b80]">{caseData.caseNumber}</p>
            <button onClick={() => setShowQR(false)} className="mt-4 px-6 py-2 bg-[#b4f461] text-[#1a1a2e] font-bold rounded-xl">Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
