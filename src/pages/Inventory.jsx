// DukanBook - Inventory Page
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { formatCurrency, formatDisplayDate, toDateInputValue } from '../utils/helpers';
import {
  getUniqueCategories,
  resolveCategoryForSave,
} from '../utils/categoryUtils';
import Input from '../components/Input';
import CategoryInput from '../components/CategoryInput';

export default function Inventory({ items, allItems = [], onAdd, onUpdate, onDelete }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingItem) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editingItem]);

  const inventoryFilter = searchParams.get('filter') || 'all';
  const setInventoryFilter = (filter) => {
    if (filter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter });
    }
  };

  const initialFormState = {
    name: '', category: '', qty: '', supplier: '', threshold: '', costPrice: '0', sellPrice: '',
    manufactureDate: '', expiryDate: ''
  };

  const existingCategories = getUniqueCategories(allItems.length ? allItems : items);

  const buildProductPayload = (data) => ({
    name: data.name,
    category: resolveCategoryForSave(data.category, existingCategories),
    qty: parseFloat(data.qty) || 0,
    threshold: parseFloat(data.threshold) || 0,
    costPrice: parseFloat(data.costPrice) || 0,
    sellPrice: parseFloat(data.sellPrice) || 0,
    supplier: data.supplier || '',
    manufactureDate: data.manufactureDate?.trim() || null,
    expiryDate: data.expiryDate?.trim() || null
  });
  const [form, setForm] = useState(initialFormState);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd(buildProductPayload(form));
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
      await onUpdate(editingItem.id, buildProductPayload(editingItem));
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
        <div className="bg-[#27CCF5]/10 text-[#0F172A] px-4 py-3 rounded-[16px] flex justify-between items-center border border-[#E2E8F0]">
          <span>
            Showing <strong>{inventoryFilter === 'low' ? 'Low Stock' : 'Out of Stock'}</strong> items.
          </span>
          <button onClick={() => setInventoryFilter('all')} className="text-sm font-medium text-[#27CCF5] hover:text-[#1EA7D8]">
            Clear Filter
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-4">
        <input 
          type="text" 
          placeholder="Search items..." 
          className="input-modern w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button 
          onClick={() => {
            if (showAddForm) {
              setForm(initialFormState);
            }
            setShowAddForm(!showAddForm);
          }}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showAddForm ? 'Cancel' : 'Add Item'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <CategoryInput
                label="Category"
                required
                value={form.category}
                onChange={(category) => setForm({ ...form, category })}
                existingCategories={existingCategories}
              />
              <Input label="Quantity" type="number" step="any" required value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} />
              <Input label="Threshold" type="number" step="any" required value={form.threshold} onChange={e => setForm({...form, threshold: e.target.value})} />
              <Input label="Selling Price (₹)" type="number" step="0.01" required value={form.sellPrice} onChange={e => setForm({...form, sellPrice: e.target.value})} />
              <Input label="Supplier (Optional)" required={false} value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} />
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Product dates <span className="font-normal text-gray-500">(optional — leave blank if not needed)</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Manufacture Date"
                  type="date"
                  required={false}
                  value={form.manufactureDate}
                  onChange={e => setForm({ ...form, manufactureDate: e.target.value })}
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  required={false}
                  value={form.expiryDate}
                  onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
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
              .inventory-table th:nth-child(7),
              .inventory-table td:nth-child(7),
              .inventory-table th:nth-child(9),
              .inventory-table td:nth-child(9) {
                display: none;
              }
            `}
          </style>
          <table className="inventory-table table-sticky w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Mfg Date</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Cost ₹</th>
                <th className="px-4 py-3 text-right">Sell ₹</th>
                <th className="px-4 py-3 text-right">Margin %</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const margin = ((parseFloat(item.sellPrice) - parseFloat(item.costPrice)) / parseFloat(item.costPrice)) * 100;
                let statusBadge;
                if (parseFloat(item.qty) <= 0) statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-[#EF4444]/15 text-[#EF4444]">Out of Stock</span>;
                else if (parseFloat(item.qty) < parseFloat(item.threshold)) statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">Low Stock</span>;
                else statusBadge = <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">In Stock</span>;

                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-500">{item.category}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDisplayDate(item.manufactureDate)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDisplayDate(item.expiryDate)}</td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      <span className="font-medium">{item.qty}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.costPrice)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.sellPrice)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isFinite(margin) ? margin.toFixed(1) + '%' : '-'}
                    </td>
                    <td className="px-4 py-3">{statusBadge}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setEditingItem({
                            ...item,
                            manufactureDate: toDateInputValue(item.manufactureDate),
                            expiryDate: toDateInputValue(item.expiryDate)
                          })}
                          className="p-2 text-[#27CCF5] hover:bg-[#27CCF5]/10 rounded-2xl border border-transparent hover:border-[#27CCF5]/20 transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-2xl border border-transparent hover:border-[#EF4444]/20 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50" role="presentation">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setEditingItem(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-item-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 id="edit-item-title" className="text-lg font-bold">Edit Item: {editingItem.id}</h3>
                <button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="flex flex-col min-h-0 flex-1">
                <div className="overflow-y-auto overscroll-contain p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Name" required value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                    <CategoryInput
                      label="Category"
                      required
                      value={editingItem.category || ''}
                      onChange={(category) => setEditingItem({ ...editingItem, category })}
                      existingCategories={existingCategories}
                    />
                    <Input label="Quantity" type="number" step="any" required value={editingItem.qty} onChange={e => setEditingItem({...editingItem, qty: e.target.value})} />
                    <Input label="Threshold" type="number" step="any" required value={editingItem.threshold} onChange={e => setEditingItem({...editingItem, threshold: e.target.value})} />
                    <Input label="Cost Price (₹)" type="number" step="0.01" required value={editingItem.costPrice} onChange={e => setEditingItem({...editingItem, costPrice: e.target.value})} />
                    <Input label="Selling Price (₹)" type="number" step="0.01" required value={editingItem.sellPrice} onChange={e => setEditingItem({...editingItem, sellPrice: e.target.value})} />
                    <Input label="Supplier (Optional)" required={false} value={editingItem.supplier || ''} onChange={e => setEditingItem({...editingItem, supplier: e.target.value})} />
                  </div>

                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Product dates <span className="font-normal text-gray-500">(optional — leave blank if not needed)</span></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Manufacture Date"
                        type="date"
                        required={false}
                        value={editingItem.manufactureDate || ''}
                        onChange={e => setEditingItem({ ...editingItem, manufactureDate: e.target.value })}
                      />
                      <Input
                        label="Expiry Date"
                        type="date"
                        required={false}
                        value={editingItem.expiryDate || ''}
                        onChange={e => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="shrink-0 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-white rounded-b-xl">
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
        </div>
      )}
    </div>
  );
}
