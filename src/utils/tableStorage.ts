import { RestaurantTable } from '../types';

const TABLES_KEY = 'fivestar_tables';

export const tableStorage = {
  getTables(): RestaurantTable[] {
    const data = localStorage.getItem(TABLES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTables(tables: RestaurantTable[]) {
    localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  },

  addTable(name: string): RestaurantTable[] {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Table name is required');
    const tables = tableStorage.getTables();
    if (tables.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('A table with this name already exists');
    }
    const table: RestaurantTable = {
      id: `table-${Date.now()}`,
      name: trimmed,
      status: 'available'
    };
    const updated = [...tables, table];
    tableStorage.saveTables(updated);
    return updated;
  },

  deleteTable(id: string): RestaurantTable[] {
    const updated = tableStorage.getTables().filter(t => t.id !== id);
    tableStorage.saveTables(updated);
    return updated;
  },

  occupyTable(id: string, orderNo?: string): RestaurantTable[] {
    const updated = tableStorage.getTables().map(t =>
      t.id === id ? { ...t, status: 'occupied' as const, currentOrderNo: orderNo } : t
    );
    tableStorage.saveTables(updated);
    return updated;
  },

  freeTable(id: string): RestaurantTable[] {
    const updated = tableStorage.getTables().map(t =>
      t.id === id ? { ...t, status: 'available' as const, currentOrderNo: undefined } : t
    );
    tableStorage.saveTables(updated);
    return updated;
  }
};
