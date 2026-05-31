// Header category filter dropdown
import React, { useState, useRef, useEffect } from 'react';
import { Tags, ChevronDown, Check } from 'lucide-react';

export default function CategoryNavMenu({ categories, selectedCategory, onSelectCategory }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category) => {
    onSelectCategory(category);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          selectedCategory
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Tags className="h-5 w-5" />
        <span className="hidden sm:inline">Category</span>
        {selectedCategory && (
          <span className="hidden md:inline text-xs font-normal opacity-80 max-w-[8rem] truncate">
            ({selectedCategory})
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-30"
        >
          <button
            type="button"
            role="option"
            aria-selected={!selectedCategory}
            onClick={() => handleSelect('')}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 ${
              !selectedCategory ? 'text-indigo-700 bg-indigo-50/50 font-medium' : 'text-gray-700'
            }`}
          >
            All Categories
            {!selectedCategory && <Check className="h-4 w-4 shrink-0" />}
          </button>
          {categories.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">No categories yet</p>
          ) : (
            categories.map((name) => (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={selectedCategory === name}
                onClick={() => handleSelect(name)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 ${
                  selectedCategory === name ? 'text-indigo-700 bg-indigo-50/50 font-medium' : 'text-gray-700'
                }`}
              >
                <span className="truncate">{name}</span>
                {selectedCategory === name && <Check className="h-4 w-4 shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
