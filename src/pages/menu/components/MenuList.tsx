
import { MenuItem } from '../../../types';

interface MenuListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

const MenuList = ({ items, onEdit, onDelete }: MenuListProps) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'veg':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-300">
            <i className="ri-leaf-line mr-1"></i>
            Veg
          </span>
        );
      case 'non-veg':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-300">
            <i className="ri-restaurant-line mr-1"></i>
            Non-Veg
          </span>
        );
      case 'drinks':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-300">
            <i className="ri-cup-line mr-1"></i>
            Drinks
          </span>
        );
      default:
        return null;
    }
  };

  const formatVolume = (ml: number) => {
    if (ml >= 1000) {
      const liters = ml / 1000;
      return `${ml} ml (${liters}L)`;
    }
    return `${ml} ml`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Item Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Inventory Items</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  {item.ml && (
                    <div className="text-xs text-gray-500 mt-1">
                      <i className="ri-drop-line mr-1"></i>
                      {formatVolume(item.ml)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getCategoryBadge(item.category)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                </td>
                <td className="px-6 py-4">
                  {item.inventoryItems && item.inventoryItems.length > 0 ? (
                    <span className="text-sm text-gray-600">
                      {item.inventoryItems.length} item(s)
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">None</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <i className="ri-edit-line text-lg"></i>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuList;
