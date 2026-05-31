// Category field with autocomplete and case-insensitive matching
import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import {
  findExactCategory,
  getCategorySuggestions,
} from '../utils/categoryUtils';

export default function CategoryInput({
  label = 'Category',
  value,
  onChange,
  existingCategories = [],
  required = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listId = useId();

  const query = (value || '').trim();
  const exactMatch = useMemo(
    () => (query ? findExactCategory(query, existingCategories) : null),
    [query, existingCategories]
  );

  const suggestions = useMemo(() => {
    if (!query || exactMatch) return [];
    return getCategorySuggestions(query, existingCategories, 5);
  }, [query, exactMatch, existingCategories]);

  const valueMatchesCanonical = exactMatch && value.trim() === exactMatch;
  const showExactMessage = Boolean(
    focused && query && exactMatch && !valueMatchesCanonical
  );
  const showNoMatchMessage = Boolean(
    focused && query && !exactMatch && suggestions.length === 0
  );
  const showDropdown = open && focused && suggestions.length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, suggestions.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyCanonicalOnBlur = () => {
    if (exactMatch && exactMatch !== value) {
      onChange(exactMatch);
    }
    setOpen(false);
  };

  const selectSuggestion = (name) => {
    onChange(name);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={() => {
          setFocused(false);
          applyCanonicalOnBlur();
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="Type to search or create…"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
      />

      {showExactMessage && (
        <p className="mt-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2.5 py-1.5">
          Category already exists: <strong>{exactMatch}</strong>
        </p>
      )}

      {showNoMatchMessage && (
        <p className="mt-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
          No matching categories found. You can create a new category.
        </p>
      )}

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
        >
          {suggestions.map((name, index) => (
            <li key={name} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(name)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                  index === activeIndex ? 'bg-indigo-50 text-indigo-800' : 'text-gray-800'
                }`}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
