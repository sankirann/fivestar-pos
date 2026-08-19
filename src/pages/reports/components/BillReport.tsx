import { useState } from 'react';
import { Bill } from '../../../types';
import { printBill } from '../../../utils/print';
import { getCashAmount, getUpiAmount, getPaymentMethodLabel } from '../../../utils/paymentUtils';
import ExportButtons from './ExportButtons';

interface BillReportProps {
  bills: Bill[];
  dateFilter: string;
  onDeleteBill: (billId: string) => void;
}

const BillReport = ({ bills, dateFilter, onDeleteBill }: BillReportProps) => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.date).toISOString().split('T')[0];
    return billDate === dateFilter;
  });

  const cashCollected = filteredBills.reduce((sum, bill) => sum + getCashAmount(bill), 0);
  const upiCollected = filteredBills.reduce((sum, bill) => sum + getUpiAmount(bill), 0);
  const totalCollected = cashCollected + upiCollected;

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill);
    setShowBillModal(true);
  };

  const handlePrint = (paperSize: '2inch' | '3inch') => {
    if (selectedBill) {
      printBill(selectedBill, paperSize);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Delete invoice ${bill.id} (Order ${bill.orderNo})? This cannot be undone.`
    );
    if (confirmed) {
      onDeleteBill(bill.id);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bill Report</h2>

      <ExportButtons
        title={`Bill Report - ${dateFilter}`}
        filename={`bill-report-${dateFilter}`}
        headers={['Invoice', 'Order No', 'Date & Time', 'Subtotal', 'GST', 'Total', 'Payment', 'Cash Paid', 'UPI Paid', 'Change']}
        rows={filteredBills.map(bill => [
          bill.id,
          bill.orderNo,
          `${new Date(bill.date).toLocaleDateString('en-IN')} ${new Date(bill.date).toLocaleTimeString('en-IN')}`,
          bill.subtotal.toFixed(2),
          bill.gst.toFixed(2),
          bill.total.toFixed(2),
          getPaymentMethodLabel(bill),
          getCashAmount(bill).toFixed(2),
          getUpiAmount(bill).toFixed(2),
          bill.change.toFixed(2)
        ])}
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">GST</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Payment</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Paid</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Change</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No bills found for this date
                </td>
              </tr>
            ) : (
              filteredBills.map(bill => (
                <tr 
                  key={bill.id} 
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleBillClick(bill)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{bill.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{bill.orderNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(bill.date).toLocaleDateString('en-IN')} {new Date(bill.date).toLocaleTimeString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 text-right">₹{bill.subtotal.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 text-right">₹{bill.gst.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">₹{bill.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bill.paymentMethod === 'cash'
                        ? 'bg-orange-100 text-orange-700'
                        : bill.paymentMethod === 'split'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {getPaymentMethodLabel(bill)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 text-right">₹{bill.customerPaid.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 text-right">₹{bill.change.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => handleDeleteClick(e, bill)}
                      className="w-9 h-9 inline-flex items-center justify-center text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete bill"
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredBills.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm text-gray-800">Total</td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">
                  ₹{filteredBills.reduce((sum, bill) => sum + bill.subtotal, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">
                  ₹{filteredBills.reduce((sum, bill) => sum + bill.gst, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">
                  ₹{filteredBills.reduce((sum, bill) => sum + bill.total, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">
                  ₹{filteredBills.reduce((sum, bill) => sum + bill.customerPaid, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 text-right">
                  ₹{filteredBills.reduce((sum, bill) => sum + bill.change, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Bill Details Modal */}
      {showBillModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Bill Details</h3>
                  <p className="text-blue-100 text-sm mt-1">Invoice: {selectedBill.id}</p>
                </div>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Bill Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold text-gray-800">{selectedBill.orderNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedBill.date).toLocaleDateString('en-IN')}<br/>
                    {new Date(selectedBill.date).toLocaleTimeString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="ri-shopping-bag-line text-blue-600"></i>
                  Order Items
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedBill.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-800">{item.menuItem.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 text-right">₹{item.menuItem.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">₹{item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-800">₹{selectedBill.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedBill.withGST && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (5%):</span>
                      <span className="font-semibold text-gray-800">₹{selectedBill.gst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-blue-600">₹{selectedBill.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="ri-money-rupee-circle-line text-green-600"></i>
                  Payment Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-gray-800">{getPaymentMethodLabel(selectedBill)}</span>
                  </div>
                  {selectedBill.paymentMethod === 'split' ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cash Paid:</span>
                        <span className="font-semibold text-gray-800">₹{(selectedBill.splitPayment?.cash || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">UPI Paid:</span>
                        <span className="font-semibold text-gray-800">₹{(selectedBill.splitPayment?.upi || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Paid:</span>
                        <span className="font-semibold text-gray-800">₹{selectedBill.customerPaid.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-semibold text-gray-800">₹{selectedBill.customerPaid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Change:</span>
                        <span className="font-semibold text-gray-800">₹{selectedBill.change.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Print Options */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="ri-printer-line text-blue-600"></i>
                  Print Bill Again
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePrint('2inch')}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap font-medium"
                  >
                    <i className="ri-printer-line mr-2"></i>
                    Print 2 inch
                  </button>
                  <button
                    onClick={() => handlePrint('3inch')}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap font-medium"
                  >
                    <i className="ri-printer-line mr-2"></i>
                    Print 3 inch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillReport;
