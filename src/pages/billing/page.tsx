import { useState, useEffect } from 'react';
import { MenuItem, BillItem, Bill, RestaurantTable, KitchenOrder } from '../../types';
import { storage } from '../../utils/storage';
import { printBill } from '../../utils/print';
import { printBillViaBluetooth } from '../../utils/bluetoothPrint';
import { initialMenu, initialInventory } from '../../data/initialData';
import { tableStorage } from '../../utils/tableStorage';
import { kitchenStorage } from '../../utils/kitchenStorage';
import CategoryTabs from './components/CategoryTabs';
import MenuGrid from './components/MenuGrid';
import BillSection from './components/BillSection';
import PaymentModal from './components/PaymentModal';
import UserMenu from '../../components/UserMenu';
import { useAuth } from '../../contexts/AuthContext';

const BillingPage = () => {
  const { hasPermission } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'veg' | 'non-veg' | 'drinks'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [withGST, setWithGST] = useState(true);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  useEffect(() => {
    if (hasPermission('tables')) {
      setTables(tableStorage.getTables());
    }
  }, [hasPermission]);

  const handleSelectTable = (tableId: string) => {
    // Free the previously selected table (if any) before occupying the new one.
    if (selectedTableId) {
      tableStorage.freeTable(selectedTableId);
    }
    if (tableId) {
      tableStorage.occupyTable(tableId);
    }
    setSelectedTableId(tableId);
    setTables(tableStorage.getTables());
  };

  useEffect(() => {
    // Initialize menu if not exists
    let savedMenu = storage.getMenu();
    if (savedMenu.length === 0) {
      storage.saveMenu(initialMenu);
      savedMenu = initialMenu;
    }
    setMenu(savedMenu);

    // Initialize inventory if not exists
    const savedInventory = storage.getInventory();
    if (savedInventory.length === 0) {
      storage.saveInventory(initialInventory);
    }
  }, []);

  const filteredMenu = menu
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addToBill = (menuItem: MenuItem) => {
    // Check inventory availability
    if (menuItem.inventoryItems) {
      const inventory = storage.getInventory();
      for (const usage of menuItem.inventoryItems) {
        const inventoryItem = inventory.find(i => i.id === usage.itemId);
        if (!inventoryItem || inventoryItem.stock < usage.quantity) {
          alert(`Cannot add ${menuItem.name}. Insufficient inventory stock.`);
          return;
        }
      }
    }

    const existingItem = billItems.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1, price: (item.quantity + 1) * menuItem.price }
          : item
      ));
    } else {
      setBillItems([...billItems, { menuItem, quantity: 1, price: menuItem.price }]);
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setBillItems(billItems.filter(item => item.menuItem.id !== menuItemId));
    } else {
      setBillItems(billItems.map(item =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity, price: quantity * item.menuItem.price }
          : item
      ));
    }
  };

  const removeItem = (menuItemId: string) => {
    setBillItems(billItems.filter(item => item.menuItem.id !== menuItemId));
  };

  const clearBill = () => {
    setBillItems([]);
    if (selectedTableId) {
      tableStorage.freeTable(selectedTableId);
      setSelectedTableId('');
      setTables(tableStorage.getTables());
    }
  };

  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (withGST) {
      return subtotal * 1.05; // 5% GST
    }
    return subtotal;
  };

  const handlePayment = async (
    customerPaid: number,
    paperSize: '2inch' | '3inch',
    paymentMethod: 'cash' | 'upi' | 'split',
    printVia: 'browser' | 'bluetooth' = 'browser',
    splitPayment?: { cash: number; upi: number }
  ) => {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    const change = paymentMethod === 'cash' ? customerPaid - total : 0;

    if (paymentMethod === 'cash' && change < 0) {
      alert('Insufficient payment amount');
      return;
    }

    // Defense in depth: PaymentModal already enforces this, but never trust
    // a single layer for money math. No overpayment, no incomplete split.
    if (paymentMethod === 'split') {
      const cashAmt = splitPayment?.cash ?? 0;
      const upiAmt = splitPayment?.upi ?? 0;
      const roundedSum = Math.round((cashAmt + upiAmt) * 100) / 100;
      const roundedTotal = Math.round(total * 100) / 100;
      if (cashAmt < 0 || upiAmt < 0 || roundedSum !== roundedTotal) {
        alert('Cash Amount + UPI Amount must exactly equal the bill total.');
        return;
      }
    }

    // Update inventory
    billItems.forEach(billItem => {
      if (billItem.menuItem.inventoryItems) {
        billItem.menuItem.inventoryItems.forEach(usage => {
          storage.updateInventoryStock(usage.itemId, usage.quantity * billItem.quantity);
        });
      }
    });

    const bill: Bill = {
      id: storage.getNextInvoiceNumber(),
      orderNo: storage.getNextOrderNumber(),
      items: billItems,
      subtotal,
      gst: withGST ? subtotal * 0.05 : 0,
      total,
      customerPaid,
      change,
      withGST,
      date: new Date(),
      paymentMethod,
      splitPayment: paymentMethod === 'split'
        ? { cash: splitPayment?.cash ?? 0, upi: splitPayment?.upi ?? 0 }
        : undefined,
      tableId: selectedTableId || undefined,
      tableName: selectedTableId ? tables.find(t => t.id === selectedTableId)?.name : undefined
    };

    storage.saveBill(bill);

    // Automatically appears in Kitchen Display - no KOT printing involved.
    const kitchenOrder: KitchenOrder = {
      id: `korder-${Date.now()}`,
      orderNo: bill.orderNo,
      billId: bill.id,
      tableId: bill.tableId,
      tableName: bill.tableName,
      items: billItems.map(item => ({ name: item.menuItem.name, quantity: item.quantity })),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    kitchenStorage.addOrder(kitchenOrder);

    // Payment closes the table automatically.
    if (selectedTableId) {
      tableStorage.freeTable(selectedTableId);
      setTables(tableStorage.getTables());
      setSelectedTableId('');
    }

    if (printVia === 'bluetooth') {
      const result = await printBillViaBluetooth(bill, paperSize);
      if (!result.ok) {
        alert(`Bluetooth print failed (${result.error}). Printing via browser instead.`);
        printBill(bill, paperSize);
      }
    } else {
      printBill(bill, paperSize);
    }

    setBillItems([]);
    setShowPaymentModal(false);
    alert('Bill printed successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-3 md:p-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header - Optimized for mobile, tablet, and desktop */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <img 
                src="https://static.readdy.ai/image/b16a36712d4489a09c619c16397ad1bd/eecd6a122e7383b98d5c713792cdcbed.jpeg" 
                alt="Five Star Chicken" 
                className="w-10 h-10 md:w-16 md:h-16 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Five Star Chicken</h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">POS Billing System</p>
              </div>
            </div>
            <div className="shrink-0">
              <UserMenu />
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-hide">
              {hasPermission('menu') && (
              <a 
                href="/menu" 
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base text-center"
              >
                <i className="ri-restaurant-2-line mr-1 md:mr-2"></i>
                Menu
              </a>
              )}
              {hasPermission('reports') && (
              <a 
                href="/reports" 
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base text-center"
              >
                <i className="ri-file-chart-line mr-1 md:mr-2"></i>
                Reports
              </a>
              )}
              {hasPermission('inventory') && (
              <a 
                href="/inventory" 
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base text-center"
              >
                <i className="ri-archive-line mr-1 md:mr-2"></i>
                Inventory
              </a>
              )}
              {hasPermission('kitchen') && (
              <a 
                href="/kitchen" 
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base text-center"
              >
                <i className="ri-fire-line mr-1 md:mr-2"></i>
                Kitchen
              </a>
              )}
              {hasPermission('tables') && (
              <a 
                href="/tables" 
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base text-center"
              >
                <i className="ri-layout-grid-line mr-1 md:mr-2"></i>
                Tables
              </a>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Menu Section - Takes 2 columns on tablet and desktop */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 md:py-3 pl-10 md:pl-12 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  <i className="ri-search-line absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base md:text-lg"></i>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="ri-close-line text-lg md:text-xl"></i>
                    </button>
                  )}
                </div>
              </div>

              <CategoryTabs 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
              <MenuGrid 
                items={filteredMenu}
                onAddItem={addToBill}
              />
            </div>
          </div>

          {/* Bill Section - Takes 1 column on tablet and desktop */}
          <div className="md:col-span-1">
            <BillSection
              items={billItems}
              subtotal={calculateSubtotal()}
              total={calculateTotal()}
              withGST={withGST}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearBill={clearBill}
              onToggleGST={() => setWithGST(!withGST)}
              onProceedPayment={() => setShowPaymentModal(true)}
              tables={hasPermission('tables') ? tables : undefined}
              selectedTableId={selectedTableId}
              onSelectTable={hasPermission('tables') ? handleSelectTable : undefined}
            />
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          total={calculateTotal()}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePayment}
        />
      )}
    </div>
  );
};

export default BillingPage;
