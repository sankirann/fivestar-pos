import { useState, useEffect } from 'react';
import { MenuItem, InventoryItem } from '../../../types';
import { storage } from '../../../utils/storage';

interface EditMenuModalProps {
  item: MenuItem;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
}

const EditMenuModal = ({ item, onClose, onSave }: EditMenuModalProps) => {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<'veg' | 'non-veg' | 'drinks'>(item.category);
  const [price, setPrice] = useState(item.price.toString());
  const [ml, setMl] = useState(item.ml?.toString() || '');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<{ itemId: string; quantity: number }[]>(
    item.inventoryItems || []
  );

  useEffect(() => {
    const savedInventory = storage.getInventory();
    setInventory(savedInventory);
  }, []);

  const handleAddInventoryItem = () => {
    if (inventory.length > 0) {
      setSelectedInventory([...selectedInventory, { itemId: inventory[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveInventoryItem = (index: number) => {
    setSelectedInventory(selectedInventory.filter((_, i) => i !== index));
  };

  const handleInventoryChange = (index: number, field: 'itemId' | 'quantity', value: string | number) => {
    const updated = [...selectedInventory];
    if (field === 'itemId') {
      updated[index].itemId = value as string;
    } else {
      updated[index].quantity = Number(value);
    }
    setSelectedInventory(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !price || Number(price) <= 0) {
      alert('Please fill all required fields correctly');
      return;
    }

    if (category === 'drinks' && (!ml || Number(ml) <= 0)) {
      alert('Please enter valid ML for drinks');
      return;
    }

    const updatedItem: MenuItem = {
      ...item,
      name: name.trim(),
      category,
      price: Number(price),
      inventoryItems: selectedInventory.length > 0 ? selectedInventory : undefined
    };

    if (category === 'drinks' && ml) {
      updatedItem.ml = Number(ml);
    } else {
      delete updatedItem.ml;
    }

    onSave(updatedItem);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Edit Menu Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-2xl text-gray-600"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter item name"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="veg"
                  checked={category === 'veg'}
                  onChange={(e) => setCategory(e.target.value as 'veg')}
                  className="w-5 h-5 text-green-600 cursor-pointer"
                />
                <span className="text-gray-700 font-medium">
                  <i className="ri-leaf-line text-green-600 mr-1"></i>
                  Veg
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="non-veg"
                  checked={category === 'non-veg'}
                  onChange={(e) => setCategory(e.target.value as 'non-veg')}
                  className="w-5 h-5 text-red-600 cursor-pointer"
                />
                <span className="text-gray-700 font-medium">
                  <i className="ri-restaurant-line text-red-600 mr-1"></i>
                  Non-Veg
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="drinks"
                  checked={category === 'drinks'}
                  onChange={(e) => setCategory(e.target.value as 'drinks')}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                />
                <span className="text-gray-700 font-medium">
                  <i className="ri-cup-line text-blue-600 mr-1"></i>
                  Drinks
                </span>
              </label>
            </div>
          </div>

          {/* Price and ML */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>
            {category === 'drinks' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ML (Milliliters) *
                </label>
                <input
                  type="number"
                  value={ml}
                  onChange={(e) => setMl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 330"
                  min="0"
                  required={category === 'drinks'}
                />
              </div>
            )}
          </div>

          {/* Inventory Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Inventory Items (Optional)
              </label>
              <button
                type="button"
                onClick={handleAddInventoryItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap cursor-pointer"
                disabled={inventory.length === 0}
              >
                <i className="ri-add-line mr-1"></i>
                Add Item
              </button>
            </div>

            {inventory.length === 0 && (
              <p className="text-sm text-gray-500 italic">No inventory items available. Add items in Inventory page first.</p>
            )}

            {selectedInventory.map((item, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <select
                  value={item.itemId}
                  onChange={(e) => handleInventoryChange(index, 'itemId', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.stock} {inv.unit})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleInventoryChange(index, 'quantity', e.target.value)}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Qty"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveInventoryItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-xl"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-save-line mr-2"></i>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuModal;
