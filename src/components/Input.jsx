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
      <label className="block text-sm font-medium text-[#0F172A] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type} 
        required={required}
        onKeyDown={type === 'number' ? handleKeyDown : undefined}
        className="input-modern"
        {...props} 
      />
    </div>
  );
}
