import { Bill, InventoryItem, MenuItem } from '../types';

const BILLS_KEY = 'fivestar_bills';
const INVENTORY_KEY = 'fivestar_inventory';
const MENU_KEY = 'fivestar_menu';
const ORDER_COUNTER_KEY = 'fivestar_order_counter';

export const storage = {
  // Bills
  getBills: (): Bill[] => {
    const data = localStorage.getItem(BILLS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((bill: any) => ({
      ...bill,
      date: new Date(bill.date)
    }));
  },

  saveBill: (bill: Bill) => {
    const bills = storage.getBills();
    bills.push(bill);
    localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
  },

  // Deletes a bill and renumbers the invoice IDs of the remaining bills
  // sequentially (per year) so there are no gaps and no reused numbers.
  // The deleted bill does not count towards totals since it's removed
  // from the stored list entirely.
  deleteBill: (billId: string): Bill[] => {
    const remaining = storage.getBills().filter(bill => bill.id !== billId);

    const yearCounters: Record<string, number> = {};
    const renumbered = remaining.map(bill => {
      const year = new Date(bill.date).getFullYear().toString().slice(-2);
      yearCounters[year] = (yearCounters[year] || 0) + 1;
      const invoiceNumber = yearCounters[year].toString().padStart(3, '0');
      return { ...bill, id: `INV${year}-${invoiceNumber}` };
    });

    localStorage.setItem(BILLS_KEY, JSON.stringify(renumbered));
    return renumbered;
  },

  // Inventory
  getInventory: (): InventoryItem[] => {
    const data = localStorage.getItem(INVENTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveInventory: (inventory: InventoryItem[]) => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  },

  updateInventoryStock: (itemId: string, quantity: number) => {
    const inventory = storage.getInventory();
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      item.stock -= quantity;
      storage.saveInventory(inventory);
    }
  },

  // Menu
  getMenu: (): MenuItem[] => {
    const data = localStorage.getItem(MENU_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveMenu: (menu: MenuItem[]) => {
    localStorage.setItem(MENU_KEY, JSON.stringify(menu));
  },

  // Order Counter
  getNextOrderNumber: (): string => {
    const counter = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || '0');
    const nextCounter = counter + 1;
    localStorage.setItem(ORDER_COUNTER_KEY, nextCounter.toString());
    return `ORD${nextCounter.toString().padStart(3, '0')}`;
  },

  getNextInvoiceNumber: (): string => {
    const bills = storage.getBills();
    const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year
    const invoiceNumber = (bills.length + 1).toString().padStart(3, '0');
    return `INV${currentYear}-${invoiceNumber}`;
  }
};
