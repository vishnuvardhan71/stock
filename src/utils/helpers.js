// DukanBook - Shared Utilities

// Setup window.storage for localStorage persistence
if (typeof window.storage === 'undefined') {
  window.storage = {
    get: (key) => {
      try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    },
    set: (key, val) => {
      localStorage.setItem(key, JSON.stringify(val));
    },
    sessionGet: (key) => {
      try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
    },
    sessionSet: (key, val) => {
      sessionStorage.setItem(key, JSON.stringify(val));
    },
    sessionRemove: (key) => {
      sessionStorage.removeItem(key);
    }
  };
}

export const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

/** Normalize DB/local date values for date inputs (YYYY-MM-DD). */
export const toDateInputValue = (value) => {
  if (!value) return '';
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

export const formatDisplayDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${toDateInputValue(value)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
