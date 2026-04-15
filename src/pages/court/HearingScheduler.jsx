import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock3, Edit, Gavel, MapPin, Plus, Timer, Trash2, X } from 'lucide-react';
import { DATA_SYNC_EVENT, casesAPI, courtroomsAPI, hearingsAPI } from '../../services/api';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useToast } from '../../components/shared/Toast';
import { formatDate, formatTime, getCaseNumber } from '../../utils/legalData';

const defaultForm = {
  caseId: '',
  type: 'First Hearing',
  location: '',
  date: '',
  startTime: '',
  notes: '',
};

export function HearingScheduler() {
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [courtrooms, setCourtrooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [editingHearing, setEditingHearing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const fetchData = async () => {
    try {
      const [casesRes, hearingsRes, roomsRes] = await Promise.all([casesAPI.list(), hearingsAPI.list(), courtroomsAPI.list()]);
      const caseRows = casesRes.data || [];
      const hearingRows = hearingsRes.data || [];
      const roomRows = roomsRes.data || [];
      setCases(caseRows);
      setHearings(hearingRows);
      setCourtrooms(roomRows);
      setAvailableRooms(roomRows.filter((room) => room.status !== 'closed'));
      setForm((prev) => (prev.caseId || !caseRows[0]?.databaseId ? prev : { ...prev, caseId: String(caseRows[0].databaseId) }));
    } catch (err) {
      console.error('Error fetching hearings:', err);
      addToast({ type: 'error', title: 'Unable to load hearings', message: err.message || 'Please try again.' });
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener(DATA_SYNC_EVENT, fetchData);
    return () => window.removeEventListener(DATA_SYNC_EVENT, fetchData);
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!showModal) return;

      if (!form.date) {
        setAvailableRooms(courtrooms.filter((room) => room.status !== 'closed'));
        return;
      }

      try {
        setAvailabilityLoading(true);
        const response = await courtroomsAPI.availability({
          date: form.date,
          startTime: form.startTime,
          excludeHearingId: editingHearing?.id,
        });
        const rooms = response.data || [];
        const allowedRooms = rooms.filter((room) => room.isAvailable || room.name === form.location);
        setAvailableRooms(allowedRooms);

        if (!editingHearing && !allowedRooms.some((room) => room.name === form.location)) {
          const firstAvailable = allowedRooms.find((room) => room.isAvailable);
          if (firstAvailable) {
            setForm((prev) => ({ ...prev, location: firstAvailable.name }));
          }
        }
      } catch (err) {
        console.error('Error checking courtroom availability:', err);
        addToast({ type: 'error', title: 'Unable to check room availability', message: err.message || 'Please try again.' });
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [courtrooms, editingHearing?.id, form.date, form.startTime, form.location, showModal]);

  const filteredHearings = useMemo(() => {
    if (filter === 'scheduled') return hearings.filter((item) => item.status === 'scheduled');
    if (filter === 'completed') return hearings.filter((item) => item.status === 'completed');
    return hearings;
  }, [filter, hearings]);

  const stats = [
    { label: "Today's Hearings", value: hearings.filter((item) => new Date(item.date).toDateString() === new Date().toDateString()).length, icon: Gavel, color: 'bg-red-500' },
    { label: 'Total Scheduled', value: hearings.filter((item) => item.status === 'scheduled').length, icon: Calendar, color: 'bg-red-500' },
    { label: 'Pending', value: hearings.filter((item) => item.status === 'scheduled').length, icon: Timer, color: 'bg-amber-500' },
    { label: 'Completed', value: hearings.filter((item) => item.status === 'completed').length, icon: CheckCircle, color: 'bg-emerald-500' },
  ];

  const openCreateModal = () => {
    setEditingHearing(null);
    setForm({
      ...defaultForm,
      caseId: form.caseId || String(cases[0]?.databaseId || ''),
      location: courtrooms.find((room) => room.status !== 'closed')?.name || '',
    });
    setShowModal(true);
  };

  const openEditModal = (hearing) => {
    setEditingHearing(hearing);
    setForm({
      caseId: String(hearing.caseId),
      type: hearing.type,
      location: hearing.location || '',
      date: hearing.date || '',
      startTime: hearing.startTime ? hearing.startTime.slice(11, 16) : '',
      notes: hearing.notes || '',
    });
    setShowModal(true);
  };

  const saveHearing = async () => {
    if (!form.caseId || !form.type.trim() || !form.date || !form.startTime || !form.location) {
      addToast({ type: 'warning', title: 'Missing details', message: 'Case, hearing type, date, start time, and court room are required.' });
      return;
    }

    const payload = {
      caseId: Number(form.caseId),
      type: form.type.trim(),
      location: form.location,
      date: form.date,
      notes: form.notes.trim(),
      startTime: form.startTime,
    };

    try {
      if (editingHearing?.id) {
        await hearingsAPI.update(editingHearing.id, payload);
        addToast({ type: 'success', title: 'Hearing updated', message: 'The hearing has been updated successfully.' });
      } else {
        await hearingsAPI.create(payload);
        addToast({ type: 'success', title: 'Hearing scheduled', message: 'The hearing has been scheduled successfully.' });
      }

      setShowModal(false);
      setEditingHearing(null);
      setForm(defaultForm);
    } catch (err) {
      console.error('Error saving hearing:', err);
      addToast({ type: 'error', title: 'Unable to save hearing', message: err.message || 'Please try again.' });
    }
  };

  const deleteHearing = async (hearing) => {
    try {
      await hearingsAPI.remove(hearing.id);
      addToast({ type: 'success', title: 'Hearing removed', message: 'The hearing has been removed from the schedule.' });
    } catch (err) {
      console.error('Error deleting hearing:', err);
      addToast({ type: 'error', title: 'Unable to delete hearing', message: err.message || 'Please try again.' });
    }
  };

  const linkedCase = (caseId) => cases.find((item) => item.databaseId === caseId || item.databaseId === Number(caseId));
  const availableRoomCount = availableRooms.filter((room) => room.isAvailable !== false).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Hearing Scheduler</motion.h1>
          <p className="text-[#6b6b80]">Schedule, validate, and track court hearings with available room selection.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreateModal} className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all">
          <Plus className="w-5 h-5" />
          Schedule Hearing
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{stat.value}</p>
            <p className="text-sm text-[#6b6b80]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        {['all', 'scheduled', 'completed'].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === item ? 'bg-red-500/20 text-red-700 border-2 border-red-500/30' : 'bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80]'}`}>
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredHearings.map((hearing, index) => {
          const caseItem = linkedCase(hearing.caseId);
          return (
            <motion.div key={hearing.id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] hover:border-red-500/30 transition-all shadow-sm group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${hearing.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                  {hearing.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Timer className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[#1a1a2e] dark:text-white font-semibold">{hearing.type}</h4>
                    <StatusBadge status={hearing.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6b6b80] flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(hearing.date)}</span>
                    <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{hearing.startTime ? formatTime(hearing.startTime) : 'Time pending'}</span>
                    <span>{caseItem ? getCaseNumber(caseItem) : `Case ${hearing.caseId}`}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{hearing.location || 'Court room pending'}</span>
                  </div>
                  {hearing.notes && <p className="text-sm text-[#6b6b80] mt-2">{hearing.notes}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(hearing)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-500"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteHearing(hearing)} className="p-2 rounded-lg hover:bg-red-500/20 text-[#6b6b80] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-[#1a1a2e] rounded-3xl border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white">{editingHearing ? 'Edit Hearing' : 'Schedule Hearing'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#232338] text-[#6b6b80]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Case</label>
                <select value={form.caseId} onChange={(e) => setForm((prev) => ({ ...prev, caseId: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                  <option value="">Select case...</option>
                  {cases.map((caseItem) => (
                    <option key={caseItem.databaseId} value={caseItem.databaseId}>
                      {getCaseNumber(caseItem)} - {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Hearing Type</label>
                  <input value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Available Court Room</label>
                  <select value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                    <option value="">Select available room...</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.name}>
                        {room.name} {room.isAvailable === false ? `(Unavailable: ${room.availabilityReason || 'Booked'})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#6b6b80] mt-2">
                    {availabilityLoading ? 'Checking room availability...' : `${availableRoomCount} room(s) available for the selected slot.`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] text-[#6b6b80] font-medium border-2 border-[#e5e4df] dark:border-[#2d2d45]">Cancel</button>
              <button onClick={saveHearing} className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/25">{editingHearing ? 'Update' : 'Schedule'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
