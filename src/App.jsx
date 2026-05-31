// DukanBook - Main App Shell with Routing & Authentication & Supabase DB Sync
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, History, LogOut, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import './utils/helpers'; // Initialize window.storage

import { isSupabaseConfigured } from './utils/supabaseClient';
import { dbService } from './utils/dbService';

import BillModal from './components/BillModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sell from './pages/Sell';
import HistoryPage from './pages/History';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check auth on mount
  useEffect(() => {
    const auth = window.storage.sessionGet('db_auth');
    if (auth && auth.loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const loadData = async () => {
    if (!isSupabaseConfigured) {
      // Graceful fallback to local storage
      const sm_items = window.storage.get('sm_items') || [];
      const sm_sales = window.storage.get('sm_sales') || [];
      setItems(sm_items);
      setSales(sm_sales);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedProducts = await dbService.getProducts();
      const fetchedSales = await dbService.getSales();

      let finalProducts = fetchedProducts;
      let finalSales = fetchedSales;

      // ONE-TIME AUTOMATIC MIGRATION:
      // If the Supabase database has no products, and there is local stock data,
      // upload the local stock to Supabase to prevent user data loss.
      if (fetchedProducts.length === 0) {
        const localItems = window.storage.get('sm_items') || [];
        if (localItems.length > 0) {
          console.log("Migrating local items to Supabase...");
          for (const item of localItems) {
            await dbService.addProduct(item);
          }
          finalProducts = await dbService.getProducts();
        }
      }

      // If the Supabase database has no sales history, and there is local sales history,
      // upload the history to Supabase.
      if (fetchedSales.length === 0) {
        const localSales = window.storage.get('sm_sales') || [];
        if (localSales.length > 0) {
          console.log("Migrating local sales history to Supabase...");
          for (const sale of localSales) {
            // Write directly to DB service to bypass quantity decrementing for past sales
            await dbService.processSale({
              ...sale,
              items: sale.items.map(i => ({ ...i, qty: 0 })) // bypass double decrement in this migration context
            });
          }
          finalSales = await dbService.getSales();
        }
      }

      setItems(finalProducts);
      setSales(finalSales);
    } catch (err) {
      console.error("Failed to load data from Supabase:", err);
      setError("Database connection error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load database content once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const [billToPrint, setBillToPrint] = useState(null);

  const handleBillAction = (bill, autoPrint = true) => {
    setBillToPrint(bill);
    if (autoPrint) {
      setTimeout(() => {
        window.print();
        setBillToPrint(null);
      }, 100);
    }
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }
    window.storage.sessionRemove('db_auth');
    setIsAuthenticated(false);
  };

  // DATABASE WRAPPER MUTATIONS (Passed to Child Components)
  
  const handleAddItem = async (productForm) => {
    if (!isSupabaseConfigured) {
      const newIdNum = items.length + 1;
      const newId = `ITEM${String(newIdNum).padStart(4, '0')}`;
      const newItem = {
        id: newId,
        ...productForm,
        qty: parseFloat(productForm.qty) || 0,
        dateAdded: new Date().toISOString()
      };
      const updated = [...items, newItem];
      setItems(updated);
      window.storage.set('sm_items', updated);
      return newItem;
    }

    setIsLoading(true);
    setError(null);
    try {
      const addedItem = await dbService.addProduct(productForm);
      setItems(prev => [...prev, addedItem]);
      return addedItem;
    } catch (err) {
      console.error(err);
      setError("Failed to add product: " + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (id, updatedForm) => {
    if (!isSupabaseConfigured) {
      const updated = items.map(i => i.id === id ? { ...i, ...updatedForm } : i);
      setItems(updated);
      window.storage.set('sm_items', updated);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updated = await dbService.updateProduct(id, updatedForm);
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch (err) {
      console.error(err);
      setError("Failed to update product: " + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!isSupabaseConfigured) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      window.storage.set('sm_items', updated);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await dbService.deleteProduct(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete product: " + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessSale = async (saleData) => {
    if (!isSupabaseConfigured) {
      const newIdNum = sales.length + 1;
      const billId = `BILL${String(newIdNum).padStart(4, '0')}`;
      const newSale = {
        id: billId,
        date: new Date().toISOString(),
        ...saleData
      };
      
      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      window.storage.set('sm_sales', updatedSales);

      // Decrement quantities locally
      const updatedItems = items.map(i => {
        const soldItem = saleData.items.find(s => s.itemId === i.id);
        if (soldItem) {
          return { ...i, qty: Math.max(0, parseFloat(i.qty) - parseFloat(soldItem.qty)) };
        }
        return i;
      });
      setItems(updatedItems);
      window.storage.set('sm_items', updatedItems);

      return newSale;
    }

    setIsLoading(true);
    setError(null);
    try {
      const processed = await dbService.processSale(saleData);
      
      // Fetch latest states from database to maintain sync across devices
      const freshProducts = await dbService.getProducts();
      const freshSales = await dbService.getSales();
      setItems(freshProducts);
      setSales(freshSales);
      
      return processed;
    } catch (err) {
      console.error(err);
      setError("Failed to record transaction: " + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/sell', label: 'Sell', icon: ShoppingCart },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #bill-print, #bill-print * {
              visibility: visible;
            }
            #bill-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

      {/* Warning / Error Banners */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-amber-800 text-sm">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Sandbox Mode:</strong> Supabase keys are missing in <code>.env</code>. Data will be saved locally on this device only.
            </span>
          </div>
          <span className="text-xs text-amber-700 italic">See supabase_setup.md in project root</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between text-red-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadData} 
              className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-950 font-semibold transition-colors text-xs"
            >
              <RefreshCw className="h-3 w-3" /> Retry Sync
            </button>
            <button 
              onClick={() => setError(null)} 
              className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Header / Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-indigo-600">
          <Package className="h-8 w-8" />
          <h1 className="text-2xl font-bold tracking-tight">DukanBook</h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex space-x-1">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-200"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative">
        <Routes>
          <Route path="/" element={<Dashboard items={items} sales={sales} />} />
          <Route 
            path="/inventory" 
            element={
              <Inventory 
                items={items} 
                onAdd={handleAddItem} 
                onUpdate={handleUpdateItem} 
                onDelete={handleDeleteItem} 
              />
            } 
          />
          <Route 
            path="/sell" 
            element={
              <Sell 
                items={items} 
                onProcessSale={handleProcessSale}
                onPrint={(bill) => handleBillAction(bill, true)} 
                onPreview={(bill) => handleBillAction(bill, false)} 
              />
            } 
          />
          <Route 
            path="/history" 
            element={
              <HistoryPage 
                sales={sales} 
                onPrint={(bill) => handleBillAction(bill, true)} 
                onPreview={(bill) => handleBillAction(bill, false)} 
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Toast Sync Spinner */}
      {isLoading && (
        <div className="fixed bottom-6 right-6 bg-slate-900/80 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 backdrop-blur-sm border border-slate-700">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-400 border-t-transparent"></div>
          <span className="text-xs font-medium">Syncing with Supabase...</span>
        </div>
      )}

      {/* Bill Preview/Print Modal */}
      <BillModal billToPrint={billToPrint} setBillToPrint={setBillToPrint} />
    </div>
  );
}
