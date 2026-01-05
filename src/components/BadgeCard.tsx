import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { useState } from 'react';

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

export function BadgeCard({ name, description, icon, unlocked, progress = 0 }: BadgeCardProps) {
  const [isGlowing, setIsGlowing] = useState(false);

  const handleClick = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 300);
  };

  const getBadgeColor = (icon: string) => {
    switch (icon.toLowerCase()) {
      case 'flame':
        return { color: '#fb923c', name: 'orange' };
      case 'crown':
        return { color: '#fbbf24', name: 'yellow' };
      case 'award':
        return { color: '#a855f7', name: 'purple' };
      case 'zap':
        return { color: '#60a5fa', name: 'blue' };
      case 'star':
        return { color: '#fbbf24', name: 'amber' };
      default:
        return { color: '#94a3b8', name: 'slate' };
    }
  };

  const badgeColor = getBadgeColor(icon);

  return (
    <motion.div
      onClick={handleClick}
      whileHover={unlocked ? { scale: 1.05 } : {}}
      className={`relative rounded-xl p-4 backdrop-blur-xl border transition-all cursor-pointer ${
        unlocked
          ? `bg-gradient-to-br ${badgeColor.name}-500/10 border-${badgeColor.name}-500/30`
          : 'bg-white/5 border-white/10 opacity-50'
      }`}
      style={{
        boxShadow: isGlowing && unlocked
          ? `0 0 30px ${badgeColor.color}80, 0 0 60px ${badgeColor.color}40`
          : undefined,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className={`text-3xl ${
            unlocked ? 'block' : 'grayscale opacity-40'
          }`}
        >
          {icon === 'Flame' && '🔥'}
          {icon === 'Crown' && '👑'}
          {icon === 'Award' && '🏆'}
          {icon === 'Zap' && '⚡'}
          {icon === 'Star' && '⭐'}
          {icon === 'TrendingUp' && '📈'}
          {!['Flame', 'Crown', 'Award', 'Zap', 'Star', 'TrendingUp'].includes(icon) && <Award className="w-8 h-8" />}
        </div>
        <div>
          <p className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-slate-400'}`}>
            {name}
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
        </div>
        {!unlocked && progress > 0 && (
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {unlocked && (
          <p className="text-xs text-emerald-400 font-semibold mt-2">Unlocked</p>
        )}
      </div>
    </motion.div>
  );
}
