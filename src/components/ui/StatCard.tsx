import React from 'react';
import {
  IndianRupee,
  DollarSign,
  Repeat,
  TrendingUp,
  Percent,
  Users,
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  period?: string;
  iconName?: string;
}

const iconMap: Record<string, React.ElementType> = {
  IndianRupee,
  DollarSign: IndianRupee, // Standardize currency cards to Indian Rupee icon
  Repeat,
  TrendingUp,
  Percent,
  Users,
  ShoppingCart,
  CreditCard,
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  change,
  trend = 'up',
  period = 'vs last month',
  iconName = 'TrendingUp'
}) => {
  const Icon = (iconName && iconMap[iconName]) || TrendingUp;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <div className="p-2.5 rounded-lg bg-indigo-50/80 text-indigo-600">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subValue && (
          <span className="text-xs text-slate-400 font-normal">{subValue}</span>
        )}
      </div>

      {(change || period) && (
        <div className="mt-3.5 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center font-semibold px-2 py-0.5 rounded-md ${
                trend === 'up'
                  ? 'bg-emerald-50 text-emerald-700'
                  : trend === 'down'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : trend === 'down' ? (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <Minus className="w-3.5 h-3.5 mr-0.5" />
              )}
              {change}
            </span>
          )}
          {period && <span className="text-slate-400">{period}</span>}
        </div>
      )}
    </div>
  );
};
