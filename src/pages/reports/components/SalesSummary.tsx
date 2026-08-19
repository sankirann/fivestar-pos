
import { Bill } from '../../../types';
import { getCashAmount, getUpiAmount } from '../../../utils/paymentUtils';
import ExportButtons from './ExportButtons';

interface SalesSummaryProps {
  bills: Bill[];
  dateFilter: string;
}

const SalesSummary = ({ bills = [], dateFilter }: SalesSummaryProps) => {
  const filteredBills = bills.filter(bill => {
    // Validate bill structure
    if (!bill || !bill.date || !bill.id) return false;
    const billDate = new Date(bill.date).toISOString().split('T')[0];
    return billDate === dateFilter;
  });

  const totalSales = filteredBills.reduce((sum, bill) => sum + (bill.total || 0), 0);
  const totalOrders = filteredBills.length;
  const totalGST = filteredBills.reduce((sum, bill) => sum + (bill.gst || 0), 0);
  const cashCollected = filteredBills.reduce((sum, bill) => sum + getCashAmount(bill), 0);
  const upiCollected = filteredBills.reduce((sum, bill) => sum + getUpiAmount(bill), 0);
  const totalCollected = cashCollected + upiCollected;
  const changeGiven = filteredBills.reduce((sum, bill) => sum + (bill.change || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const stats = [
    { label: 'Total Sales', value: `₹${totalSales.toFixed(2)}`, icon: 'ri-money-rupee-circle-line', color: 'bg-green-500' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: 'ri-shopping-cart-line', color: 'bg-blue-500' },
    { label: 'GST Collected', value: `₹${totalGST.toFixed(2)}`, icon: 'ri-file-text-line', color: 'bg-purple-500' },
    { label: 'Cash Collected', value: `₹${cashCollected.toFixed(2)}`, icon: 'ri-wallet-line', color: 'bg-orange-500' },
    { label: 'UPI Collected', value: `₹${upiCollected.toFixed(2)}`, icon: 'ri-smartphone-line', color: 'bg-indigo-500' },
    { label: 'Total Collected', value: `₹${totalCollected.toFixed(2)}`, icon: 'ri-bank-line', color: 'bg-emerald-600' },
    { label: 'Change Given', value: `₹${changeGiven.toFixed(2)}`, icon: 'ri-exchange-line', color: 'bg-red-500' },
    { label: 'Avg Order Value', value: `₹${avgOrderValue.toFixed(2)}`, icon: 'ri-line-chart-line', color: 'bg-teal-500' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales Summary</h2>

      <ExportButtons
        title={`Sales Summary - ${dateFilter}`}
        filename={`sales-summary-${dateFilter}`}
        headers={['Metric', 'Value']}
        rows={stats.map(s => [s.label, s.value])}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <i className={`${stat.icon} text-white text-2xl`}></i>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Bills */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Bills</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">GST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.slice(-10).reverse().map(bill => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{bill.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{bill.orderNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {bill.date ? new Date(bill.date).toLocaleTimeString('en-IN') : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{bill.items?.length || 0}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                    ₹{(bill.total || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bill.withGST ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {bill.withGST ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBills.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bills found for the selected date
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;
