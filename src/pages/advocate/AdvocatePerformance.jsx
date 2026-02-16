import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Star, Target, BarChart3, Calendar, Briefcase, Trophy, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { casesAPI } from '../../services/api';

const monthlyData = [
  { month: 'Jul', won: 8, lost: 2, settled: 3 }, { month: 'Aug', won: 10, lost: 1, settled: 4 },
  { month: 'Sep', won: 7, lost: 3, settled: 2 }, { month: 'Oct', won: 12, lost: 2, settled: 5 },
  { month: 'Nov', won: 9, lost: 1, settled: 3 }, { month: 'Dec', won: 11, lost: 2, settled: 4 },
  { month: 'Jan', won: 14, lost: 1, settled: 6 }, { month: 'Feb', won: 8, lost: 0, settled: 3 },
];

const winRateData = [{ name: 'Win Rate', value: 78, fill: '#b4f461' }];

const specializations = [
  { type: 'Civil', cases: 45, wins: 38, rate: '84%', color: 'bg-blue-500' },
  { type: 'Criminal', cases: 28, wins: 22, rate: '79%', color: 'bg-red-500' },
  { type: 'Family', cases: 18, wins: 14, rate: '78%', color: 'bg-amber-500' },
  { type: 'Consumer', cases: 12, wins: 10, rate: '83%', color: 'bg-purple-500' },
  { type: 'MACT', cases: 8, wins: 7, rate: '88%', color: 'bg-emerald-500' },
];

const achievements = [
  { icon: Trophy, title: 'First 100 Cases', desc: 'Handled 100 cases successfully', unlocked: true },
  { icon: Star, title: '80% Win Rate', desc: 'Maintained 80%+ win rate for 3 months', unlocked: true },
  { icon: Zap, title: 'Quick Resolver', desc: 'Settled 10 cases under 30 days', unlocked: true },
  { icon: Award, title: 'Top Advocate', desc: 'Ranked in top 5 advocates this quarter', unlocked: false },
  { icon: Target, title: 'Perfect Month', desc: 'Win all cases in a single month', unlocked: false },
];

export function AdvocatePerformance() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesAPI.list();
        setCases(res.data.cases || res.data || []);
      } catch (err) {
        console.error('Error fetching cases:', err);
      }
    };
    fetchCases();
  }, []);

  const totalCases = cases.length;
  const stats = [
    { label: 'Total Cases', value: totalCases, icon: Briefcase, color: 'bg-blue-500', change: '+12 this month' },
    { label: 'Win Rate', value: '78%', icon: TrendingUp, color: 'bg-emerald-500', change: '+3% vs last month' },
    { label: 'Active Cases', value: cases.filter(c => c.status !== 'closed' && c.status !== 'dismissed').length, icon: Target, color: 'bg-amber-500', change: '5 hearings this week' },
    { label: 'Achievements', value: `${achievements.filter(a => a.unlocked).length}/${achievements.length}`, icon: Award, color: 'bg-purple-500', change: '2 more to unlock' },
  ];

  return (
    <div className="space-y-6">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Performance Dashboard</motion.h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-3 shadow-lg`}><stat.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-bold text-[#1a1a2e] dark:text-white">{stat.value}</p>
            <p className="text-sm text-[#6b6b80]">{stat.label}</p>
            <p className="text-xs text-[#b4f461] mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Case Outcomes Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e4df" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b80', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b6b80', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="won" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} name="Won" />
              <Area type="monotone" dataKey="settled" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} name="Settled" />
              <Area type="monotone" dataKey="lost" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="Lost" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm flex flex-col items-center justify-center">
          <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Win Rate</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={winRateData} startAngle={90} endAngle={-270}>
              <RadialBar background clockWise dataKey="value" cornerRadius={12} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-4xl font-bold text-[#1a1a2e] dark:text-white -mt-4">78%</p>
          <p className="text-sm text-[#6b6b80]">Overall win rate</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Performance by Case Type</h3>
          <div className="space-y-4">
            {specializations.map(spec => (
              <div key={spec.type}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${spec.color}`} /><span className="text-sm text-[#1a1a2e] dark:text-white font-medium">{spec.type}</span></div>
                  <div className="flex items-center gap-3 text-xs text-[#6b6b80]"><span>{spec.cases} cases</span><span className="font-medium text-emerald-500">{spec.rate}</span></div>
                </div>
                <div className="h-2 bg-[#f7f6f3] dark:bg-[#1a1a2e] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: spec.rate }} className={`h-full ${spec.color} rounded-full`} transition={{ delay: 0.3, duration: 0.8 }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-sm">
          <h3 className="font-semibold text-[#1a1a2e] dark:text-white mb-4">Achievements</h3>
          <div className="space-y-3">
            {achievements.map((ach, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${ach.unlocked ? 'bg-[#b4f461]/10 border border-[#b4f461]/20' : 'bg-[#f7f6f3] dark:bg-[#1a1a2e] opacity-50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ach.unlocked ? 'bg-[#b4f461] text-[#1a1a2e]' : 'bg-[#e5e4df] dark:bg-[#2d2d45] text-[#6b6b80]'}`}><ach.icon className="w-5 h-5" /></div>
                <div className="flex-1"><h4 className="text-sm font-semibold text-[#1a1a2e] dark:text-white">{ach.title}</h4><p className="text-xs text-[#6b6b80]">{ach.desc}</p></div>
                {ach.unlocked && <Star className="w-5 h-5 text-[#b4f461]" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
