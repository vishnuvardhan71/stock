// DukanBook - Dashboard Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ items, sales }) {
  const navigate = useNavigate();

  const totalItems = items.length;
  const lowStock = items.filter(i => parseFloat(i.qty) > 0 && parseFloat(i.qty) < parseFloat(i.threshold)).length;
  const outOfStock = items.filter(i => parseFloat(i.qty) <= 0).length;
  const totalSalesRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.grandTotal), 0);

  const recentSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const lowStockItems = items.filter(i => parseFloat(i.qty) > 0 && parseFloat(i.qty) < parseFloat(i.threshold)).sort((a, b) => parseFloat(a.qty) - parseFloat(b.qty));

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Items"
          value={totalItems}
          icon={Package}
          accentColor="text-[#5DC0BA]"
          iconBg="bg-[#5DC0BA]/15"
          borderColor="border-[#5DC0BA]"
          cardStyle={{ backgroundColor: 'rgba(93,192,186,0.12)' }}
          onClick={() => navigate('/inventory')}
        />
        <MetricCard
          title="Low Stock"
          value={lowStock}
          icon={AlertTriangle}
          accentColor="text-[#F59E0B]"
          iconBg="bg-[#F59E0B]/15"
          borderColor="border-[#F59E0B]"
          cardStyle={{ backgroundColor: 'rgba(245,158,11,0.12)' }}
          onClick={() => navigate('/inventory?filter=low')}
        />
        <MetricCard
          title="Out of Stock"
          value={outOfStock}
          icon={XCircle}
          accentColor="text-[#EF4444]"
          iconBg="bg-[#EF4444]/15"
          borderColor="border-[#EF4444]"
          cardStyle={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
          onClick={() => navigate('/inventory?filter=out')}
        />
        <MetricCard
          title="Total Sales"
          value={formatCurrency(totalSalesRevenue)}
          icon={TrendingUp}
          accentColor="text-[#10B981]"
          iconBg="bg-[#10B981]/15"
          borderColor="border-[#10B981]"
          cardStyle={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
          onClick={() => navigate('/history')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card border-transparent p-5">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 border-b border-slate-200 pb-2">Recent Sales</h2>
          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-sm">No sales recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 font-medium">Bill</th>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(sale => (
                    <tr key={sale.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3">{sale.id}</td>
                      <td className="px-4 py-3">{sale.customer || 'Guest'}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(sale.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-card border-transparent p-5">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 border-b border-slate-200 pb-2">Low Stock Alerts</h2>
          {lowStockItems.length === 0 ? (
            <p className="text-slate-500 text-sm">All items are well stocked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-sticky w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 table-row-hover last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{item.qty}</td>
                      <td className="px-4 py-3 text-right">
                        {parseFloat(item.qty) <= 0 ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-[#EF4444]/15 text-[#EF4444]">Out of Stock</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">Low Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
