import { useState, useEffect } from 'react';
import { fetchVendors, createVendor, deleteVendor, updateVendor, type Vendor } from '@/utils/supabase';

export default function Vendors() {
  const [vendorName, setVendorName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editName, setEditName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setIsLoading(true);
    const data = await fetchVendors();
    setVendors(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    try {
      const result = await createVendor({
        name: vendorName,
        contactPerson: contactPerson || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
      });

      if (result.success) {
        setVendorName('');
        setContactPerson('');
        setPhone('');
        setEmail('');
        setAddress('');
        setIsAdding(false);
        alert('Vendor added successfully!');
        await loadVendors();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to add vendor:', error);
      alert('Failed to add vendor. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        const result = await deleteVendor(id);
        if (result.success) {
          alert('Vendor deleted successfully!');
          await loadVendors();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Failed to delete vendor:', error);
        alert('Failed to delete vendor. Please try again.');
      }
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditName(vendor.name);
    setEditContactPerson(vendor.contactPerson || '');
    setEditPhone(vendor.phone || '');
    setEditEmail(vendor.email || '');
    setEditAddress(vendor.address || '');
  };

  const handleCancelEdit = () => {
    setEditingVendor(null);
    setEditName('');
    setEditContactPerson('');
    setEditPhone('');
    setEditEmail('');
    setEditAddress('');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      alert('Please enter a vendor name');
      return;
    }

    try {
      const result = await updateVendor(editingVendor!.id, {
        name: editName,
        contactPerson: editContactPerson || undefined,
        phone: editPhone || undefined,
        email: editEmail || undefined,
        address: editAddress || undefined,
      });

      if (result.success) {
        alert('Vendor updated successfully!');
        handleCancelEdit();
        await loadVendors();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to update vendor:', error);
      alert('Failed to update vendor. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isAdding ? 'Cancel' : 'Add New Vendor'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Vendor</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  id="vendorName"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter vendor name"
                  required
                />
              </div>
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter vendor address (optional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Vendor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Vendor</h2>
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Name *
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={editContactPerson}
                      onChange={(e) => setEditContactPerson(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter contact person name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vendor address (optional)"
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
            <p className="mt-2">Loading vendors...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No vendors yet. Add your first vendor to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
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
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.contactPerson || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vendor.address || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id!)}
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
