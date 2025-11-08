import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';

export default function Items() {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const items = useLiveQuery(() => db.items.orderBy('createdAt').reverse().toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    try {
      await db.items.add({
        name: itemName,
        description: itemDescription,
        createdAt: new Date(),
      });

      setItemName('');
      setItemDescription('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await db.items.delete(id);
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item. Please try again.');
      }
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {!items || items.length === 0 ? (
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
