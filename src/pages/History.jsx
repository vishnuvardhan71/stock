// DukanBook - History Page
import React from 'react';
import { Printer } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function History({ sales, onPrint, onPreview }) {
  const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Sales History</h2>
        <span className="text-sm text-gray-500">{sales.length} records found</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Date/Time</th>
              <th className="px-4 py-3">Bill No.</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 text-center">Items</th>
              <th className="px-4 py-3 text-right">Discount</th>
              <th className="px-4 py-3 text-right">Grand Total</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedSales.map(sale => (
              <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{new Date(sale.date).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-400">{new Date(sale.date).toLocaleTimeString()}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{sale.id}</td>
                <td className="px-4 py-3">{sale.customer}</td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                    {sale.items.length} types
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-red-500">{formatCurrency(sale.discount)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(sale.grandTotal)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => onPreview(sale)} 
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => onPrint(sale)} 
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                    >
                      <Printer className="h-4 w-4" /> Reprint
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedSales.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No sales history available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
