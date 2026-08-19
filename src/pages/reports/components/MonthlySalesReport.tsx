import { useState } from 'react';
import type { Bill } from '../../../types';
import { getCashAmount, getUpiAmount } from '../../../utils/paymentUtils';
import ExportButtons from './ExportButtons';

interface MonthlySalesReportProps {
  bills: Bill[];
}

const MonthlySalesReport = ({ bills = [] }: MonthlySalesReportProps) => {
  const [monthFilter, setMonthFilter] = useState<string>(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );

  const filteredBills = bills.filter(bill => {
    if (!bill || !bill.date) return false;
    const billMonth = new Date(bill.date).toISOString().slice(0, 7);
    return billMonth === monthFilter;
  });

  // Group by day-of-month
  const dailyData: { [day: string]: { orders: number; revenue: number; gst: number } } = {};
  filteredBills.forEach(bill => {
    const dayKey = new Date(bill.date).toISOString().split('T')[0];
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = { orders: 0, revenue: 0, gst: 0 };
    }
    dailyData[dayKey].orders += 1;
    dailyData[dayKey].revenue += bill.total || 0;
    dailyData[dayKey].gst += bill.gst || 0;
  });

  const sortedDays = Object.entries(dailyData).sort((a, b) => a[0].localeCompare(b[0]));

  const totalOrders = filteredBills.length;
  const totalRevenue = filteredBills.reduce((sum, bill) => sum + (bill.total || 0), 0);
  const totalGST = filteredBills.reduce((sum, bill) => sum + (bill.gst || 0), 0);
  const cashCollected = filteredBills.reduce((sum, bill) => sum + getCashAmount(bill), 0);
  const upiCollected = filteredBills.reduce((sum, bill) => sum + getUpiAmount(bill), 0);
  const totalCollected = cashCollected + upiCollected;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const bestDay = sortedDays.reduce<{ day: string; revenue: number } | null>((best, [day, data]) => {
    if (!best || data.revenue > best.revenue) return { day, revenue: data.revenue };
    return best;
  }, null);

  const [year, month] = monthFilter.split('-');
  const monthLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const maxRevenue = sortedDays.length > 0 ? Math.max(...sortedDays.map(([, d]) => d.revenue)) : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Monthly Sales - {monthLabel}</h2>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => setMonthFilter(new Date().toISOString().slice(0, 7))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            This Month
          </button>
        </div>
      </div>

      <ExportButtons
        title={`Monthly Sales - ${monthLabel}`}
        filename={`monthly-sales-${monthFilter}`}
        headers={['Date', 'Orders', 'Revenue', 'GST']}
        rows={sortedDays.map(([day, data]) => [day, data.orders, data.revenue.toFixed(2), data.gst.toFixed(2)])}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-money-rupee-circle-line text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-shopping-cart-line text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-file-text-line text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600 mb-1">GST Collected</p>
          <p className="text-2xl font-bold text-gray-800">₹{totalGST.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-wallet-line text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600 mb-1">Cash Collected</p>
          <p className="text-2xl font-bold text-gray-800">₹{cashCollected.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-smartphone-line text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600 mb-1">UPI Collected</p>
          <p className="text-2xl font-bold text-gray-800">₹{upiCollected.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-bank-line text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-gray-800">₹{totalCollected.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-line-chart-line text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-800">₹{avgOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-3">
            <i className="ri-calendar-check-line text-white text-2xl"></i>
          </div>
          <p className="text-sm text-gray-600 mb-1">Best Day</p>
          <p className="text-2xl font-bold text-gray-800">
            {bestDay ? new Date(bestDay.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
          </p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Day-by-Day Breakdown</h3>

        {sortedDays.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No sales data for this month</p>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              {sortedDays.map(([day, data]) => {
                const percentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={day} className="flex items-center gap-3">
                    <div className="w-20 text-xs md:text-sm text-gray-600 flex-shrink-0">
                      {new Date(day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-6 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-24 text-xs md:text-sm font-semibold text-gray-800 text-right flex-shrink-0">
                      ₹{data.revenue.toFixed(0)}
                    </div>
                    <div className="w-16 text-xs text-gray-500 text-right flex-shrink-0">
                      {data.orders} ord.
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Orders</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">GST</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Avg Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedDays.map(([day, data]) => (
                    <tr key={day} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {new Date(day).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-center">{data.orders}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                        ₹{data.revenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">₹{data.gst.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        ₹{(data.revenue / data.orders).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-800">Total</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-center">{totalOrders}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">₹{totalRevenue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right">₹{totalGST.toFixed(2)}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlySalesReport;
