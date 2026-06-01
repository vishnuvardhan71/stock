// Header category filter dropdown
import React, { useState, useRef, useEffect } from 'react';
import { Tags, ChevronDown, Check } from 'lucide-react';

export default function CategoryNavMenu({ categories, selectedCategory, browserOpen, onSelectCategory, onOpenCategories, onAllCategories }) {
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
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
          selectedCategory || browserOpen
            ? 'bg-[#27CCF5] text-white shadow-sm'
            : 'text-slate-600 hover:text-[#27CCF5] hover:bg-[#27CCF5]/10'
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Tags className="h-5 w-5" />
        <span className="hidden sm:inline">Category</span>
        {(selectedCategory || browserOpen) && (
          <span className="hidden md:inline text-xs font-normal opacity-80 max-w-[8rem] truncate">
            ({selectedCategory || 'All Categories'})
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
            aria-selected={!selectedCategory && browserOpen}
            onClick={() => {
              onAllCategories();
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 ${
              !selectedCategory && browserOpen ? 'text-indigo-700 bg-indigo-50/50 font-medium' : 'text-gray-700'
            }`}
          >
            All Categories
            {!selectedCategory && browserOpen && <Check className="h-4 w-4 shrink-0" />}
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
                onClick={() => {
                  handleSelect(name);
                  setOpen(false);
                }}
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
