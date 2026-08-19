import { BillItem, RestaurantTable } from '../../../types';

interface BillSectionProps {
  items: BillItem[];
  subtotal: number;
  total: number;
  withGST: boolean;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onClearBill: () => void;
  onToggleGST: () => void;
  onProceedPayment: () => void;
  tables?: RestaurantTable[];
  selectedTableId?: string;
  onSelectTable?: (tableId: string) => void;
}

const BillSection = ({
  items,
  subtotal,
  total,
  withGST,
  onUpdateQuantity,
  onRemoveItem,
  onClearBill,
  onToggleGST,
  onProceedPayment,
  tables,
  selectedTableId,
  onSelectTable
}: BillSectionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Current Bill</h2>
        {items.length > 0 && (
          <button
            onClick={onClearBill}
            className="text-red-600 hover:text-red-700 text-sm md:text-base cursor-pointer whitespace-nowrap"
          >
            <i className="ri-delete-bin-line mr-1"></i> Clear
          </button>
        )}
      </div>

      {tables && onSelectTable && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            <i className="ri-table-line mr-1"></i>
            Table
          </label>
          <select
            value={selectedTableId || ''}
            onChange={e => onSelectTable(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none text-sm"
          >
            <option value="">Takeaway / No Table</option>
            {tables.map(table => (
              <option
                key={table.id}
                value={table.id}
                disabled={table.status === 'occupied' && table.id !== selectedTableId}
              >
                {table.name} {table.status === 'occupied' && table.id !== selectedTableId ? '(Occupied)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <i className="ri-shopping-cart-line text-5xl md:text-6xl text-gray-300 mb-3 md:mb-4"></i>
          <p className="text-gray-500 text-sm md:text-base">No items added yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 max-h-[280px] md:max-h-[320px] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.menuItem.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
                <div className="flex justify-between items-start mb-2 md:mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base flex-1 pr-2">
                    {item.menuItem.name}
                  </h3>
                  <button
                    onClick={() => onRemoveItem(item.menuItem.id)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <i className="ri-close-line text-lg md:text-xl"></i>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3 bg-white rounded-lg p-1 md:p-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                      className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded cursor-pointer text-sm md:text-base"
                    >
                      <i className="ri-subtract-line"></i>
                    </button>
                    <span className="w-8 md:w-10 text-center font-semibold text-sm md:text-base">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                      className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white rounded cursor-pointer text-sm md:text-base"
                    >
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                  <span className="font-bold text-orange-600 text-base md:text-lg">
                    ₹{item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-gray-200 pt-4 md:pt-6 space-y-2 md:space-y-3">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withGST}
                  onChange={onToggleGST}
                  className="w-4 h-4 md:w-5 md:h-5 text-orange-600 cursor-pointer"
                />
                <span className="text-sm md:text-base text-gray-700">Include GST (5%)</span>
              </label>
            </div>

            {withGST ? (
              <>
                <div className="flex justify-between text-sm md:text-base text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base text-gray-700">
                  <span>GST (5%):</span>
                  <span className="font-semibold">₹{(subtotal * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg md:text-xl font-bold text-gray-900 pt-2 md:pt-3 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-orange-600">₹{total.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-lg md:text-xl font-bold text-gray-900 pt-2 md:pt-3">
                <span>Total:</span>
                <span className="text-orange-600">₹{total.toFixed(2)}</span>
              </div>
            )}
          </div>

          <button
            onClick={onProceedPayment}
            className="w-full mt-4 md:mt-6 bg-orange-600 hover:bg-orange-700 text-white py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-money-rupee-circle-line mr-2"></i>
            Proceed to Payment
          </button>
        </>
      )}
    </div>
  );
};

export default BillSection;
