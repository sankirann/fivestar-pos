interface CategoryTabsProps {
  selectedCategory: 'all' | 'veg' | 'non-veg' | 'drinks';
  onSelectCategory: (category: 'all' | 'veg' | 'non-veg' | 'drinks') => void;
}

const CategoryTabs = ({ selectedCategory, onSelectCategory }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base cursor-pointer ${
          selectedCategory === 'all'
            ? 'bg-orange-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <i className="ri-apps-line mr-1 md:mr-2"></i>
        All Items
      </button>
      <button
        onClick={() => onSelectCategory('veg')}
        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base cursor-pointer ${
          selectedCategory === 'veg'
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <i className="ri-leaf-line mr-1 md:mr-2"></i>
        Veg
      </button>
      <button
        onClick={() => onSelectCategory('non-veg')}
        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base cursor-pointer ${
          selectedCategory === 'non-veg'
            ? 'bg-red-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <i className="ri-restaurant-line mr-1 md:mr-2"></i>
        Non-Veg
      </button>
      <button
        onClick={() => onSelectCategory('drinks')}
        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base cursor-pointer ${
          selectedCategory === 'drinks'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <i className="ri-cup-line mr-1 md:mr-2"></i>
        Drinks
      </button>
    </div>
  );
};

export default CategoryTabs;
