export interface InventoryUsage {
  itemId: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'veg' | 'non-veg' | 'drinks';
  price: number;
  ml?: number;
  inventoryItems?: InventoryUsage[];
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  stockSet: number;
  unit: string;
}

export interface BillItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
}

export interface ItemSalesReport {
  itemName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface SplitPaymentDetails {
  cash: number;
  upi: number;
}

export interface Bill {
  id: string;
  orderNo: string;
  items: BillItem[];
  subtotal: number;
  gst: number;
  total: number;
  customerPaid: number;
  change: number;
  withGST: boolean;
  date: Date;
  paymentMethod: 'cash' | 'upi' | 'split';
  // Only present when paymentMethod === 'split'. Older bills saved before
  // this feature existed simply won't have this field - always treat it
  // as optional/possibly-missing when reading bills back from storage.
  splitPayment?: SplitPaymentDetails;
  tableId?: string;
  tableName?: string;
}

// ==========================
// Authentication & Access Control
// ==========================

export type UserRole = 'admin' | 'manager';

export type Permission =
  | 'billing'
  | 'menu'
  | 'inventory'
  | 'reports'
  | 'analytics'
  | 'users'
  | 'backup'
  | 'restore'
  | 'security'
  | 'kitchen'
  | 'tables'
  | 'settings';

export interface AppUser {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  permissions: Permission[];
  enabled: boolean;
  createdAt: string;
}

// The session/UI-facing user never carries the password hash.
export type SessionUser = Omit<AppUser, 'passwordHash'>;

export interface RestaurantSettings {
  restaurantName: string;
  ownerName: string;
  phone: string;
  address: string;
  logo: string; // base64 data URL, empty string if not set
}

// ==========================
// Table Management
// ==========================

export interface RestaurantTable {
  id: string;
  name: string;
  status: 'available' | 'occupied';
  currentOrderNo?: string;
}

// ==========================
// Kitchen Display
// ==========================

export type KitchenOrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export interface KitchenOrderItem {
  name: string;
  quantity: number;
}

export interface KitchenOrder {
  id: string;
  orderNo: string;
  billId: string;
  tableId?: string;
  tableName?: string;
  items: KitchenOrderItem[];
  status: KitchenOrderStatus;
  createdAt: string;
}
