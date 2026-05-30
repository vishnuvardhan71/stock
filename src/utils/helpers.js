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
