// DukanBook - Sell Page
import React, { useState, useEffect } from 'react';
import { Printer, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { getUniqueCategories, categoriesMatch } from '../utils/categoryUtils';
import Input from '../components/Input';

export default function Sell({ items, onProcessSale, onPrint, onPreview }) {
  const [customer, setCustomer] = useState('');
  const [storeName, setStoreName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [sellQty, setSellQty] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = getUniqueCategories(items);
  const availableItems = items.filter(i => {
    if (selectedCategory && !categoriesMatch(i.category, selectedCategory)) return false;
    return true;
  });

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedItemId('');
    setSellPrice('');
    setSellQty('');
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  // Auto-fill price when item selected
  useEffect(() => {
    if (selectedItem) {
      setSellPrice(selectedItem.sellPrice);
    } else {
      setSellPrice('');
    }
  }, [selectedItem]);

  // Helper to calculate how much stock remains for an item considering what is in the cart
  const getAvailableStock = (item) => {
    if (!item) return 0;
    const cartItem = cart.find(c => c.itemId === item.id);
    const cartQty = cartItem ? parseFloat(cartItem.qty) : 0;
    return Math.max(0, parseFloat(item.qty) - cartQty);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    const qty = parseFloat(sellQty);
    if (qty <= 0) return alert("Quantity must be greater than 0");
    
    const availableStock = getAvailableStock(selectedItem);
    if (qty > availableStock) return alert("Not enough stock available!");

    const existingCartItemIndex = cart.findIndex(c => c.itemId === selectedItemId);
    let newCart = [...cart];
    
    if (existingCartItemIndex >= 0) {
      const existing = newCart[existingCartItemIndex];
      const newQty = existing.qty + qty;
      if (newQty > parseFloat(selectedItem.qty)) return alert("Not enough stock for combined quantity!");
      existing.qty = newQty;
      existing.amount = newQty * parseFloat(sellPrice);
    } else {
      newCart.push({
        itemId: selectedItem.id,
        name: selectedItem.name,
        qty: qty,
        rate: parseFloat(sellPrice),
        amount: qty * parseFloat(sellPrice)
      });
    }

    setCart(newCart);
    setSelectedItemId('');
    setSellQty('');
    setSellPrice('');
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.amount, 0);
  const discountAmt = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmt);

  const processSale = async (isAutoPrint) => {
    if (cart.length === 0) return alert("Cart is empty");
    
    const newSale = {
      storeName: storeName,
      gstNumber: gstNumber,
      customer: customer || 'Walk-in Customer',
      items: cart,
      subtotal,
      discount: discountAmt,
      grandTotal
    };

    setSubmitting(true);
    try {
      const processed = await onProcessSale(newSale);
      
      // Reset cart
      setCustomer('');
      setCart([]);
      setDiscount('');

      if (isAutoPrint) {
        onPrint(processed);
      } else {
        if (onPreview) onPreview(processed);
        else onPrint(processed);
      }
    } catch (err) {
      console.error("Failed to process transaction:", err);
      alert("Error saving transaction: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Add to Bill</h2>
          <form onSubmit={handleAddToCart} className="space-y-4">
            <Input label="Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Walk-in Customer" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  required
                >
                  <option value="">-- Select Item --</option>
                  {availableItems.map(i => {
                    const availableStock = getAvailableStock(i);
                    const isOutOfStock = availableStock <= 0;
                    return (
                      <option key={i.id} value={i.id} disabled={isOutOfStock}>
                        {i.name} {isOutOfStock ? '(Out of stock)' : `(${availableStock} available)`}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            
            {selectedItem && (
              <div className="p-3 bg-indigo-50 text-indigo-800 rounded-lg text-sm flex justify-between items-center border border-indigo-100 animate-pulse">
                <span>Available Stock:</span>
                <span className="font-bold">{getAvailableStock(selectedItem)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity" type="number" step="any" required value={sellQty} onChange={e => setSellQty(e.target.value)} />
              <Input label="Selling Price (₹)" type="number" step="0.01" required value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
            </div>

            <button 
              type="submit" 
              disabled={!selectedItem || getAvailableStock(selectedItem) <= 0} 
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
            >
              Add to Bill
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Cart & Summary */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Current Bill</h2>
          
          <div className="flex-1 overflow-x-auto min-h-[200px]">
            <table className="w-full text-sm text-left border-collapse border-b border-gray-100">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium">{c.name}</td>
                    <td className="px-3 py-3 text-right">{c.qty}</td>
                    <td className="px-3 py-3 text-right">{formatCurrency(c.rate)}</td>
                    <td className="px-3 py-3 text-right font-medium">{formatCurrency(c.amount)}</td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => removeFromCart(i)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><Minus className="h-4 w-4"/></button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-400">Cart is empty</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t pt-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600 w-1/3">Discount (₹)</span>
              <input type="number" className="w-2/3 border border-gray-300 rounded px-2 py-1 text-right text-sm" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0.00" />
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600 w-1/3">Store Name</span>
              <input type="text" className="w-2/3 border border-gray-300 rounded px-2 py-1 text-right text-sm" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="ESTIMATION" />
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600 w-1/3">GST Number</span>
              <input type="text" className="w-2/3 border border-gray-300 rounded px-2 py-1 text-right text-sm" value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="Optional" />
            </div>
            
            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t text-indigo-700">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>

            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => processSale(false)}
                disabled={cart.length === 0 || submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white py-3 rounded-xl hover:bg-slate-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 shadow-sm text-sm font-semibold"
              >
                <span>{submitting ? 'Saving...' : 'Preview & Save'}</span>
              </button>
              
              <button 
                onClick={() => processSale(true)}
                disabled={cart.length === 0 || submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 shadow-sm text-sm font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>{submitting ? 'Printing...' : 'Confirm & Print'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
