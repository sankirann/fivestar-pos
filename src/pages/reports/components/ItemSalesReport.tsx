
import { Bill, ItemSalesReport as ItemSalesData } from '../../../types';
import { getCashAmount, getUpiAmount } from '../../../utils/paymentUtils';
import ExportButtons from './ExportButtons';

interface ItemSalesReportProps {
  bills: Bill[];
  dateFilter: string;
}

const ItemSalesReport = ({ bills, dateFilter }: ItemSalesReportProps) => {
  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.date).toISOString().split('T')[0];
    return billDate === dateFilter;
  });

  const itemSales: { [key: string]: ItemSalesData } = {};

  filteredBills.forEach(bill => {
    bill.items.forEach(item => {
      if (!itemSales[item.menuItem.id]) {
        itemSales[item.menuItem.id] = {
          itemName: item.menuItem.name,
          quantitySold: 0,
          totalRevenue: 0
        };
      }
      itemSales[item.menuItem.id].quantitySold += item.quantity;
      itemSales[item.menuItem.id].totalRevenue += item.price;
    });
  });

  const sortedItems = Object.values(itemSales).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const cashCollected = filteredBills.reduce((sum, bill) => sum + getCashAmount(bill), 0);
  const upiCollected = filteredBills.reduce((sum, bill) => sum + getUpiAmount(bill), 0);
  const totalCollected = cashCollected + upiCollected;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Item-wise Sales Report</h2>

      <ExportButtons
        title={`Item Sales Report - ${dateFilter}`}
        filename={`item-sales-${dateFilter}`}
        headers={['Item', 'Quantity Sold', 'Total Revenue']}
        rows={sortedItems.map(item => [item.itemName, item.quantitySold, item.totalRevenue.toFixed(2)])}
      />

      {/* Collections Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity Sold</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Revenue</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Avg Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No sales data for this date
                </td>
              </tr>
            ) : (
              sortedItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.itemName}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 text-center">{item.quantitySold}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                    ₹{item.totalRevenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    ₹{(item.totalRevenue / item.quantitySold).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {sortedItems.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800">Total</td>
                <td className="px-4 py-3 text-sm text-gray-800 text-center">
                  {sortedItems.reduce((sum, item) => sum + item.quantitySold, 0)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">
                  ₹{sortedItems.reduce((sum, item) => sum + item.totalRevenue, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Top Selling Items Chart */}
      {sortedItems.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {sortedItems.slice(0, 5).map((item, index) => {
              const maxRevenue = sortedItems[0].totalRevenue;
              const percentage = (item.totalRevenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{item.itemName}</span>
                    <span className="text-sm text-gray-600">₹{item.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {item.quantitySold} units sold
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemSalesReport;
