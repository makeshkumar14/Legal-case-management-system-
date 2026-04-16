import { motion } from 'framer-motion';
import clsx from 'clsx';

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  hover = true,
  glow = false,
  glowColor = 'indigo',
  onClick,
  ...props 
}) {
  const glowColors = {
    indigo: 'hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]',
    emerald: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
    gold: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={clsx(
        'rounded-2xl p-6 transition-all duration-300',
        'bg-slate-900/50 backdrop-blur-xl',
        'border border-white/5',
        'shadow-xl shadow-black/10',
        hover && onClick && 'cursor-pointer',
        glow && glowColors[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
