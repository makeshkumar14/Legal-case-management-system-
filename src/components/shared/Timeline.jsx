import { motion } from 'framer-motion';
import clsx from 'clsx';

export function Timeline({ items }) {
  return (
    <div className="relative space-y-4 pl-6">
      {/* Line */}
      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent rounded-full" />
      
      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
          className="relative"
        >
          {/* Dot */}
          <div className={clsx(
            'absolute w-2.5 h-2.5 rounded-full border-2 border-slate-900',
            '-left-[25px] top-2',
            item.completed ? 'bg-emerald-400' : 'bg-indigo-400'
          )} />
          
          {/* Content */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h4 className="font-medium text-white text-sm">{item.event || item.title}</h4>
              <span className="text-xs text-slate-500 whitespace-nowrap">{item.date}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{item.description || item.notes}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
