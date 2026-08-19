import { Bill } from '../types';

const RESTAURANT_INFO = {
  name: 'Five Star Chicken',
  owner: 'Sanjay Kumar CR',
  address: 'Aarogya Mane opposite Channapatna Karnataka 562160',
  phone: '9900123391',
  logo: 'https://static.readdy.ai/image/b16a36712d4489a09c619c16397ad1bd/eecd6a122e7383b98d5c713792cdcbed.jpeg'
};

export const printBill = async (bill: Bill, paperSize: '2inch' | '3inch') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const width = paperSize === '2inch' ? '58mm' : '80mm';
  const fontSize = paperSize === '2inch' ? '10px' : '12px';

  const gstRate = 0.05; // 5% GST
  const gstAmount = bill.withGST ? bill.subtotal * gstRate : 0;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bill - ${bill.orderNo}</title>
      <style>
        @media print {
          @page {
            size: ${width} auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 5mm;
          }
          .no-print {
            display: none !important;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: ${fontSize};
          line-height: 1.4;
          width: ${width};
          margin: 0 auto;
          padding: 5mm;
        }
        .no-print {
          position: fixed;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          gap: 10px;
        }
        .back-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .back-button:hover {
          background: linear-gradient(135deg, #c2410c 0%, #b91c1c 100%);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        .print-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .print-button:hover {
          background: linear-gradient(135deg, #15803d 0%, #166534 100%);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        .bill-content {
          margin-top: 60px;
        }
        .center {
          text-align: center;
        }
        .header {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          margin-bottom: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
        }
        .logo {
          width: 35px;
          height: 35px;
          flex-shrink: 0;
        }
        .header-info {
          flex: 1;
          text-align: left;
        }
        .shop-name {
          font-weight: bold;
          font-size: ${paperSize === '2inch' ? '11px' : '13px'};
          margin-bottom: 2px;
        }
        .info {
          font-size: ${paperSize === '2inch' ? '9px' : '10px'};
          margin: 1px 0;
        }
        .items {
          margin: 10px 0;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          width: 30px;
          text-align: center;
        }
        .item-price {
          width: 50px;
          text-align: right;
        }
        .totals {
          margin: 10px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .total-row.grand {
          font-weight: bold;
          font-size: ${paperSize === '2inch' ? '11px' : '13px'};
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        .payment {
          margin: 10px 0;
          border-top: 1px dashed #000;
          padding-top: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 10px;
          font-size: ${paperSize === '2inch' ? '9px' : '10px'};
        }
        .bold {
          font-weight: bold;
        }
      </style>
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    </head>
    <body>
      <div class="no-print">
        <button class="back-button" onclick="window.close(); window.opener.focus();">
          <i class="ri-arrow-left-line" style="font-size: 16px;"></i>
          Back to Dashboard
        </button>
        <button class="print-button" onclick="window.print();">
          <i class="ri-printer-line" style="font-size: 16px;"></i>
          Print Again
        </button>
      </div>

      <div class="bill-content">
        <div class="header">
          <img src="${RESTAURANT_INFO.logo}" alt="Logo" class="logo" />
          <div class="header-info">
            <div class="shop-name">${RESTAURANT_INFO.name}</div>
            <div class="info">${RESTAURANT_INFO.owner}</div>
            <div class="info">${RESTAURANT_INFO.phone}</div>
            <div class="info">${RESTAURANT_INFO.address}</div>
          </div>
        </div>

        <div class="center">
          <div class="info bold">Invoice: ${bill.id}</div>
          <div class="info">Order: ${bill.orderNo}</div>
          <div class="info">Date: ${bill.date.toLocaleDateString('en-IN')} ${bill.date.toLocaleTimeString('en-IN')}</div>
        </div>

        <div class="items">
          <div class="item-row bold">
            <div class="item-name">Item</div>
            <div class="item-qty">Qty</div>
            <div class="item-price">Price</div>
          </div>
          ${bill.items.map(item => `
            <div class="item-row">
              <div class="item-name">${item.menuItem.name}</div>
              <div class="item-qty">${item.quantity}</div>
              <div class="item-price">₹${item.price.toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        <div class="totals">
          ${bill.withGST ? `
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${bill.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>GST (5%):</span>
              <span>₹${gstAmount.toFixed(2)}</span>
            </div>
            <div class="total-row grand">
              <span>TOTAL:</span>
              <span>₹${bill.total.toFixed(2)}</span>
            </div>
          ` : `
            <div class="total-row grand">
              <span>TOTAL:</span>
              <span>₹${bill.total.toFixed(2)}</span>
            </div>
          `}
        </div>

        ${bill.paymentMethod === 'split' ? `
          <div class="payment">
            <div class="total-row bold">
              <span>Payment Method:</span>
              <span>SPLIT</span>
            </div>
            <div class="total-row">
              <span>Cash:</span>
              <span>₹${(bill.splitPayment?.cash || 0).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>UPI:</span>
              <span>₹${(bill.splitPayment?.upi || 0).toFixed(2)}</span>
            </div>
            <div class="total-row bold">
              <span>Total Paid:</span>
              <span>₹${bill.customerPaid.toFixed(2)}</span>
            </div>
          </div>
        ` : ''}

        <div class="footer">
          <div>Thank You! Visit Again</div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for images to load
  const img = printWindow.document.querySelector('img');
  if (img) {
    img.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  } else {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
