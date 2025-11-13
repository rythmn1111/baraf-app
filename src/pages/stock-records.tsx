import { useState, useMemo, useEffect } from 'react';
import { fetchStockEntries, deleteStockEntry, updateStockEntry, fetchItems, fetchVendors, type Item, type Vendor } from '@/utils/supabase';
import SearchableSelect from '@/components/SearchableSelect';

const UNITS = ['kg', 'g', 'liter', 'ml', 'pieces', 'dozens', 'boxes'];

export default function StockRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockEntries, setStockEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Edit form state
  const [editItemId, setEditItemId] = useState<number | ''>('');
  const [editVendorId, setEditVendorId] = useState<number | ''>('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('kg');
  const [editPrice, setEditPrice] = useState('');
  const [editInvoice, setEditInvoice] = useState('');
  const [editStockDate, setEditStockDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [entriesData, itemsData, vendorsData] = await Promise.all([
      fetchStockEntries(),
      fetchItems(),
      fetchVendors()
    ]);
    setStockEntries(entriesData);
    setItems(itemsData);
    setVendors(vendorsData);
    setIsLoading(false);
  };

  const filteredEntries = useMemo(() => {
    if (!stockEntries) return [];
    if (!searchTerm.trim()) return stockEntries;

    const search = searchTerm.toLowerCase();
    return stockEntries.filter(
      (entry) =>
        entry.itemName.toLowerCase().includes(search) ||
        entry.invoice.toLowerCase().includes(search) ||
        (entry.vendorName && entry.vendorName.toLowerCase().includes(search))
    );
  }, [stockEntries, searchTerm]);

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setEditItemId(entry.itemId);
    setEditVendorId(entry.vendorId);
    setEditQuantity(entry.quantity.toString());
    setEditUnit(entry.unit || 'kg');
    setEditPrice(entry.purchasePrice.toString());
    setEditInvoice(entry.invoice);
    setEditStockDate(entry.createdAt.split('T')[0]);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditItemId('');
    setEditVendorId('');
    setEditQuantity('');
    setEditUnit('kg');
    setEditPrice('');
    setEditInvoice('');
    setEditStockDate('');
  };

  const handleSaveEdit = async () => {
    if (!editItemId || !editVendorId || !editQuantity || !editPrice || !editInvoice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const result = await updateStockEntry(editingEntry.id, {
        item_id: Number(editItemId),
        vendor_id: Number(editVendorId),
        quantity: parseFloat(editQuantity),
        unit: editUnit,
        purchase_price: parseFloat(editPrice),
        invoice: editInvoice,
        stock_date: editStockDate,
      });

      if (result.success) {
        alert('Stock entry updated successfully!');
        handleCancelEdit();
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to update stock entry:', error);
      alert('Failed to update stock entry. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this stock entry?')) {
      try {
        const result = await deleteStockEntry(id);
        if (result.success) {
          alert('Stock entry deleted successfully!');
          await loadData();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Failed to delete stock entry:', error);
        alert('Failed to delete stock entry. Please try again.');
      }
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
                placeholder="Search by item, vendor, or invoice number..."
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

      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Stock Entry</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <SearchableSelect
                  options={items.map(i => ({ id: i.id, name: i.name }))}
                  value={editItemId}
                  onChange={setEditItemId}
                  label="Item"
                  placeholder="Search items..."
                  required
                />

                <SearchableSelect
                  options={vendors.map(v => ({ id: v.id, name: v.name }))}
                  value={editVendorId}
                  onChange={setEditVendorId}
                  label="Vendor"
                  placeholder="Search vendors..."
                  required
                />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    value={editInvoice}
                    onChange={(e) => setEditInvoice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Date *
                  </label>
                  <input
                    type="date"
                    value={editStockDate}
                    onChange={(e) => setEditStockDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {editQuantity && editPrice && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{(parseFloat(editPrice) * parseInt(editQuantity)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2">Loading stock entries...</p>
          </div>
        ) : stockEntries.length === 0 ? (
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
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
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
                      {entry.vendorName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.invoice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.unit || 'kg'}
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
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
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
