const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbykbAanQBDhutk6U7arqsrQ5nsKHyKt9Wi1TmkkeHgsoyihzJuljUizecKrR9xd_AM/exec';

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

export async function syncToGoogleSheets(data: SyncStockData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'no-cors', // Important for Google Apps Script
    });

    // With no-cors mode, we can't read the response, so we assume success if no error thrown
    return {
      success: true,
      message: 'Data synced to Google Sheets successfully!',
    };
  } catch (error) {
    console.error('Google Sheets sync error:', error);
    return {
      success: false,
      message: 'Failed to sync to Google Sheets. Data saved locally.',
    };
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}
