
import { useEffect, useState } from 'react';
import { storage } from '../../../utils/storage';
import { Bill, InventoryItem } from '../../../types';
import { getCashAmount, getUpiAmount } from '../../../utils/paymentUtils';
import ExportButtons from './ExportButtons';

interface InventorySummaryProps {
  bills?: Bill[];
}

const InventorySummary = ({ bills = [] }: InventorySummaryProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = storage.getInventory();
      if (!Array.isArray(items)) {
        throw new Error('Invalid inventory data received');
      }
      setInventory(items);
    } catch (err) {
      setError('Failed to load inventory data');
      console.error('Error loading inventory:', err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = inventory.filter(item => item.stock < 20);
  const outOfStockItems = inventory.filter(item => item.stock === 0);

  const cashCollected = bills.reduce((sum, bill) => sum + getCashAmount(bill), 0);
  const upiCollected = bills.reduce((sum, bill) => sum + getUpiAmount(bill), 0);
  const totalCollected = cashCollected + upiCollected;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Summary</h2>

      <ExportButtons
        title="Inventory Summary"
        filename="inventory-summary"
        headers={['Item', 'Stock', 'Unit', 'Reorder Level', 'Status']}
        rows={inventory.map(item => [
          item.name,
          item.stock,
          item.unit,
          item.stockSet,
          item.stock === 0 ? 'Out of Stock' : item.stock < 20 ? 'Low Stock' : 'OK'
        ])}
      />

      {/* Collections Summary (All-time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-wallet-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">Cash Collected</p>
          <p className="text-3xl font-bold">₹{cashCollected.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-smartphone-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">UPI Collected</p>
          <p className="text-3xl font-bold">₹{upiCollected.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-bank-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Collected</p>
          <p className="text-3xl font-bold">₹{totalCollected.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <i className="ri-alert-line text-white text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-yellow-700">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-800">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <i className="ri-close-circle-line text-white text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-red-700">Out of Stock</p>
              <p className="text-2xl font-bold text-red-800">{outOfStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Current Stock</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Unit</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map(item => {
              let statusColor = 'bg-green-100 text-green-700';
              let statusText = 'In Stock';
              
              if (item.stock === 0) {
                statusColor = 'bg-red-100 text-red-700';
                statusText = 'Out of Stock';
              } else if (item.stock < 20) {
                statusColor = 'bg-yellow-100 text-yellow-700';
                statusText = 'Low Stock';
              }
              
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 text-center font-semibold">
                    {item.stock}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {statusText}
                    </span>
                  </td>
                </tr>
              );
            })}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventorySummary;
