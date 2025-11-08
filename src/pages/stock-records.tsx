import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';

export default function StockRecords() {
  const [searchTerm, setSearchTerm] = useState('');

  const stockEntries = useLiveQuery(() =>
    db.stockEntries.orderBy('createdAt').reverse().toArray()
  );

  const filteredEntries = useMemo(() => {
    if (!stockEntries) return [];
    if (!searchTerm.trim()) return stockEntries;

    const search = searchTerm.toLowerCase();
    return stockEntries.filter(
      (entry) =>
        entry.itemName.toLowerCase().includes(search) ||
        entry.invoice.toLowerCase().includes(search)
    );
  }, [stockEntries, searchTerm]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this stock entry?')) {
      try {
        await db.stockEntries.delete(id);
      } catch (error) {
        console.error('Failed to delete stock entry:', error);
        alert('Failed to delete stock entry. Please try again.');
      }
    }
  };

  const handleDownloadInvoice = (entry: typeof filteredEntries[0]) => {
    if (!entry.invoiceFile) return;

    const link = document.createElement('a');
    link.href = entry.invoiceFile.data;
    link.download = entry.invoiceFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewInvoice = (entry: typeof filteredEntries[0]) => {
    if (!entry.invoiceFile) return;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${entry.invoiceFile.name}</title>
            <style>
              body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; }
              img { max-width: 100%; height: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              embed { width: 100%; height: 100vh; }
            </style>
          </head>
          <body>
            ${entry.invoiceFile.type.startsWith('image/')
              ? `<img src="${entry.invoiceFile.data}" alt="${entry.invoiceFile.name}" />`
              : `<embed src="${entry.invoiceFile.data}" type="${entry.invoiceFile.type}" />`
            }
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const totalValue = filteredEntries.reduce(
    (sum, entry) => sum + entry.purchasePrice * entry.quantity,
    0
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Stock Records</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                placeholder="Search by item name or invoice number..."
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
          </div>
        </div>
      </div>

      {filteredEntries.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Value of Displayed Entries:</span>
            <span className="text-2xl font-bold text-green-600">₹{totalValue.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {!stockEntries || stockEntries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No stock entries yet. Add your first stock entry to get started!
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No entries match your search. Try a different search term.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.itemName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.invoice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.invoiceFile ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewInvoice(entry)}
                            className="text-blue-600 hover:text-blue-900 underline"
                          >
                            View
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDownloadInvoice(entry)}
                            className="text-green-600 hover:text-green-900 underline"
                          >
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{entry.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{(entry.purchasePrice * entry.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(entry.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
