const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwAkuARjZ-mKm4VnoVd3fGpnWTcmBSASWYLatCom379fvv5JxGfA7VXzsogmyew6YDp/exec';

export interface SyncStockData {
  stockDate: string;
  itemName: string;
  itemDetails?: {
    description?: string;
  };
  vendorName: string;
  vendorDetails?: {
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  quantity: number;
  purchasePrice: number;
  invoice: string;
}

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
  stockDate: string;
  itemName: string;
  vendorName: string;
  quantity: number;
  purchasePrice: number;
  totalValue: number;
  invoice: string;
  createdAt: string;
}

export async function syncToGoogleSheets(data: SyncStockData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        success: true,
        message: 'Data synced to Google Sheets successfully!',
      };
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Google Sheets sync error:', error);
    return {
      success: false,
      message: 'Failed to sync to Google Sheets.',
    };
  }
}

export async function fetchItems(): Promise<Item[]> {
  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getItems`);
    const result = await response.json();

    if (result.status === 'success') {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
}

export async function fetchVendors(): Promise<Vendor[]> {
  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getVendors`);
    const result = await response.json();

    if (result.status === 'success') {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return [];
  }
}

export async function fetchStockEntries(): Promise<StockEntry[]> {
  try {
    const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getStockEntries`);
    const result = await response.json();

    if (result.status === 'success') {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch stock entries:', error);
    return [];
  }
}

export async function createItem(name: string, description?: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createItem',
        name,
        description,
      }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        success: true,
        message: 'Item created successfully!',
      };
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Failed to create item:', error);
    return {
      success: false,
      message: 'Failed to create item.',
    };
  }
}

export async function createVendor(data: {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createVendor',
        ...data,
      }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        success: true,
        message: 'Vendor created successfully!',
      };
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Failed to create vendor:', error);
    return {
      success: false,
      message: 'Failed to create vendor.',
    };
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}
