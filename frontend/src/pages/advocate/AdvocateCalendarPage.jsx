import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, FileText, MapPin } from 'lucide-react';
import { hearingsAPI, casesAPI } from '../../services/api';
import { formatDate, getCaseNumber } from '../../utils/legalData';

export function AdvocateCalendarPage() {
  const [events, setEvents] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [calendarRes, hearingsRes, casesRes] = await Promise.all([
          hearingsAPI.calendar(),
          hearingsAPI.list(),
          casesAPI.list(),
        ]);
        setEvents(calendarRes.data || []);
        setHearings(hearingsRes.data || []);
        setCases(casesRes.data || []);
      } catch (err) {
        console.error('Error fetching advocate calendar data:', err);
      }
    };

    fetchData();
  }, []);

  const upcomingHearings = useMemo(
    () =>
      hearings
        .filter((hearing) => hearing.status === 'scheduled')
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [hearings]
  );

  const findCase = (caseId) => cases.find((item) => item.databaseId === caseId || item.databaseId === Number(caseId));

  return (
    <div className="space-y-6">
      <div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Calendar</motion.h1>
        <p className="text-[#6b6b80]">Review upcoming hearings and keep your weekly schedule aligned.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height={560}
            headerToolbar={{ left: 'prev,next', center: 'title', right: 'today' }}
          />
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Upcoming Hearings</h3>
            <div className="space-y-3">
              {upcomingHearings.slice(0, 5).map((hearing) => {
                const linkedCase = findCase(hearing.caseId);
                return (
                  <div key={hearing.id} className="p-4 rounded-xl bg-[#f7f6f3] dark:bg-[#1a1a2e]">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold text-[#1a1a2e] dark:text-white">{formatDate(hearing.date)}</span>
                    </div>
                    <p className="text-sm text-[#1a1a2e] dark:text-white font-medium">{linkedCase?.title || hearing.type}</p>
                    <div className="text-xs text-[#6b6b80] mt-2 space-y-1">
                      <p className="flex items-center gap-1"><FileText className="w-3 h-3" />{linkedCase ? getCaseNumber(linkedCase) : `Case ${hearing.caseId}`}</p>
                      <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{hearing.location || linkedCase?.courtRoom || 'Court room pending'}</p>
                      <p className="flex items-center gap-1"><Clock className="w-3 h-3" />{hearing.type}</p>
                    </div>
                  </div>
                );
              })}
              {upcomingHearings.length === 0 && <p className="text-sm text-[#6b6b80]">No upcoming hearings scheduled.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
