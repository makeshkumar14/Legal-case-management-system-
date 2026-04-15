import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, FileText, QrCode, ScanLine, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { casesAPI } from '../../services/api';
import { QRCodeScanner } from '../../components/shared/QRCodeScanner';
import { QRCodeViewer } from '../../components/shared/QRCodeViewer';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useToast } from '../../components/shared/Toast';
import { extractSharedCaseToken, formatDate, getCaseNumber, getCaseRouteId, isHttpUrl } from '../../utils/legalData';

export function QRCodeCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [selectedCaseLinks, setSelectedCaseLinks] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesAPI.list();
        const caseRows = res.data || [];
        setCases(caseRows);
        if (caseRows[0]?.databaseId) setSelectedCaseId(String(caseRows[0].databaseId));
      } catch (err) {
        console.error('Error fetching cases for QR center:', err);
        addToast({ type: 'error', title: 'Unable to load QR cases', message: err.message || 'Please try again.' });
      }
    };

    fetchCases();
  }, []);

  const selectedCase = useMemo(
    () => cases.find((item) => String(item.databaseId) === selectedCaseId),
    [cases, selectedCaseId]
  );

  useEffect(() => {
    const fetchLinks = async () => {
      if (!selectedCaseId) {
        setSelectedCaseLinks(null);
        return;
      }

      try {
        const response = await casesAPI.reportLinks(selectedCaseId);
        setSelectedCaseLinks(response.data);
      } catch (err) {
        console.error('Error fetching QR report links:', err);
        setSelectedCaseLinks(null);
      }
    };

    fetchLinks();
  }, [selectedCaseId]);

  const runLookup = useCallback(async (value) => {
    const trimmedValue = String(value ?? '').trim();
    if (!trimmedValue) return;

    try {
      if (isHttpUrl(trimmedValue)) {
        const shareToken = extractSharedCaseToken(trimmedValue);
        if (!shareToken) {
          window.open(trimmedValue, '_blank', 'noopener,noreferrer');
          return;
        }

        const response = await casesAPI.sharedQrLookup(shareToken);
        setLookupResult(response.data);
        return;
      }

      const query = trimmedValue.replace('LCMS:', '').trim();
      const response = await casesAPI.qrLookup(query);
      setLookupResult(response.data);
    } catch (err) {
      console.error('Error looking up QR case:', err);
      setLookupResult(null);
      addToast({ type: 'error', title: 'Case not found', message: err.message || 'Please scan or enter a valid case number.' });
    }
  }, [addToast]);

  useEffect(() => {
    const lookupValue = searchParams.get('lookup') || '';
    if (!lookupValue) return;

    setLookupQuery(lookupValue);
    runLookup(lookupValue);
  }, [runLookup, searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">QR Center</motion.h1>
          <p className="text-[#6b6b80]">Generate a QR that opens the full case PDF report, or scan one to read the complete case details as text and open the PDF when needed.</p>
        </div>
        <button onClick={() => setScannerOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all">
          <ScanLine className="w-5 h-5" />
          Scan QR Code
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Generate QR</h3>
          <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Case</label>
          <select value={selectedCaseId} onChange={(e) => setSelectedCaseId(e.target.value)} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
            {cases.map((caseItem) => (
              <option key={caseItem.databaseId} value={caseItem.databaseId}>
                {getCaseNumber(caseItem)} - {caseItem.title}
              </option>
            ))}
          </select>

          {selectedCase && (
            <div className="mt-6 flex flex-col items-center">
              <QRCodeViewer value={selectedCaseLinks?.pdfUrl || `LCMS:${getCaseNumber(selectedCase)}`} title={getCaseNumber(selectedCase)} />
              <div className="mt-4 w-full p-4 rounded-xl bg-[#f7f6f3]">
                <p className="text-sm font-semibold text-[#1a1a2e]">{selectedCase.title}</p>
                <p className="text-xs text-[#6b6b80] mt-1">Filed {formatDate(selectedCase.filingDate)}</p>
                {selectedCaseLinks?.pdfUrl && (
                  <a href={selectedCaseLinks.pdfUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                    Open PDF report
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Lookup by Case Number</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
              <input type="text" value={lookupQuery} onChange={(e) => setLookupQuery(e.target.value)} placeholder="Enter case number or scan a QR value..." className="w-full pl-11 pr-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" />
            </div>
            <button onClick={() => runLookup(lookupQuery)} className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg shadow-red-500/25">Find</button>
          </div>

          {lookupResult && (
            <div className="mt-6 p-5 rounded-2xl bg-[#f7f6f3] space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-mono text-red-600">{getCaseNumber(lookupResult)}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-[#1a1a2e]">{lookupResult.title}</h4>
                  <p className="text-sm text-[#6b6b80] mt-1">{lookupResult.petitioner} vs {lookupResult.respondent}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <StatusBadge status={lookupResult.status} size="sm" />
                    {lookupResult.priority && <StatusBadge status={lookupResult.priority} size="sm" />}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => navigate(`/court/cases/${getCaseRouteId(lookupResult)}`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold">
                    Open case
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={async () => {
                    try {
                      const pdfUrl = lookupResult.pdfUrl || (await casesAPI.reportLinks(getCaseRouteId(lookupResult))).data.pdfUrl;
                      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                    } catch (err) {
                      addToast({ type: 'error', title: 'Unable to open PDF', message: err.message || 'Please try again.' });
                    }
                  }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-[#e5e4df] text-[#1a1a2e] font-semibold">
                    <FileText className="w-4 h-4" />
                    Open PDF
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-white border-2 border-[#e5e4df]">
                  <p className="text-xs text-[#6b6b80] mb-1">Advocate</p>
                  <p className="font-medium text-[#1a1a2e]">{lookupResult.advocate?.name || 'Unassigned'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border-2 border-[#e5e4df]">
                  <p className="text-xs text-[#6b6b80] mb-1">Court Room</p>
                  <p className="font-medium text-[#1a1a2e]">{lookupResult.courtRoom || 'Not assigned'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border-2 border-[#e5e4df]">
                  <p className="text-xs text-[#6b6b80] mb-1">Judge</p>
                  <p className="font-medium text-[#1a1a2e]">{lookupResult.judge || 'Pending assignment'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border-2 border-[#e5e4df]">
                  <p className="text-xs text-[#6b6b80] mb-1">Next Hearing</p>
                  <p className="font-medium text-[#1a1a2e]">{formatDate(lookupResult.nextHearing)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6b6b80]">Complete Case Details</p>
                <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-white border-2 border-[#e5e4df] p-4 text-sm leading-6 text-[#1a1a2e]">
                  {lookupResult.reportText || 'Case details are not available for this QR code.'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <QRCodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(value) => {
          setLookupQuery(value);
          setScannerOpen(false);
          runLookup(value);
        }}
      />
    </div>
  );
}
