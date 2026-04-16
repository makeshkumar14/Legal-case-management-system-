import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, GripVertical, Plus, Timer, Trash2, X } from 'lucide-react';
import { casesAPI, tasksAPI } from '../../services/api';
import { formatDate, getCaseNumber, getDatabaseId } from '../../utils/legalData';
import { useAuth } from '../../context/AuthContext';

const columns = [
  { id: 'todo', label: 'To Do', icon: CheckSquare, headerBg: 'bg-amber-500/10 text-amber-700' },
  { id: 'inProgress', label: 'In Progress', icon: Timer, headerBg: 'bg-blue-500/10 text-blue-700' },
  { id: 'done', label: 'Done', icon: CheckSquare, headerBg: 'bg-emerald-500/10 text-emerald-700' },
];

const priorityColors = {
  high: 'bg-red-500/10 text-red-500 border border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
};

function getStageStorageKey(userId) {
  return `legalcms:task-stage:${userId || 'anonymous'}`;
}

export function TaskBoardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [cases, setCases] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [stageMap, setStageMap] = useState({});
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', caseId: '', dueDate: '' });

  useEffect(() => {
    try {
      setStageMap(JSON.parse(localStorage.getItem(getStageStorageKey(user?.id)) || '{}'));
    } catch {
      setStageMap({});
    }
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(getStageStorageKey(user?.id), JSON.stringify(stageMap));
  }, [stageMap, user?.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, casesRes] = await Promise.all([
          tasksAPI.list(),
          casesAPI.list(),
        ]);
        const taskRows = tasksRes.data || [];
        const caseRows = casesRes.data || [];
        setTasks(taskRows);
        setCases(caseRows);
        if (!newTask.caseId && caseRows[0]?.databaseId) {
          setNewTask((prev) => ({ ...prev, caseId: String(caseRows[0].databaseId) }));
        }
      } catch (err) {
        console.error('Error fetching task board data:', err);
      }
    };

    fetchData();
  }, []);

  const tasksByColumn = useMemo(() => {
    const grouped = { todo: [], inProgress: [], done: [] };
    tasks.forEach((task) => {
      const databaseId = getDatabaseId(task);
      if (task.completed) {
        grouped.done.push(task);
      } else if (databaseId && stageMap[databaseId] === 'inProgress') {
        grouped.inProgress.push(task);
      } else {
        grouped.todo.push(task);
      }
    });
    return grouped;
  }, [stageMap, tasks]);

  const handleDragStart = (taskId, fromCol) => setDragItem({ taskId, fromCol });

  const handleDrop = async (toCol) => {
    if (!dragItem || dragItem.fromCol === toCol) {
      setDragItem(null);
      setDragOverCol(null);
      return;
    }

    const task = tasksByColumn[dragItem.fromCol].find((item) => getDatabaseId(item) === dragItem.taskId);
    if (!task) return;

    try {
      if (toCol === 'done') {
        await tasksAPI.update(dragItem.taskId, { completed: true });
        setStageMap((prev) => {
          const next = { ...prev };
          delete next[dragItem.taskId];
          return next;
        });
        setTasks((prev) => prev.map((item) => (getDatabaseId(item) === dragItem.taskId ? { ...item, completed: true } : item)));
      } else {
        await tasksAPI.update(dragItem.taskId, { completed: false });
        setStageMap((prev) => ({ ...prev, [dragItem.taskId]: toCol }));
        setTasks((prev) => prev.map((item) => (getDatabaseId(item) === dragItem.taskId ? { ...item, completed: false } : item)));
      }
    } catch (err) {
      console.error('Error updating task stage:', err);
    } finally {
      setDragItem(null);
      setDragOverCol(null);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim() || !newTask.caseId) return;
    try {
      const response = await tasksAPI.create({
        title: newTask.title.trim(),
        priority: newTask.priority,
        caseId: Number(newTask.caseId),
        dueDate: newTask.dueDate || null,
      });
      const createdTask = response.data?.task || response.data;
      setTasks((prev) => [...prev, createdTask]);
      setNewTask({ title: '', priority: 'medium', caseId: newTask.caseId, dueDate: '' });
      setShowAdd(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const removeTask = async (task) => {
    const databaseId = getDatabaseId(task);
    if (!databaseId) return;
    try {
      await tasksAPI.remove(databaseId);
      setTasks((prev) => prev.filter((item) => getDatabaseId(item) !== databaseId));
      setStageMap((prev) => {
        const next = { ...prev };
        delete next[databaseId];
        return next;
      });
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const getCaseLabel = (task) => {
    const match = cases.find((item) => item.databaseId === task.caseId || item.databaseId === Number(task.caseId));
    return match ? getCaseNumber(match) : `Case ${task.caseId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-1">Task Board</motion.h1>
          <p className="text-[#6b6b80]">Track your preparation work and move tasks as you progress.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all">
          <Plus className="w-5 h-5" />
          Add Task
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(column.id);
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(column.id)}
            className={`rounded-2xl p-4 transition-all min-h-[420px] ${dragOverCol === column.id ? 'bg-orange-500/5 border-2 border-dashed border-orange-500' : 'bg-white/50 dark:bg-[#232338]/40 border-2 border-[#e5e4df] dark:border-[#2d2d45]'}`}
          >
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 ${column.headerBg}`}>
              <column.icon className="w-4 h-4" />
              <span className="font-semibold text-sm">{column.label}</span>
              <span className="ml-auto text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full">{tasksByColumn[column.id].length}</span>
            </div>

            <div className="space-y-3">
              {tasksByColumn[column.id].map((task) => (
                <motion.div
                  key={getDatabaseId(task) || task.id}
                  layout
                  draggable
                  onDragStart={() => handleDragStart(getDatabaseId(task), column.id)}
                  className="p-4 rounded-xl bg-white/90 dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] cursor-grab active:cursor-grabbing hover:border-orange-500/30 transition-all shadow-sm group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-[#6b6b80] mt-0.5 opacity-0 group-hover:opacity-100" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-[#1a1a2e] dark:text-white font-medium mb-2">{task.title}</p>
                        <button onClick={() => removeTask(task)} className="p-1 rounded-lg hover:bg-red-500/10 text-[#6b6b80] hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
                        <span className="text-xs text-[#6b6b80] bg-[#f7f6f3] dark:bg-[#1a1a2e] px-2 py-0.5 rounded-full">{getCaseLabel(task)}</span>
                      </div>
                      {task.dueDate && (
                        <p className="text-xs text-[#6b6b80] mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </p>
                      )}
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
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white dark:bg-[#1a1a2e] rounded-3xl border-2 border-[#e5e4df] dark:border-[#2d2d45] shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] dark:text-white">Add Task</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#232338] text-[#6b6b80]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Task Title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" placeholder="Enter task..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Linked Case</label>
                <select value={newTask.caseId} onChange={(e) => setNewTask((prev) => ({ ...prev, caseId: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                  {cases.map((caseItem) => (
                    <option key={caseItem.databaseId} value={caseItem.databaseId}>
                      {getCaseNumber(caseItem)} - {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] dark:text-white mb-2">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))} className="w-full px-4 py-3 bg-[#f7f6f3] dark:bg-[#232338] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-[#1a1a2e] dark:text-white focus:outline-none" />
                </div>
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
