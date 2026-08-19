import {
  AppUser,
  Bill,
  InventoryItem,
  KitchenOrder,
  MenuItem,
  RestaurantSettings,
  RestaurantTable
} from '../types';
import { storage } from './storage';
import { authStorage } from './authStorage';
import { tableStorage } from './tableStorage';
import { kitchenStorage } from './kitchenStorage';

const ORDER_COUNTER_KEY = 'fivestar_order_counter';

export interface BackupData {
  version: 1;
  exportedAt: string;
  bills: Bill[];
  inventory: InventoryItem[];
  menu: MenuItem[];
  users: AppUser[];
  restaurantSettings: RestaurantSettings;
  tables: RestaurantTable[];
  kitchenOrders: KitchenOrder[];
  orderCounter: number;
}

function getOrderCounter(): number {
  const value = localStorage.getItem(ORDER_COUNTER_KEY);
  return value ? parseInt(value, 10) || 0 : 0;
}

function setOrderCounter(value: number) {
  localStorage.setItem(ORDER_COUNTER_KEY, value.toString());
}

export function buildBackup(): BackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bills: storage.getBills(),
    inventory: storage.getInventory(),
    menu: storage.getMenu(),
    users: authStorage.getUsers(),
    restaurantSettings: authStorage.getSettings(),
    tables: tableStorage.getTables(),
    kitchenOrders: kitchenStorage.getOrders(),
    orderCounter: getOrderCounter()
  };
}

export function downloadBackup() {
  const data = buildBackup();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `fivestar-pos-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Renumbers bills sequentially per-year (same scheme used elsewhere in the
// app) so that merging two devices' invoice numbers never collides.
function renumberBills(bills: Bill[]): Bill[] {
  const sorted = [...bills].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const yearCounters: Record<string, number> = {};
  return sorted.map(bill => {
    const year = new Date(bill.date).getFullYear().toString().slice(-2);
    yearCounters[year] = (yearCounters[year] || 0) + 1;
    const seq = yearCounters[year].toString().padStart(3, '0');
    return { ...bill, id: `INV${year}-${seq}` };
  });
}

// A bill is considered a duplicate if it has the same order number, date,
// and total as one already present - this is what makes the merge
// duplicate-safe when merging a backup that overlaps with local data.
function billSignature(bill: Bill): string {
  return `${bill.orderNo}|${new Date(bill.date).getTime()}|${bill.total.toFixed(2)}|${bill.paymentMethod}`;
}

export interface RestoreSummary {
  billsAdded: number;
  inventoryAdded: number;
  menuAdded: number;
  usersAdded: number;
  tablesAdded: number;
  kitchenOrdersAdded: number;
  settingsUpdated: boolean;
}

export function restoreBackup(json: string): RestoreSummary {
  const incoming = JSON.parse(json) as BackupData;

  if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.bills)) {
    throw new Error('This file is not a valid Five Star POS backup');
  }

  // ---------- Bills: dedupe by signature, then renumber to avoid clashes ----------
  const localBills = storage.getBills();
  const existingSignatures = new Set(localBills.map(billSignature));
  const newBills = incoming.bills.filter(b => !existingSignatures.has(billSignature(b)));
  const mergedBills = renumberBills([...localBills, ...newBills]);
  localStorage.setItem('fivestar_bills', JSON.stringify(mergedBills));

  // ---------- Inventory: add items that don't exist locally (keep local stock on conflict) ----------
  const localInventory = storage.getInventory();
  const localInventoryIds = new Set(localInventory.map(i => i.id));
  const newInventory = (incoming.inventory || []).filter(i => !localInventoryIds.has(i.id));
  if (newInventory.length > 0) {
    storage.saveInventory([...localInventory, ...newInventory]);
  }

  // ---------- Menu: add items that don't exist locally ----------
  const localMenu = storage.getMenu();
  const localMenuIds = new Set(localMenu.map(m => m.id));
  const newMenu = (incoming.menu || []).filter(m => !localMenuIds.has(m.id));
  if (newMenu.length > 0) {
    storage.saveMenu([...localMenu, ...newMenu]);
  }

  // ---------- Users: add accounts whose username doesn't exist locally (never overwrite existing credentials) ----------
  const localUsers = authStorage.getUsers();
  const localUsernames = new Set(localUsers.map(u => u.username.toLowerCase()));
  const newUsers = (incoming.users || []).filter(u => !localUsernames.has(u.username.toLowerCase()));
  if (newUsers.length > 0) {
    authStorage.saveUsers([...localUsers, ...newUsers]);
  }

  // ---------- Tables: add tables that don't exist locally (by name) ----------
  const localTables = tableStorage.getTables();
  const localTableNames = new Set(localTables.map(t => t.name.toLowerCase()));
  const newTables = (incoming.tables || []).filter(t => !localTableNames.has(t.name.toLowerCase()));
  if (newTables.length > 0) {
    tableStorage.saveTables([...localTables, ...newTables]);
  }

  // ---------- Kitchen Orders: add orders that don't exist locally (by id) ----------
  const localOrders = kitchenStorage.getOrders();
  const localOrderIds = new Set(localOrders.map(o => o.id));
  const newOrders = (incoming.kitchenOrders || []).filter(o => !localOrderIds.has(o.id));
  if (newOrders.length > 0) {
    kitchenStorage.saveOrders([...localOrders, ...newOrders]);
  }

  // ---------- Restaurant Settings: fill in only fields that are currently empty locally ----------
  const localSettings = authStorage.getSettings();
  let settingsUpdated = false;
  if (incoming.restaurantSettings) {
    const merged: RestaurantSettings = { ...localSettings };
    (Object.keys(incoming.restaurantSettings) as (keyof RestaurantSettings)[]).forEach(key => {
      if (!localSettings[key] && incoming.restaurantSettings[key]) {
        merged[key] = incoming.restaurantSettings[key];
        settingsUpdated = true;
      }
    });
    if (settingsUpdated) {
      authStorage.saveSettings(merged);
    }
  }

  // ---------- Order counter: keep the higher value so numbering stays monotonic ----------
  const localCounter = getOrderCounter();
  if (typeof incoming.orderCounter === 'number' && incoming.orderCounter > localCounter) {
    setOrderCounter(incoming.orderCounter);
  }

  return {
    billsAdded: newBills.length,
    inventoryAdded: newInventory.length,
    menuAdded: newMenu.length,
    usersAdded: newUsers.length,
    tablesAdded: newTables.length,
    kitchenOrdersAdded: newOrders.length,
    settingsUpdated
  };
}
