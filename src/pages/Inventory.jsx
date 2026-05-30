// DukanBook - Inventory Page
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import Input from '../components/Input';

export default function Inventory({ items, onAdd, onUpdate, onDelete }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const inventoryFilter = searchParams.get('filter') || 'all';
  const setInventoryFilter = (filter) => {
    if (filter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter });
    }
  };

  const initialFormState = {
    name: '', category: '', qty: '', supplier: '', threshold: '', costPrice: '0', sellPrice: ''
  };
  const [form, setForm] = useState(initialFormState);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newItemPayload = {
        name: form.name,
        category: form.category,
        qty: parseFloat(form.qty) || 0,
        threshold: parseFloat(form.threshold) || 0,
        costPrice: parseFloat(form.costPrice) || 0,
        sellPrice: parseFloat(form.sellPrice) || 0,
        supplier: form.supplier || ''
      };
      
      await onAdd(newItemPayload);
      setForm(initialFormState);
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add inventory item:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onUpdate(editingItem.id, {
        name: editingItem.name,
        category: editingItem.category,
        qty: parseFloat(editingItem.qty) || 0,
        threshold: parseFloat(editingItem.threshold) || 0,
        costPrice: parseFloat(editingItem.costPrice) || 0,
        sellPrice: parseFloat(editingItem.sellPrice) || 0,
        supplier: editingItem.supplier || ''
      });
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to update inventory item:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await onDelete(id);
      } catch (err) {
        console.error("Failed to delete inventory item:", err);
      }
    }
  };

  const filteredItems = items.filter(i => {
    const nameMatch = i.name ? i.name.toLowerCase().includes(search.toLowerCase()) : false;
    const idMatch = i.id ? i.id.toLowerCase().includes(search.toLowerCase()) : false;
    const catMatch = i.category ? i.category.toLowerCase().includes(search.toLowerCase()) : false;

    const matchesSearch = nameMatch || idMatch || catMatch;
    
    let matchesFilter = true;
    if (inventoryFilter === 'low') matchesFilter = parseFloat(i.qty) > 0 && parseFloat(i.qty) < parseFloat(i.threshold);
    if (inventoryFilter === 'out') matchesFilter = parseFloat(i.qty) <= 0;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {inventoryFilter !== 'all' && (
        <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg flex justify-between items-center border border-indigo-100">
          <span>
            Showing <strong>{inventoryFilter === 'low' ? 'Low Stock' : 'Out of Stock'}</strong> items.
          </span>
          <button onClick={() => setInventoryFilter('all')} className="text-sm underline hover:text-indigo-900">
            Clear Filter
          </button>
        </div>
      )}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <input 
          type="text" 
          placeholder="Search items..." 
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shrink-0 ml-4"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showAddForm ? 'Cancel' : 'Add Item'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
          <style>
            {`
              .add-item-form > div:nth-child(5) {
                display: none;
              }
            `}
          </style>
          <form onSubmit={handleAddSubmit} className="add-item-form grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <Input label="Category" required value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            <Input label="Quantity" type="number" step="any" required value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} />
            <Input label="Threshold" type="number" step="any" required value={form.threshold} onChange={e => setForm({...form, threshold: e.target.value})} />
            <Input label="Cost Price (₹)" type="number" step="0.01" required value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} />
            <Input label="Selling Price (₹)" type="number" step="0.01" required value={form.sellPrice} onChange={e => setForm({...form, sellPrice: e.target.value})} />
            <Input label="Supplier (Optional)" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} />
            
            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {submitting ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <style>
            {`
              .inventory-table th:nth-child(5),
              .inventory-table td:nth-child(5),
              .inventory-table th:nth-child(7),
              .inventory-table td:nth-child(7) {
                display: none;
              }
            `}
          </style>
          <table className="inventory-table w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Cost ₹</th>
                <th className="px-4 py-3 text-right">Sell ₹</th>
                <th className="px-4 py-3 text-right">Margin %</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const margin = ((parseFloat(item.sellPrice) - parseFloat(item.costPrice)) / parseFloat(item.costPrice)) * 100;
                let statusBadge;
                if (parseFloat(item.qty) <= 0) statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Out of Stock</span>;
                else if (parseFloat(item.qty) < parseFloat(item.threshold)) statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">Low Stock</span>;
                else statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">In Stock</span>;

                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.id}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.category}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium">{item.qty}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.costPrice)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.sellPrice)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {isFinite(margin) ? margin.toFixed(1) + '%' : '-'}
                    </td>
                    <td className="px-4 py-3">{statusBadge}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setEditingItem(item)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded border border-transparent hover:border-indigo-200">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setEditingItem(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">Edit Item: {editingItem.id}</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" required value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                <Input label="Category" required value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} />
                <Input label="Quantity" type="number" step="any" required value={editingItem.qty} onChange={e => setEditingItem({...editingItem, qty: e.target.value})} />
                <Input label="Threshold" type="number" step="any" required value={editingItem.threshold} onChange={e => setEditingItem({...editingItem, threshold: e.target.value})} />
                <Input label="Cost Price (₹)" type="number" step="0.01" required value={editingItem.costPrice} onChange={e => setEditingItem({...editingItem, costPrice: e.target.value})} />
                <Input label="Selling Price (₹)" type="number" step="0.01" required value={editingItem.sellPrice} onChange={e => setEditingItem({...editingItem, sellPrice: e.target.value})} />
                <Input label="Supplier" value={editingItem.supplier || ''} onChange={e => setEditingItem({...editingItem, supplier: e.target.value})} />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300">Cancel</button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg border border-indigo-700 disabled:bg-indigo-400"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
