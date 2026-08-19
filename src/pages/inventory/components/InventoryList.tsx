import { InventoryItem } from '../../../types';

interface InventoryListProps {
  inventory: InventoryItem[];
  onUpdateStock: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
}

const InventoryList = ({ inventory, onUpdateStock, onDeleteItem }: InventoryListProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Items</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Stock Set</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Current Stock</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Unit</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No inventory items found. Add your first item to get started.
                </td>
              </tr>
            ) : (
              inventory.map(item => {
                let statusColor = 'bg-green-100 text-green-700';
                let statusText = 'In Stock';
                let statusIcon = 'ri-checkbox-circle-line';
                
                if (item.stock === 0) {
                  statusColor = 'bg-red-100 text-red-700';
                  statusText = 'Out of Stock';
                  statusIcon = 'ri-close-circle-line';
                } else if (item.stock < 20) {
                  statusColor = 'bg-yellow-100 text-yellow-700';
                  statusText = 'Low Stock';
                  statusIcon = 'ri-alert-line';
                }
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 text-center font-semibold">
                      {item.stockSet || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-center font-semibold">
                      {item.stock}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.unit}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        <i className={statusIcon}></i>
                        {statusText}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onUpdateStock(item)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer whitespace-nowrap text-sm"
                        >
                          <i className="ri-edit-line mr-1"></i>
                          Update
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap text-sm"
                        >
                          <i className="ri-delete-bin-line mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
