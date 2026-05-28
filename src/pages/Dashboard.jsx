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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Items" value={totalItems} icon={Package} color="text-indigo-600" onClick={() => navigate('/inventory')} />
        <MetricCard title="Low Stock" value={lowStock} icon={AlertTriangle} color="text-amber-500" onClick={() => navigate('/inventory?filter=low')} />
        <MetricCard title="Out of Stock" value={outOfStock} icon={XCircle} color="text-red-500" onClick={() => navigate('/inventory?filter=out')} />
        <MetricCard title="Total Sales" value={formatCurrency(totalSalesRevenue)} icon={TrendingUp} color="text-emerald-600" onClick={() => navigate('/history')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Recent Sales</h2>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Low Stock Alerts</h2>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-500 text-sm">All items are well stocked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium text-right">Qty</th>
                    <th className="px-4 py-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-right">{item.qty}</td>
                      <td className="px-4 py-3 text-right">
                        {parseFloat(item.qty) <= 0 ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Out of Stock</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">Low Stock</span>
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
