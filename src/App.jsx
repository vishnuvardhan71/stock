// DukanBook - Main App Shell with Routing
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, History } from 'lucide-react';
import './utils/helpers'; // Initialize window.storage

import BillModal from './components/BillModal';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sell from './pages/Sell';
import HistoryPage from './pages/History';

export default function App() {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [ctr, setCtr] = useState({ items: 0, sales: 0 });

  // Initialize data
  useEffect(() => {
    const sm_items = window.storage.get('sm_items') || [];
    const sm_sales = window.storage.get('sm_sales') || [];
    const sm_ctr = window.storage.get('sm_ctr') || { items: 0, sales: 0 };
    setItems(sm_items);
    setSales(sm_sales);
    setCtr(sm_ctr);
  }, []);

  // Save on change
  useEffect(() => {
    if (items.length > 0 || sales.length > 0 || ctr.items > 0) {
      window.storage.set('sm_items', items);
      window.storage.set('sm_sales', sales);
      window.storage.set('sm_ctr', ctr);
    }
  }, [items, sales, ctr]);

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

      {/* Header / Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-indigo-600">
          <Package className="h-8 w-8" />
          <h1 className="text-2xl font-bold tracking-tight">DukanBook</h1>
        </div>
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
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Dashboard items={items} sales={sales} />} />
          <Route path="/inventory" element={<Inventory items={items} setItems={setItems} ctr={ctr} setCtr={setCtr} />} />
          <Route path="/sell" element={<Sell items={items} setItems={setItems} sales={sales} setSales={setSales} ctr={ctr} setCtr={setCtr} onPrint={(bill) => handleBillAction(bill, true)} onPreview={(bill) => handleBillAction(bill, false)} />} />
          <Route path="/history" element={<HistoryPage sales={sales} onPrint={(bill) => handleBillAction(bill, true)} onPreview={(bill) => handleBillAction(bill, false)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Bill Preview/Print Modal */}
      <BillModal billToPrint={billToPrint} setBillToPrint={setBillToPrint} />
    </div>
  );
}
