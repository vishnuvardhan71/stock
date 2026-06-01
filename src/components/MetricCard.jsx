// DukanBook - Reusable MetricCard Component
import React from 'react';

export default function MetricCard({ title, value, icon: Icon, accentColor, iconBg, borderColor, cardStyle, onClick }) {
  return (
    <div
      onClick={onClick}
      style={cardStyle}
      className={`dashboard-card border-l-4 ${borderColor || 'border-transparent'} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`p-3 rounded-2xl ${iconBg || 'bg-slate-100'}`}>
        <Icon className={`h-6 w-6 ${accentColor || 'text-slate-900'}`} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
