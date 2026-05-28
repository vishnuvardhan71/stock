// DukanBook - Bill Print/Preview Modal Component
import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function BillModal({ billToPrint, setBillToPrint }) {
  if (!billToPrint) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto print:bg-white print:p-0 print:block">
      <div id="bill-print" className="bg-white p-8 max-w-2xl w-full mx-auto text-black rounded-xl shadow-xl print:shadow-none print:rounded-none relative">
        <div className="flex justify-end mb-4 print:hidden">
          <button onClick={() => setBillToPrint(null)} className="text-gray-500 hover:text-gray-800"><X className="h-6 w-6" /></button>
        </div>
        
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{billToPrint.storeName || 'ESTIMATION'}</h1>
          {billToPrint.gstNumber && <p className="text-gray-600 mt-1">GSTIN: {billToPrint.gstNumber}</p>}
        </div>
        
        <div className="flex justify-between mb-8 text-sm">
          <div>
            <p><span className="font-semibold">Bill No:</span> {billToPrint.id}</p>
            <p><span className="font-semibold">Date:</span> {new Date(billToPrint.date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Time:</span> {new Date(billToPrint.date).toLocaleTimeString()}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Customer:</span> {billToPrint.customer}</p>
          </div>
        </div>

        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {billToPrint.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-right">{item.qty}</td>
                <td className="py-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="w-1/2 ml-auto space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(billToPrint.subtotal)}</span>
          </div>
          {parseFloat(billToPrint.discount) > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-{formatCurrency(billToPrint.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 border-gray-300">
            <span>Grand Total:</span>
            <span>{formatCurrency(billToPrint.grandTotal)}</span>
          </div>
        </div>
        
        <div className="mt-12 text-center text-gray-500 text-sm border-t pt-4">
          Thank you for your business!
        </div>

        <div className="mt-8 flex justify-end print:hidden">
          <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Print Bill</button>
        </div>
      </div>
    </div>
  );
}
