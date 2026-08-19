import { useState, useEffect } from 'react';
import { KitchenOrder, KitchenOrderStatus } from '../../types';
import { kitchenStorage } from '../../utils/kitchenStorage';
import UserMenu from '../../components/UserMenu';

const STATUS_FLOW: KitchenOrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

const STATUS_META: Record<KitchenOrderStatus, { label: string; color: string; badge: string }> = {
  pending: { label: 'Pending', color: 'border-red-300 bg-red-50', badge: 'bg-red-100 text-red-700' },
  preparing: { label: 'Preparing', color: 'border-yellow-300 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  ready: { label: 'Ready', color: 'border-green-300 bg-green-50', badge: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', color: 'border-gray-300 bg-gray-50', badge: 'bg-gray-200 text-gray-600' }
};

const KitchenDisplayPage = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  const load = () => setOrders(kitchenStorage.getOrders());

  const advanceStatus = (order: KitchenOrder) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const next = STATUS_FLOW[currentIndex + 1];
    if (next) {
      kitchenStorage.updateStatus(order.id, next);
      load();
    }
  };

  const visibleOrders = orders
    .filter(o => showCompleted || o.status !== 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">Kitchen Display</h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">Auto-refreshes every few seconds</p>
            </div>
            <div className="shrink-0">
              <UserMenu />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 scrollbar-hide">
              <label className="shrink-0 flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={e => setShowCompleted(e.target.checked)}
                  className="cursor-pointer"
                />
                Show completed
              </label>
              <a
                href="/"
                className="shrink-0 px-4 md:px-6 py-2.5 md:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Billing
              </a>
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg text-center py-20 text-gray-500">
            <i className="ri-fire-line text-5xl mb-3 block"></i>
            No active kitchen orders
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleOrders.map(order => {
              const meta = STATUS_META[order.status];
              const next = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
              return (
                <div key={order.id} className={`rounded-xl border-2 p-4 shadow-sm ${meta.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-800">{order.orderNo}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badge}`}>{meta.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <i className="ri-table-line mr-1"></i>
                    {order.tableName || 'Takeaway'}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    <i className="ri-time-line mr-1"></i>
                    {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 mb-4">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{item.name}</span>
                        <span className="font-medium">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  {next && (
                    <button
                      onClick={() => advanceStatus(order)}
                      className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors cursor-pointer text-sm font-medium"
                    >
                      Mark as {STATUS_META[next].label}
                      <i className="ri-arrow-right-line ml-1"></i>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplayPage;
