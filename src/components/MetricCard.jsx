// DukanBook - Reusable MetricCard Component
import React from 'react';

export default function MetricCard({ title, value, icon: Icon, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-100 rounded-xl p-5 border border-gray-200 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:bg-slate-50 transition-all' : ''}`}
    >
      <div className={`p-3 rounded-lg bg-white shadow-sm ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
