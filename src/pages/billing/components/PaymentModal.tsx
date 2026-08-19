import { useState, useEffect } from 'react';
import {
  isBluetoothPrintSupported,
  isPrinterConnected,
  getConnectedPrinterName,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
} from '../../../utils/bluetoothPrint';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onConfirm: (
    customerPaid: number,
    paperSize: '2inch' | '3inch',
    paymentMethod: 'cash' | 'upi' | 'split',
    printVia: 'browser' | 'bluetooth',
    splitPayment?: { cash: number; upi: number }
  ) => void;
}

// Rounds to 2 decimals and compares - avoids floating point issues like
// 0.1 + 0.2 !== 0.3 when checking "does the split exactly match the total".
const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const PaymentModal = ({ total, onClose, onConfirm }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'split'>('cash');
  const [customerPaid, setCustomerPaid] = useState<string>('');
  const [splitCash, setSplitCash] = useState<string>('');
  const [splitUpi, setSplitUpi] = useState<string>('');
  const [paperSize, setPaperSize] = useState<'2inch' | '3inch'>('3inch');
  const [printVia, setPrintVia] = useState<'browser' | 'bluetooth'>('browser');
  const [printerConnected, setPrinterConnected] = useState(isPrinterConnected());
  const [printerName, setPrinterName] = useState(getConnectedPrinterName());
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  useEffect(() => {
    if (printerConnected) setPrintVia('bluetooth');
  }, []);

  const handleConnectPrinter = async () => {
    setConnecting(true);
    setConnectError('');
    const result = await connectBluetoothPrinter();
    setConnecting(false);
    if (result.ok) {
      setPrinterConnected(true);
      setPrinterName(result.name || 'Bluetooth Printer');
      setPrintVia('bluetooth');
    } else {
      setConnectError(result.error || 'Could not connect to printer');
    }
  };

  const handleDisconnectPrinter = () => {
    disconnectBluetoothPrinter();
    setPrinterConnected(false);
    setPrinterName(null);
    setPrintVia('browser');
  };

  const splitCashAmount = parseFloat(splitCash) || 0;
  const splitUpiAmount = parseFloat(splitUpi) || 0;
  const splitRemaining = roundMoney(total - splitCashAmount - splitUpiAmount);
  const splitIsExact = splitRemaining === 0 && (splitCash !== '' || splitUpi !== '');

  const handleConfirm = () => {
    const paid = parseFloat(customerPaid) || 0;
    if (paymentMethod === 'cash' && paid < total) {
      alert('Payment amount must be greater than or equal to total');
      return;
    }
    if (paymentMethod === 'split') {
      if (!splitIsExact) {
        alert('Cash Amount + UPI Amount must exactly equal the bill total.');
        return;
      }
      onConfirm(total, paperSize, 'split', printVia, { cash: splitCashAmount, upi: splitUpiAmount });
      return;
    }
    onConfirm(paymentMethod === 'upi' ? total : paid, paperSize, paymentMethod, printVia);
  };

  const change = paymentMethod === 'cash' ? (parseFloat(customerPaid) || 0) - total : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-5 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <i className="ri-close-line text-2xl md:text-3xl"></i>
            </button>
          </div>

          <div className="mb-5 md:mb-6 p-4 md:p-5 bg-orange-50 rounded-lg">
            <div className="text-sm md:text-base text-gray-600 mb-1 md:mb-2">Total Amount</div>
            <div className="text-3xl md:text-4xl font-bold text-orange-600">₹{total.toFixed(2)}</div>
          </div>

          {/* Payment Method */}
          <div className="mb-5 md:mb-6">
            <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 md:p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="ri-money-rupee-circle-line text-xl md:text-3xl mb-1 md:mb-2 text-green-600"></i>
                <div className="font-semibold text-xs md:text-base">Cash</div>
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 md:p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="ri-smartphone-line text-xl md:text-3xl mb-1 md:mb-2 text-blue-600"></i>
                <div className="font-semibold text-xs md:text-base">UPI</div>
              </button>
              <button
                onClick={() => setPaymentMethod('split')}
                className={`p-2.5 md:p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  paymentMethod === 'split'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="ri-git-branch-line text-xl md:text-3xl mb-1 md:mb-2 text-purple-600"></i>
                <div className="font-semibold text-xs md:text-base">Split</div>
              </button>
            </div>
          </div>

          {/* Split Payment Inputs */}
          {paymentMethod === 'split' && (
            <div className="mb-5 md:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                    Cash Amount
                  </label>
                  <input
                    type="number"
                    value={splitCash}
                    onChange={(e) => setSplitCash(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 md:py-4 text-base md:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">
                    UPI Amount
                  </label>
                  <input
                    type="number"
                    value={splitUpi}
                    onChange={(e) => setSplitUpi(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 md:py-4 text-base md:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              {(splitCash || splitUpi) && (
                <div className={`mt-3 md:mt-4 p-3 md:p-4 rounded-lg ${
                  splitIsExact
                    ? 'bg-green-50'
                    : splitRemaining < 0
                      ? 'bg-red-50'
                      : 'bg-orange-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold text-sm md:text-base ${
                      splitIsExact ? 'text-green-700' : splitRemaining < 0 ? 'text-red-700' : 'text-orange-700'
                    }`}>
                      {splitIsExact ? 'Fully Paid' : splitRemaining < 0 ? 'Overpaid by:' : 'Remaining:'}
                    </span>
                    {splitIsExact ? (
                      <i className="ri-checkbox-circle-fill text-2xl md:text-3xl text-green-600"></i>
                    ) : (
                      <span className={`text-xl md:text-2xl font-bold ${
                        splitRemaining < 0 ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        ₹{Math.abs(splitRemaining).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cash Payment Input */}
          {paymentMethod === 'cash' && (
            <div className="mb-5 md:mb-6">
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3">
                Cash Received
              </label>
              <input
                type="number"
                value={customerPaid}
                onChange={(e) => setCustomerPaid(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 md:py-4 text-base md:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
              />
              {customerPaid && (
                <div className={`mt-3 md:mt-4 p-3 md:p-4 rounded-lg ${
                  change >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold text-sm md:text-base ${
                      change >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Change to Return:
                    </span>
                    <span className={`text-xl md:text-2xl font-bold ${
                      change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{Math.abs(change).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paper Size */}
          <div className="mb-6 md:mb-8">
            <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3">
              Paper Size
            </label>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => setPaperSize('2inch')}
                className={`p-3 md:p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  paperSize === '2inch'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="ri-file-text-line text-xl md:text-2xl mb-1 md:mb-2"></i>
                <div className="font-semibold text-sm md:text-base">2 inch</div>
                <div className="text-xs md:text-sm text-gray-500">58mm</div>
              </button>
              <button
                onClick={() => setPaperSize('3inch')}
                className={`p-3 md:p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  paperSize === '3inch'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="ri-file-text-line text-2xl md:text-3xl mb-1 md:mb-2"></i>
                <div className="font-semibold text-sm md:text-base">3 inch</div>
                <div className="text-xs md:text-sm text-gray-500">80mm</div>
              </button>
            </div>
          </div>

          {/* Bluetooth Thermal Printer */}
          <div className="mb-6 md:mb-8">
            <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3">
              Receipt Printer
            </label>
            {!isBluetoothPrintSupported() ? (
              <div className="p-3 md:p-4 rounded-lg bg-gray-100 text-gray-600 text-sm">
                <i className="ri-information-line mr-1"></i>
                Bluetooth printing needs Chrome (Android or desktop). Falling back to browser print.
              </div>
            ) : printerConnected ? (
              <div className="flex items-center justify-between p-3 md:p-4 rounded-lg border-2 border-green-500 bg-green-50">
                <div className="flex items-center gap-2 text-sm md:text-base text-green-700 font-medium">
                  <i className="ri-bluetooth-connect-line text-lg md:text-xl"></i>
                  Connected: {printerName || 'Bluetooth Printer'}
                </div>
                <button
                  onClick={handleDisconnectPrinter}
                  className="text-xs md:text-sm text-red-600 hover:text-red-700 cursor-pointer whitespace-nowrap"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleConnectPrinter}
                  disabled={connecting}
                  className="w-full p-3 md:p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base font-medium text-gray-700 disabled:opacity-60"
                >
                  <i className="ri-bluetooth-line text-lg md:text-xl text-blue-600"></i>
                  {connecting ? 'Connecting...' : 'Connect Bluetooth Printer'}
                </button>
                {connectError && (
                  <div className="mt-2 text-xs md:text-sm text-red-600">{connectError}</div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Bill will print using the browser instead if no printer is connected.
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-5 md:px-6 py-3 md:py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={paymentMethod === 'split' && !splitIsExact}
              className="flex-1 px-5 md:px-6 py-3 md:py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
            >
              <i className="ri-printer-line mr-2"></i>
              {printerConnected ? 'Print via Bluetooth' : 'Print Bill'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
