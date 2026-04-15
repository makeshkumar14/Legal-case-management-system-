import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Users } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

export function AdvocateDirectoryPage() {
  const [advocates, setAdvocates] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        const res = await analyticsAPI.allAdvocates();
        setAdvocates(res.data || []);
      } catch (err) {
        console.error('Error fetching advocates:', err);
      }
    };

    fetchAdvocates();
  }, []);

  const filteredAdvocates = useMemo(
    () =>
      advocates.filter((advocate) =>
        [advocate.name, advocate.email]
          .some((value) => String(value || '').toLowerCase().includes(query.toLowerCase()))
      ),
    [advocates, query]
  );

  return (
    <div className="space-y-6">
      <div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Advocate Directory</motion.h1>
        <p className="text-[#6b6b80]">Review available advocates, active caseloads, and current performance snapshots.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search advocates..." className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-red-500/30" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAdvocates.map((advocate, index) => (
          <motion.div key={advocate.id || index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm hover:border-red-500/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold shadow-lg">
                {(advocate.name || 'A').charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1a1a2e] dark:text-white">{advocate.name}</h3>
                <p className="text-sm text-[#6b6b80]">{advocate.email || 'Email not provided'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="p-3 rounded-xl bg-[#f7f6f3]">
                <p className="text-xs text-[#6b6b80] mb-1">Active Cases</p>
                <p className="text-lg font-semibold text-[#1a1a2e]">{advocate.active_cases || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#f7f6f3]">
                <p className="text-xs text-[#6b6b80] mb-1">Rating</p>
                <p className="text-lg font-semibold text-[#1a1a2e] flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  {advocate.rating || 4.5}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAdvocates.length === 0 && (
        <div className="text-center py-16"><Users className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">No advocates found</h3><p className="text-[#6b6b80]">Try a different name or email search.</p></div>
      )}
    </div>
  );
}
