import { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { storage } from '../../utils/storage';
import MenuList from './components/MenuList';
import AddMenuModal from './components/AddMenuModal';
import EditMenuModal from './components/EditMenuModal';
import UserMenu from '../../components/UserMenu';

const MenuPage = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'veg' | 'non-veg' | 'drinks'>('all');

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = () => {
    const savedMenu = storage.getMenu();
    setMenu(savedMenu);
  };

  const filteredMenu = selectedCategory === 'all' 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  const handleAddItem = (newItem: Omit<MenuItem, 'id'>) => {
    const id = `m${Date.now()}`;
    const menuItem: MenuItem = { ...newItem, id };
    const updatedMenu = [...menu, menuItem];
    storage.saveMenu(updatedMenu);
    setMenu(updatedMenu);
    setShowAddModal(false);
  };

  const handleEditItem = (updatedItem: MenuItem) => {
    const updatedMenu = menu.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    storage.saveMenu(updatedMenu);
    setMenu(updatedMenu);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedMenu = menu.filter(item => item.id !== itemId);
      storage.saveMenu(updatedMenu);
      setMenu(updatedMenu);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
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
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Menu Management</h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">Add, Edit & Delete Menu Items</p>
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
              <button
                onClick={() => setShowAddModal(true)}
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-sm md:text-base"
              >
                <i className="ri-add-line mr-2"></i>
                Add New Item
              </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex gap-2 md:gap-3 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items ({menu.length})
            </button>
            <button
              onClick={() => setSelectedCategory('veg')}
              className={`shrink-0 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                selectedCategory === 'veg'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="ri-leaf-line mr-2"></i>
              Veg ({menu.filter(i => i.category === 'veg').length})
            </button>
            <button
              onClick={() => setSelectedCategory('non-veg')}
              className={`shrink-0 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                selectedCategory === 'non-veg'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="ri-restaurant-line mr-2"></i>
              Non-Veg ({menu.filter(i => i.category === 'non-veg').length})
            </button>
            <button
              onClick={() => setSelectedCategory('drinks')}
              className={`shrink-0 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                selectedCategory === 'drinks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className="ri-cup-line mr-2"></i>
              Drinks ({menu.filter(i => i.category === 'drinks').length})
            </button>
          </div>
        </div>

        {/* Menu List */}
        <MenuList
          items={filteredMenu}
          onEdit={setEditingItem}
          onDelete={handleDeleteItem}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMenuModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}

      {editingItem && (
        <EditMenuModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleEditItem}
        />
      )}
    </div>
  );
};

export default MenuPage;
