import clsx from 'clsx';

const statusConfig = {
  filed: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  under_review: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  hearing_scheduled: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  in_progress: { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
  judgment_reserved: { bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  closed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  dismissed: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  high: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  pdf: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  jpg: { bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  mp4: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
};

const labels = {
  filed: 'Filed', under_review: 'Under Review', hearing_scheduled: 'Hearing Scheduled',
  in_progress: 'In Progress', judgment_reserved: 'Judgment Reserved', closed: 'Closed',
  dismissed: 'Dismissed', high: 'High', medium: 'Medium', low: 'Low', pdf: 'PDF', jpg: 'Image', mp4: 'Video',
};

export function StatusBadge({ status, size = 'md', showDot = true, className }) {
  const config = statusConfig[status] || statusConfig.filed;
  const label = labels[status] || status;
  
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full font-medium', config.bg, config.text, sizes[size], className)}>
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />}
      {label}
    </span>
  );
}
