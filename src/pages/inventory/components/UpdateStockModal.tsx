import { useState } from 'react';
import { InventoryItem } from '../../../types';

interface UpdateStockModalProps {
  item: InventoryItem;
  onClose: () => void;
  onUpdate: (itemId: string, newStock: number) => void;
}

const UpdateStockModal = ({ item, onClose, onUpdate }: UpdateStockModalProps) => {
  const [stock, setStock] = useState(item.stock.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stockNum = parseFloat(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }
    
    onUpdate(item.id, stockNum);
  };

  return (
    <div className="fixed inset-0 bg-black bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Update Stock</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Item</div>
          <div className="text-lg font-semibold text-gray-800">{item.name}</div>
          <div className="text-sm text-gray-600 mt-2">
            Current Stock Set: <span className="font-semibold text-blue-600">{item.stockSet || 0} {item.unit}</span>
          </div>
          <div className="text-sm text-gray-600">
            Current Stock: <span className="font-semibold text-gray-800">{item.stock} {item.unit}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Stock Quantity
              <span className="text-xs text-gray-500 ml-2">(Updates both Stock Set and Current Stock)</span>
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              autoFocus
            />
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
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-check-line mr-2"></i>
              Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStockModal;
