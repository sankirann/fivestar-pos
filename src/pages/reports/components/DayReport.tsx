
import { Bill } from '../../../types';
import { getCashAmount, getUpiAmount } from '../../../utils/paymentUtils';
import ExportButtons from './ExportButtons';

interface DayReportProps {
  bills: Bill[];
  dateFilter: string;
}

const DayReport = ({ bills, dateFilter }: DayReportProps) => {
  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.date).toISOString().split('T')[0];
    return billDate === dateFilter;
  });

  // Group by hour
  const hourlyData: { [hour: string]: { orders: number; revenue: number } } = {};
  
  filteredBills.forEach(bill => {
    const hour = new Date(bill.date).getHours();
    const hourKey = `${hour.toString().padStart(2, '0')}:00`;
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = { orders: 0, revenue: 0 };
    }
    
    hourlyData[hourKey].orders += 1;
    hourlyData[hourKey].revenue += bill.total;
  });

  const sortedHours = Object.entries(hourlyData).sort((a, b) => a[0].localeCompare(b[0]));

  const totalOrders = filteredBills.length;
  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
  const totalGST = filteredBills.reduce((sum, bill) => sum + bill.gst, 0);
  const cashCollected = filteredBills.reduce((sum, bill) => sum + getCashAmount(bill), 0);
  const upiCollected = filteredBills.reduce((sum, bill) => sum + getUpiAmount(bill), 0);
  const totalCollected = cashCollected + upiCollected;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Day Report - {dateFilter}</h2>

      <ExportButtons
        title={`Day Report - ${dateFilter}`}
        filename={`day-report-${dateFilter}`}
        headers={['Hour', 'Orders', 'Revenue']}
        rows={sortedHours.map(([hour, data]) => [hour, data.orders, data.revenue.toFixed(2)])}
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-shopping-cart-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-money-rupee-circle-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-file-text-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">GST Collected</p>
          <p className="text-3xl font-bold">₹{totalGST.toFixed(2)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-wallet-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">Cash Collected</p>
          <p className="text-3xl font-bold">₹{cashCollected.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-smartphone-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">UPI Collected</p>
          <p className="text-3xl font-bold">₹{upiCollected.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-bank-line text-3xl opacity-80"></i>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Collected</p>
          <p className="text-3xl font-bold">₹{totalCollected.toFixed(2)}</p>
        </div>
      </div>

      {/* Hourly Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Hourly Breakdown</h3>
        
        {sortedHours.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No data available for this date</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Orders</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedHours.map(([hour, data]) => (
                  <tr key={hour} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{hour}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-center">{data.orders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                      ₹{data.revenue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      ₹{(data.revenue / data.orders).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayReport;
