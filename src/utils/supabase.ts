import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Item {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Vendor {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface StockEntry {
  id: number;
  item_id: number;
  vendor_id: number;
  purchase_price: number;
  quantity: number;
  invoice: string;
  stock_date: string;
  created_at: string;
  items?: Item;
  vendors?: Vendor;
}

// Items API
export async function fetchItems(): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform snake_case to camelCase
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
}

export async function createItem(
  name: string,
  description?: string
): Promise<{ success: boolean; message: string; data?: Item }> {
  try {
    const { data, error } = await supabase
      .from('items')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Item created successfully!',
      data,
    };
  } catch (error: any) {
    console.error('Failed to create item:', error);
    return {
      success: false,
      message: error.message || 'Failed to create item.',
    };
  }
}

export async function deleteItem(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from('items').delete().eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'Item deleted successfully!',
    };
  } catch (error: any) {
    console.error('Failed to delete item:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete item.',
    };
  }
}

// Vendors API
export async function fetchVendors(): Promise<Vendor[]> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform snake_case to camelCase
    return (data || []).map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      contactPerson: vendor.contact_person,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      createdAt: vendor.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return [];
  }
}

export async function createVendor(vendor: {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<{ success: boolean; message: string; data?: Vendor }> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .insert([{
        name: vendor.name,
        contact_person: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Vendor created successfully!',
      data,
    };
  } catch (error: any) {
    console.error('Failed to create vendor:', error);
    return {
      success: false,
      message: error.message || 'Failed to create vendor.',
    };
  }
}

export async function deleteVendor(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from('vendors').delete().eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'Vendor deleted successfully!',
    };
  } catch (error: any) {
    console.error('Failed to delete vendor:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete vendor.',
    };
  }
}

// Stock Entries API
export async function fetchStockEntries(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('stock_entries')
      .select(`
        *,
        items (
          id,
          name,
          description
        ),
        vendors (
          id,
          name,
          contact_person,
          phone,
          email,
          address
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match the format expected by the UI
    const transformed = (data || []).map((entry: any) => ({
      id: entry.id,
      itemId: entry.item_id,
      itemName: entry.items?.name || '',
      vendorId: entry.vendor_id,
      vendorName: entry.vendors?.name || '',
      purchasePrice: parseFloat(entry.purchase_price),
      quantity: entry.quantity,
      invoice: entry.invoice,
      createdAt: entry.stock_date || entry.created_at,
    }));

    return transformed;
  } catch (error) {
    console.error('Failed to fetch stock entries:', error);
    return [];
  }
}

export async function createStockEntry(entry: {
  item_id: number;
  vendor_id: number;
  purchase_price: number;
  quantity: number;
  invoice: string;
  stock_date: string;
}): Promise<{ success: boolean; message: string; data?: StockEntry }> {
  try {
    const { data, error } = await supabase
      .from('stock_entries')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Stock entry created successfully!',
      data,
    };
  } catch (error: any) {
    console.error('Failed to create stock entry:', error);
    return {
      success: false,
      message: error.message || 'Failed to create stock entry.',
    };
  }
}

export async function updateStockEntry(
  id: number,
  entry: {
    item_id: number;
    vendor_id: number;
    purchase_price: number;
    quantity: number;
    invoice: string;
    stock_date: string;
  }
): Promise<{ success: boolean; message: string; data?: StockEntry }> {
  try {
    const { data, error } = await supabase
      .from('stock_entries')
      .update(entry)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Stock entry updated successfully!',
      data,
    };
  } catch (error: any) {
    console.error('Failed to update stock entry:', error);
    return {
      success: false,
      message: error.message || 'Failed to update stock entry.',
    };
  }
}

export async function deleteStockEntry(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from('stock_entries').delete().eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'Stock entry deleted successfully!',
    };
  } catch (error: any) {
    console.error('Failed to delete stock entry:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete stock entry.',
    };
  }
}
