import { useState, useEffect } from 'react';
import { fetchItems, createItem, deleteItem, updateItem, type Item } from '@/utils/supabase';

export default function Items() {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    const data = await fetchItems();
    setItems(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    try {
      const result = await createItem(itemName, itemDescription || undefined);

      if (result.success) {
        setItemName('');
        setItemDescription('');
        setIsAdding(false);
        alert('Item added successfully!');
        await loadItems();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const result = await deleteItem(id);
        if (result.success) {
          alert('Item deleted successfully!');
          await loadItems();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDescription(item.description || '');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditDescription('');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      alert('Please enter an item name');
      return;
    }

    try {
      const result = await updateItem(editingItem!.id, editName, editDescription || undefined);
      if (result.success) {
        alert('Item updated successfully!');
        handleCancelEdit();
        await loadItems();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Items</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isAdding ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Item</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item name"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="itemDescription"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item description (optional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item description (optional)"
                    rows={3}
                  />
                </div>
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
            <p className="mt-2">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No items yet. Add your first item to get started!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
