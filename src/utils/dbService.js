// DukanBook - Database Service Layer
import { supabase } from './supabaseClient';

// Helper to map DB row to client format (snake_case -> camelCase)
const mapProductToClient = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    qty: row.qty !== null ? parseFloat(row.qty) : 0,
    threshold: row.threshold !== null ? parseFloat(row.threshold) : 0,
    costPrice: row.cost_price !== null ? parseFloat(row.cost_price) : 0,
    sellPrice: row.sell_price !== null ? parseFloat(row.sell_price) : 0,
    supplier: row.supplier || '',
    dateAdded: row.date_added
  };
};

// Helper to map client object to DB format (camelCase -> snake_case)
const mapProductToDB = (item) => {
  if (!item) return null;
  return {
    name: item.name,
    category: item.category,
    qty: parseFloat(item.qty) || 0,
    threshold: parseFloat(item.threshold) || 0,
    cost_price: parseFloat(item.costPrice) || 0,
    sell_price: parseFloat(item.sellPrice) || 0,
    supplier: item.supplier || null
  };
};

// Helper to map DB sales row to client format
const mapSaleToClient = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    storeName: row.store_name || '',
    gstNumber: row.gst_number || '',
    customer: row.customer || 'Walk-in Customer',
    items: row.items || [],
    subtotal: row.subtotal !== null ? parseFloat(row.subtotal) : 0,
    discount: row.discount !== null ? parseFloat(row.discount) : 0,
    grandTotal: row.grand_total !== null ? parseFloat(row.grand_total) : 0
  };
};

// Helper to map client sale to DB format
const mapSaleToDB = (sale) => {
  if (!sale) return null;
  return {
    store_name: sale.storeName || null,
    gst_number: sale.gstNumber || null,
    customer: sale.customer || 'Walk-in Customer',
    items: sale.items || [],
    subtotal: parseFloat(sale.subtotal) || 0,
    discount: parseFloat(sale.discount) || 0,
    grand_total: parseFloat(sale.grandTotal) || 0
  };
};

// Database Service Interface
export const dbService = {
  // PRODUCTS CRUD
  async getProducts() {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('date_added', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(mapProductToClient);
  },

  async addProduct(product) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const dbItem = mapProductToDB(product);
    const { data, error } = await supabase
      .from('products')
      .insert([dbItem])
      .select();
    
    if (error) throw error;
    return mapProductToClient(data[0]);
  },

  async updateProduct(id, product) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const dbItem = mapProductToDB(product);
    const { data, error } = await supabase
      .from('products')
      .update(dbItem)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return mapProductToClient(data[0]);
  },

  async deleteProduct(id) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // SALES HISTORY CRUD
  async getSales() {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(mapSaleToClient);
  },

  /**
   * Processes a transaction:
   * 1. Inserts a record in the 'sales' table.
   * 2. For each sold item, fetches latest quantity from DB, decrements it, and updates DB.
   */
  async processSale(sale) {
    if (!supabase) throw new Error("Supabase is not configured.");

    // 1. Insert the sale bill
    const dbSale = mapSaleToDB(sale);
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([dbSale])
      .select();

    if (saleError) throw saleError;

    // 2. Decrement stock for each item sold
    for (const item of sale.items) {
      // Fetch latest quantity to ensure accuracy and prevent race condition
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('qty')
        .eq('id', item.itemId)
        .single();

      if (prodError) throw prodError;

      const currentQty = parseFloat(prodData.qty) || 0;
      const newQty = Math.max(0, currentQty - parseFloat(item.qty));

      const { error: updateError } = await supabase
        .from('products')
        .update({ qty: newQty })
        .eq('id', item.itemId);

      if (updateError) throw updateError;
    }

    return mapSaleToClient(saleData[0]);
  }
};
