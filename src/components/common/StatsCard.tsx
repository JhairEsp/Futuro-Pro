import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'rose';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    purple: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    orange: 'bg-orange-500/10 text-orange-600 border-orange-200',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {trend && (
            <p className="text-xs mt-1 font-medium text-emerald-600">
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]} border`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
