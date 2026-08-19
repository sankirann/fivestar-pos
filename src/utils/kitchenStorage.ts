import { KitchenOrder, KitchenOrderStatus } from '../types';

const KITCHEN_ORDERS_KEY = 'fivestar_kitchen_orders';

export const kitchenStorage = {
  getOrders(): KitchenOrder[] {
    const data = localStorage.getItem(KITCHEN_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveOrders(orders: KitchenOrder[]) {
    localStorage.setItem(KITCHEN_ORDERS_KEY, JSON.stringify(orders));
  },

  addOrder(order: KitchenOrder): KitchenOrder[] {
    const updated = [...kitchenStorage.getOrders(), order];
    kitchenStorage.saveOrders(updated);
    return updated;
  },

  updateStatus(id: string, status: KitchenOrderStatus): KitchenOrder[] {
    const updated = kitchenStorage.getOrders().map(o => (o.id === id ? { ...o, status } : o));
    kitchenStorage.saveOrders(updated);
    return updated;
  }
};
