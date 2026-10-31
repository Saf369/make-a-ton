import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['active', 'paid', 'completed', 'fulfilled', 'settled', 'available', 'approved'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['past due', 'overdue', 'failed', 'declined', 'at risk'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (['pending', 'processing', 'in progress', 'draft', 'maintenance'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (['paused', 'inactive'].includes(normalized)) {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (['sent', 'tier 3 (admin)', 'tier 3 (full financial)', 'super admin'].includes(normalized)) {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colorClasses} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};
