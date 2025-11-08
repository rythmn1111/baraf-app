import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import Link from 'next/link';

export default function IncomingStock() {
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [invoice, setInvoice] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const items = useLiveQuery(() => db.items.toArray());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or image file (JPEG, PNG, HEIC)');
        e.target.value = '';
        return;
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setInvoiceFile(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !purchasePrice || !invoice || !quantity) return;

    const selectedItem = items?.find(item => item.id === selectedItemId);
    if (!selectedItem) return;

    try {
      let invoiceFileData = undefined;

      if (invoiceFile) {
        const base64Data = await fileToBase64(invoiceFile);
        invoiceFileData = {
          name: invoiceFile.name,
          type: invoiceFile.type,
          data: base64Data,
        };
      }

      await db.stockEntries.add({
        itemId: Number(selectedItemId),
        itemName: selectedItem.name,
        purchasePrice: parseFloat(purchasePrice),
        quantity: parseInt(quantity),
        invoice: invoice,
        invoiceFile: invoiceFileData,
        createdAt: new Date(),
      });

      setSelectedItemId('');
      setPurchasePrice('');
      setQuantity('1');
      setInvoice('');
      setInvoiceFile(null);
      // Reset file input
      const fileInput = document.getElementById('invoiceFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      alert('Stock entry added successfully!');
    } catch (error) {
      console.error('Failed to add stock entry:', error);
      alert('Failed to add stock entry. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Incoming Stock</h1>

      {!items || items.length === 0 ? (
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Item *
                </label>
                <select
                  id="item"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label htmlFor="invoiceFile" className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice File (PDF/Photo)
                </label>
                <input
                  type="file"
                  id="invoiceFile"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,image/*,application/pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {invoiceFile && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected: {invoiceFile.name} ({(invoiceFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price (per unit) *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {selectedItemId && purchasePrice && quantity && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Total Value:</span> ₹
                  {(parseFloat(purchasePrice) * parseInt(quantity || '0')).toFixed(2)}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Stock Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
