import { useEffect, useState } from 'react';

interface AnimatedProgressBarProps {
  current: number;
  max: number;
  height?: string;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export function AnimatedProgressBar({
  current,
  max,
  height = 'h-3',
  color = 'from-blue-400 to-emerald-400',
  label,
  showPercentage = true,
}: AnimatedProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = (current / max) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-full">
      {label && <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>}
      <div className={`w-full ${height} bg-white/5 border border-white/10 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500 ease-out shadow-lg`}
          style={{ width: `${displayValue}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-slate-400 mt-1">
          {current} / {max} ({Math.round(percentage)}%)
        </p>
      )}
    </div>
  );
}
