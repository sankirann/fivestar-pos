import { useEffect, useMemo, useState } from 'react';
import { Bill, InventoryItem, KitchenOrder, RestaurantTable } from '../../types';
import { storage } from '../../utils/storage';
import { kitchenStorage } from '../../utils/kitchenStorage';
import { tableStorage } from '../../utils/tableStorage';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../../components/UserMenu';

const todayKey = () => new Date().toISOString().split('T')[0];

const DashboardPage = () => {
  const { user, hasPermission } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const load = () => {
    setBills(storage.getBills());
    setInventory(storage.getInventory());
    setKitchenOrders(kitchenStorage.getOrders());
    setTables(tableStorage.getTables());
  };

  const todaysBills = useMemo(
    () => bills.filter(b => new Date(b.date).toISOString().split('T')[0] === todayKey()),
    [bills]
  );

  const todaysSales = todaysBills.reduce((sum, b) => sum + (b.total || 0), 0);
  const todaysGST = todaysBills.reduce((sum, b) => sum + (b.gst || 0), 0);
  // "Profit" here is net-of-GST revenue (subtotal) - the app has no cost/expense
  // tracking, so true margin can't be calculated from the data available.
  const todaysProfit = todaysSales - todaysGST;
  const todaysOrderCount = todaysBills.length;

  const pendingOrders = kitchenOrders.filter(o => o.status !== 'completed');
  const lowStockCount = inventory.filter(i => i.stock === 0 || i.stock < 20).length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  const last7Days = useMemo(() => {
    const days: { label: string; date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const revenue = bills
        .filter(b => new Date(b.date).toISOString().split('T')[0] === dateStr)
        .reduce((sum, b) => sum + (b.total || 0), 0);
      days.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), date: dateStr, revenue });
    }
    return days;
  }, [bills]);

  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

  const cards = [
    {
      label: "Today's Sales",
      value: `₹${todaysSales.toFixed(2)}`,
      icon: 'ri-money-rupee-circle-line',
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Bills Today',
      value: todaysOrderCount.toString(),
      icon: 'ri-file-list-3-line',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Profit (Net of GST)',
      value: `₹${todaysProfit.toFixed(2)}`,
      icon: 'ri-line-chart-line',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Pending Kitchen Orders',
      value: pendingOrders.length.toString(),
      icon: 'ri-fire-line',
      color: 'from-red-500 to-red-600'
    },
    {
      label: 'Inventory Alerts',
      value: lowStockCount.toString(),
      icon: 'ri-alert-line',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      label: 'Tables Occupied',
      value: `${occupiedTables} / ${tables.length}`,
      icon: 'ri-layout-grid-line',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const quickActions: { label: string; href: string; icon: string; show: boolean }[] = [
    { label: 'Billing', href: '/', icon: 'ri-shopping-cart-line', show: hasPermission('billing') },
    { label: 'Menu', href: '/menu', icon: 'ri-restaurant-2-line', show: hasPermission('menu') },
    { label: 'Inventory', href: '/inventory', icon: 'ri-archive-line', show: hasPermission('inventory') },
    { label: 'Reports', href: '/reports', icon: 'ri-file-chart-line', show: hasPermission('reports') },
    { label: 'Kitchen', href: '/kitchen', icon: 'ri-fire-line', show: hasPermission('kitchen') },
    { label: 'Tables', href: '/tables', icon: 'ri-layout-grid-line', show: hasPermission('tables') },
    { label: 'Users', href: '/users', icon: 'ri-team-line', show: user?.role === 'admin' },
    { label: 'Backup', href: '/backup', icon: 'ri-download-cloud-2-line', show: user?.role === 'admin' }
  ].filter(a => a.show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">Welcome back, {user?.username}</p>
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
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {cards.map(card => (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <i className={`${card.icon} text-3xl opacity-80`}></i>
              </div>
              <p className="text-sm opacity-90 mb-1">{card.label}</p>
              <p className="text-2xl md:text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 7-Day Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Last 7 Days Revenue</h2>
            <div className="flex items-end justify-between gap-3 h-56">
              {last7Days.map(day => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-xs font-medium text-gray-600">₹{day.revenue.toFixed(0)}</p>
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all"
                    style={{ height: `${Math.max((day.revenue / maxRevenue) * 160, 4)}px` }}
                  ></div>
                  <p className="text-xs text-gray-500">{day.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(action => (
                <a
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-center"
                >
                  <i className={`${action.icon} text-2xl text-gray-700`}></i>
                  <span className="text-xs font-medium text-gray-700">{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
