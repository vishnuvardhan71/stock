// DukanBook - Reusable Input Component
import React from 'react';

export default function Input({ label, type = "text", required = false, ...props }) {
  const handleKeyDown = (e) => {
    if (type === 'number' && ['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type} 
        required={required}
        onKeyDown={handleKeyDown}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
        {...props} 
      />
    </div>
  );
}
