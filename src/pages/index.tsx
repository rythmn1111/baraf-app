import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchItems, fetchVendors, createStockEntry, type Item, type Vendor } from '@/utils/supabase';

interface LineItem {
  id: string;
  itemId: number | '';
  quantity: string;
  purchasePrice: string;
}

export default function Home() {
  const [selectedVendorId, setSelectedVendorId] = useState<number | ''>('');
  const [invoice, setInvoice] = useState('');
  const [stockDate, setStockDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), itemId: '', quantity: '1', purchasePrice: '' }
  ]);
  const [items, setItems] = useState<Item[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [itemsData, vendorsData] = await Promise.all([
      fetchItems(),
      fetchVendors()
    ]);
    setItems(itemsData);
    setVendors(vendorsData);
    setIsLoading(false);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: crypto.randomUUID(), itemId: '', quantity: '1', purchasePrice: '' }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, line) => {
      const qty = parseInt(line.quantity) || 0;
      const price = parseFloat(line.purchasePrice) || 0;
      return sum + (qty * price);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!selectedVendorId || !invoice) {
      alert('Please fill in vendor and invoice details');
      return;
    }

    const validLineItems = lineItems.filter(line =>
      line.itemId && line.quantity && line.purchasePrice
    );

    if (validLineItems.length === 0) {
      alert('Please add at least one item with quantity and price');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create multiple stock entries
      const promises = validLineItems.map(line =>
        createStockEntry({
          item_id: Number(line.itemId),
          vendor_id: Number(selectedVendorId),
          purchase_price: parseFloat(line.purchasePrice),
          quantity: parseInt(line.quantity),
          invoice: invoice,
          stock_date: stockDate,
        })
      );

      const results = await Promise.all(promises);
      const failedEntries = results.filter(r => !r.success);

      if (failedEntries.length === 0) {
        // Reset form
        setSelectedVendorId('');
        setInvoice('');
        setStockDate(new Date().toISOString().split('T')[0]);
        setLineItems([{ id: crypto.randomUUID(), itemId: '', quantity: '1', purchasePrice: '' }]);

        alert(`Successfully added ${results.length} stock ${results.length === 1 ? 'entry' : 'entries'}!`);
      } else {
        alert(`Added ${results.length - failedEntries.length} entries. ${failedEntries.length} failed.`);
      }
    } catch (error) {
      console.error('Failed to add stock entries:', error);
      alert('Failed to add stock entries. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemName = (itemId: number | '') => {
    if (!itemId) return '';
    const item = items.find(i => i.id === itemId);
    return item?.name || '';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Incoming Stock</h1>
      </div>

      {isLoading ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to add items first before recording incoming stock.
            </p>
            <div className="mt-6">
              <Link
                href="/items"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Items
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Stock Entry</h2>
          <form onSubmit={handleSubmit}>
            {/* Common Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6 pb-6 border-b">
              <div>
                <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vendor *
                </label>
                <select
                  id="vendor"
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a vendor...</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                {vendors.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    No vendors found. <Link href="/vendors" className="text-blue-600 hover:underline">Add a vendor first</Link>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="invoice" className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  id="invoice"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter invoice number"
                  required
                />
              </div>

              <div>
                <label htmlFor="stockDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Date *
                </label>
                <input
                  type="date"
                  id="stockDate"
                  value={stockDate}
                  onChange={(e) => setStockDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Items</h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + Add Another Item
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((line, index) => (
                  <div key={line.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Item *
                      </label>
                      <select
                        value={line.itemId}
                        onChange={(e) => updateLineItem(line.id, 'itemId', e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      >
                        <option value="">Choose an item...</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => updateLineItem(line.id, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        min="1"
                        required
                      />
                    </div>

                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={line.purchasePrice}
                        onChange={(e) => updateLineItem(line.id, 'purchasePrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {line.quantity && line.purchasePrice && (
                      <div className="w-32 pt-6">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{(parseFloat(line.purchasePrice) * parseInt(line.quantity)).toFixed(2)}
                        </div>
                      </div>
                    )}

                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(line.id)}
                        className="mt-6 text-red-600 hover:text-red-900"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            {calculateTotal() > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Grand Total:</span>
                  <span className="text-2xl font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Stock Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
