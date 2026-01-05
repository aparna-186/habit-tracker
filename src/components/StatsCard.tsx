import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  subtitle?: string;
}

export function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  const [isGlowing, setIsGlowing] = useState(false);

  const handleClick = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 300);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -2 }}
      className={`backdrop-blur-xl border rounded-xl p-6 bg-gradient-to-br ${color}/10 border-${color}/30 cursor-pointer`}
      style={{
        boxShadow: isGlowing 
          ? `0 0 30px ${color}80, 0 0 60px ${color}40` 
          : undefined,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}/10`}>{icon}</div>
      </div>
    </motion.div>
  );
}
