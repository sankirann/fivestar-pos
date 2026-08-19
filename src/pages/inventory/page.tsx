import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { InventoryItem } from '../../types';
import InventoryList from './components/InventoryList';
import AddInventoryModal from './components/AddInventoryModal';
import UpdateStockModal from './components/UpdateStockModal';
import UserMenu from '../../components/UserMenu';

const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    try {
      const items = storage.getInventory();
      setInventory(items);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      // Set empty array as fallback
      setInventory([]);
    }
  };

  const handleAddItem = (name: string, stock: number, unit: string) => {
    if (!name || stock < 0 || !unit) {
      alert('Please fill in all fields with valid values');
      return;
    }

    try {
      const newItem: InventoryItem = {
        id: `i${Date.now()}`,
        name: name.trim(),
        stock,
        stockSet: stock, // Set stockSet to the same value as initial stock
        unit: unit.trim()
      };
      
      const updatedInventory = [...inventory, newItem];
      storage.saveInventory(updatedInventory);
      setInventory(updatedInventory);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleUpdateStock = (itemId: string, newStock: number) => {
    if (newStock < 0) {
      alert('Stock cannot be negative');
      return;
    }

    try {
      const updatedInventory = inventory.map(item =>
        item.id === itemId ? { ...item, stock: newStock, stockSet: newStock } : item
      );
      storage.saveInventory(updatedInventory);
      setInventory(updatedInventory);
      setShowUpdateModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock. Please try again.');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const updatedInventory = inventory.filter(item => item.id !== itemId);
        storage.saveInventory(updatedInventory);
        setInventory(updatedInventory);
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const openUpdateModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowUpdateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <img 
                src="https://static.readdy.ai/image/b16a36712d4489a09c619c16397ad1bd/eecd6a122e7383b98d5c713792cdcbed.jpeg" 
                alt="Five Star Chicken" 
                className="w-10 h-10 md:w-16 md:h-16 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Inventory Management</h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">Manage your stock and ingredients</p>
              </div>
            </div>
            <div className="shrink-0">
              <UserMenu />
            </div>
          </div>
          <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 scrollbar-hide">
              <a 
                href="/" 
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Billing
              </a>
              <a 
                href="/reports" 
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base"
              >
                <i className="ri-file-chart-line mr-2"></i>
                Reports
              </a>
          </div>
        </div>

        {/* Add Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Add New Item
          </button>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <InventoryList
            inventory={inventory}
            onUpdateStock={openUpdateModal}
            onDeleteItem={handleDeleteItem}
          />
        </div>
      </div>

      {showAddModal && (
        <AddInventoryModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}

      {showUpdateModal && selectedItem && (
        <UpdateStockModal
          item={selectedItem}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedItem(null);
          }}
          onUpdate={handleUpdateStock}
        />
      )}
    </div>
  );
};

export default InventoryPage;
