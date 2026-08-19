import { MenuItem } from '../../../types';

interface MenuGridProps {
  items: MenuItem[];
  onAddItem: (item: MenuItem) => void;
}

const MenuGrid = ({ items, onAddItem }: MenuGridProps) => {
  const formatVolume = (ml: number) => {
    if (ml >= 1000) {
      const liters = ml / 1000;
      return `${ml} ml (${liters}L)`;
    }
    return `${ml} ml`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onAddItem(item)}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-500 overflow-hidden group"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 flex-1">
                {item.name}
              </h3>
              {item.category === 'veg' && (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                  <i className="ri-leaf-fill text-green-600 text-lg"></i>
                </div>
              )}
              {item.category === 'non-veg' && (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                  <i className="ri-restaurant-fill text-red-600 text-lg"></i>
                </div>
              )}
              {item.category === 'drinks' && (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                  <i className="ri-cup-fill text-blue-600 text-lg"></i>
                </div>
              )}
            </div>
            
            {item.ml && (
              <div className="text-xs text-gray-500 mb-2">
                <i className="ri-drop-line mr-1"></i>
                {formatVolume(item.ml)}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <i className="ri-add-line text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuGrid;
