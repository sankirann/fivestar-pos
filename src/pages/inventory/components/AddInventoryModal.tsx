import { useState } from 'react';

interface AddInventoryModalProps {
  onClose: () => void;
  onAdd: (name: string, stock: number, unit: string) => void;
}

const AddInventoryModal = ({ onClose, onAdd }: AddInventoryModalProps) => {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('0');
  const [unit, setUnit] = useState('pieces');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter item name');
      return;
    }
    
    const stockNum = parseFloat(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }
    
    onAdd(name.trim(), stockNum, unit);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Inventory Item</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chicken Breast"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
              <span className="text-xs text-gray-500 ml-2">(Sets both Stock Set and Current Stock)</span>
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="pieces">Pieces</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="grams">Grams (g)</option>
              <option value="liters">Liters (L)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="portions">Portions</option>
              <option value="packets">Packets</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
