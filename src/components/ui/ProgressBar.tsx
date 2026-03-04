interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showScore?: boolean;
  score?: number;
}

export function ProgressBar({
  current,
  total,
  label,
  showScore = false,
  score,
}: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-widest text-muted">
          {label ?? `${current} / ${total} answered`}
        </span>
        {showScore && (
          <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-widest text-muted">
            Score: {score ?? 0}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-text-primary rounded-full transition-all duration-400 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
