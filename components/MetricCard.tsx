import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, description }) => {
  return (
    <div className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700 col-span-1 hover:bg-slate-700/80 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 pt-2">{description}</p>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg">
            {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
