import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, GripVertical, X, CheckSquare, AlertTriangle, Timer } from 'lucide-react';
import { casesAPI, tasksAPI } from '../../services/api';

const initialTasks = {
  todo: [
    { id: 't1', title: 'Review petition for Case CIV-2024-1842', priority: 'high', case: 'CIV-2024-1842', due: '2024-02-15' },
    { id: 't2', title: 'Prepare witness list', priority: 'medium', case: 'CRM-2024-0567', due: '2024-02-18' },
    { id: 't3', title: 'Draft counter arguments', priority: 'high', case: 'FAM-2024-0234', due: '2024-02-16' },
  ],
  inProgress: [
    { id: 't4', title: 'Analyze evidence documents', priority: 'medium', case: 'CIV-2024-1842', due: '2024-02-20' },
    { id: 't5', title: 'Research case precedents', priority: 'low', case: 'CNS-2024-0891', due: '2024-02-22' },
  ],
  done: [
    { id: 't6', title: 'File evidence submission', priority: 'medium', case: 'MACT-2024-0156', due: '2024-02-10' },
    { id: 't7', title: 'Attend preliminary hearing', priority: 'high', case: 'CRM-2024-0567', due: '2024-02-08' },
  ]
};

const columns = [
  { id: 'todo', label: 'To Do', icon: CheckSquare, color: 'border-amber-500', headerBg: 'bg-amber-500/10 text-amber-700' },
  { id: 'inProgress', label: 'In Progress', icon: Timer, color: 'border-blue-500', headerBg: 'bg-blue-500/10 text-blue-700' },
  { id: 'done', label: 'Done', icon: CheckSquare, color: 'border-emerald-500', headerBg: 'bg-emerald-500/10 text-emerald-700' },
];

const priorityColors = { high: 'bg-red-500/10 text-red-500 border border-red-500/20', medium: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', low: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' };

export function TaskBoardPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showAdd, setShowAdd] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [cases, setCases] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', case: '', due: '' });

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesAPI.list();
        const casesData = res.data.cases || res.data || [];
        setCases(casesData);
        if (casesData.length > 0) {
          setNewTask(prev => ({ ...prev, case: casesData[0].case_number || casesData[0].caseNumber || '' }));
        }
        // Also try to load tasks from API
        try {
          const tasksRes = await tasksAPI.list();
          const apiTasks = tasksRes.data.tasks || tasksRes.data || [];
          if (apiTasks.length > 0) {
            setTasks({
              todo: apiTasks.filter(t => t.status === 'pending' || t.status === 'todo'),
              inProgress: apiTasks.filter(t => t.status === 'in_progress'),
              done: apiTasks.filter(t => t.status === 'completed' || t.status === 'done'),
            });
          }
        } catch { /* use initial tasks */ }
      } catch (err) {
        console.error('Error fetching cases:', err);
      }
    };
    fetchCases();
  }, []);

  const handleDragStart = (taskId, fromCol) => setDragItem({ taskId, fromCol });
  const handleDrop = (toCol) => {
    if (!dragItem || dragItem.fromCol === toCol) { setDragItem(null); setDragOverCol(null); return; }
    const task = tasks[dragItem.fromCol].find(t => t.id === dragItem.taskId);
    if (!task) return;
    setTasks(prev => ({ ...prev, [dragItem.fromCol]: prev[dragItem.fromCol].filter(t => t.id !== dragItem.taskId), [toCol]: [...prev[toCol], task] }));
    setDragItem(null); setDragOverCol(null);
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(prev => ({ ...prev, todo: [...prev.todo, { ...newTask, id: `t${Date.now()}` }] }));
    setNewTask({ title: '', priority: 'medium', case: cases[0]?.caseNumber || '', due: '' }); setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Task Board</motion.h1>
          <p className="text-[#6b6b80]">Manage your tasks with drag & drop</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all">
          <Plus className="w-5 h-5" />Add Task</motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.id} onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }} onDragLeave={() => setDragOverCol(null)} onDrop={() => handleDrop(col.id)}
            className={`rounded-2xl p-4 transition-all min-h-[400px] ${dragOverCol === col.id ? 'bg-[#b4f461]/5 border-2 border-dashed border-[#b4f461]' : 'bg-white/40 dark:bg-[#232338]/40 border-2 border-[#e5e4df] dark:border-[#2d2d45]'}`}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 ${col.headerBg}`}>
              <col.icon className="w-4 h-4" /><span className="font-semibold text-sm">{col.label}</span>
              <span className="ml-auto text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full">{tasks[col.id].length}</span>
            </div>
            <div className="space-y-3">
              {tasks[col.id].map((task) => (
                <motion.div key={task.id} layout draggable onDragStart={() => handleDragStart(task.id, col.id)}
                  className="p-4 rounded-xl bg-white/80 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] cursor-grab active:cursor-grabbing hover:border-orange-500/30 transition-all shadow-sm group">
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-[#6b6b80] mt-0.5 opacity-0 group-hover:opacity-100" />
                    <div className="flex-1">
                      <p className="text-sm text-[#1a1a2e] dark:text-white font-medium mb-2">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
                        <span className="text-xs text-[#6b6b80] bg-[#f7f6f3] dark:bg-[#1a1a2e] px-2 py-0.5 rounded-full">{task.case}</span>
                      </div>
                      {task.due && <p className="text-xs text-[#6b6b80] mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" />{task.due}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#1a1a2e] rounded-3xl border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white">Add Task</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#232338] text-[#6b6b80]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Task Title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask(p => ({...p, title: e.target.value}))}
                  className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" placeholder="Enter task..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask(p => ({...p, priority: e.target.value}))}
                    className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                    <option value="high" className="bg-white dark:bg-[#1a1a2e]">High</option><option value="medium" className="bg-white dark:bg-[#1a1a2e]">Medium</option><option value="low" className="bg-white dark:bg-[#1a1a2e]">Low</option></select></div>
                <div><label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Due Date</label>
                  <input type="date" value={newTask.due} onChange={(e) => setNewTask(p => ({...p, due: e.target.value}))}
                    className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl bg-[#f7f6f3] dark:bg-[#232338] text-[#6b6b80] font-medium border-2 border-[#e5e4df] dark:border-[#2d2d45]">Cancel</button>
              <button onClick={addTask} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25">Add Task</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
