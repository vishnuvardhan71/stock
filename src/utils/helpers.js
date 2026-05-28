// DukanBook - Shared Utilities

// Setup window.storage for localStorage persistence
if (typeof window.storage === 'undefined') {
  window.storage = {
    get: (key) => {
      try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    },
    set: (key, val) => {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };
}

export const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;
