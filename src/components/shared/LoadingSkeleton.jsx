import clsx from 'clsx';

export function LoadingSkeleton({ className, variant = 'text', count = 1 }) {
  const baseClasses = 'animate-pulse bg-dark-surface-elevated/50 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg',
    thumbnail: 'h-24 w-24 rounded-lg',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(baseClasses, variants[variant], className)}
          style={{ 
            animationDelay: `${i * 100}ms`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s linear infinite, pulse 2s ease-in-out infinite',
          }}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-dark-surface/80 backdrop-blur-xl border border-dark-border/50 p-6 space-y-4">
      <div className="flex items-center gap-4">
        <LoadingSkeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="title" />
          <LoadingSkeleton className="w-1/2" />
        </div>
      </div>
      <LoadingSkeleton count={3} />
      <div className="flex gap-2">
        <LoadingSkeleton variant="button" />
        <LoadingSkeleton variant="button" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <LoadingSkeleton
              key={colIndex}
              className={clsx(
                colIndex === 0 ? 'w-32' : 'flex-1',
                'h-8'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
