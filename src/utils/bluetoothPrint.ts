import type { Bill } from '../types';

// Standard Bluetooth SPP / thermal printer service UUIDs used by most
// 58mm/80mm ESC/POS receipt printers (e.g. Rongta, Goojprt, generic "BT Printer").
const PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb', // common thermal printer service
  '0000ff00-0000-1000-8000-00805f9b34fb', // alt service used by some clones
];
const WRITE_CHARACTERISTIC_UUIDS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
];

const RESTAURANT_INFO = {
  name: 'Five Star Chicken',
  owner: 'Sanjay Kumar CR',
  address: 'Aarogya Mane opposite Channapatna Karnataka 562160',
  phone: '9900123391',
};

let connectedDevice: BluetoothDevice | null = null;
let writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

export const isBluetoothPrintSupported = (): boolean => {
  return typeof navigator !== 'undefined' && !!navigator.bluetooth;
};

export const getConnectedPrinterName = (): string | null => {
  return connectedDevice?.name || null;
};

export const isPrinterConnected = (): boolean => {
  return !!connectedDevice?.gatt?.connected && !!writeCharacteristic;
};

/**
 * Opens the browser's native Bluetooth device picker and connects to the
 * chosen thermal printer. Must be called from a direct user gesture (click).
 */
export const connectBluetoothPrinter = async (): Promise<{ ok: boolean; name?: string; error?: string }> => {
  if (!isBluetoothPrintSupported()) {
    return { ok: false, error: 'Web Bluetooth is not supported in this browser. Use Chrome on Android or desktop.' };
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [PRINTER_SERVICE_UUIDS[0]] },
        { services: [PRINTER_SERVICE_UUIDS[1]] },
      ],
      optionalServices: [...PRINTER_SERVICE_UUIDS, ...WRITE_CHARACTERISTIC_UUIDS],
    });

    const server = await device.gatt?.connect();
    if (!server) throw new Error('Could not connect to GATT server');

    let foundChar: BluetoothRemoteGATTCharacteristic | null = null;
    for (const serviceUuid of PRINTER_SERVICE_UUIDS) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const characteristics = await service.getCharacteristics();
        // Prefer a characteristic that supports write-without-response (typical for printers)
        foundChar =
          characteristics.find(c => c.properties.writeWithoutResponse) ||
          characteristics.find(c => c.properties.write) ||
          null;
        if (foundChar) break;
      } catch {
        // try next service uuid
        continue;
      }
    }

    if (!foundChar) {
      throw new Error('No writable characteristic found on this printer.');
    }

    connectedDevice = device;
    writeCharacteristic = foundChar;

    device.addEventListener('gattserverdisconnected', () => {
      writeCharacteristic = null;
    });

    return { ok: true, name: device.name || 'Bluetooth Printer' };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to connect to printer' };
  }
};

export const disconnectBluetoothPrinter = () => {
  connectedDevice?.gatt?.disconnect();
  connectedDevice = null;
  writeCharacteristic = null;
};

// --- ESC/POS helpers ---
const ESC = 0x1b;
const GS = 0x1d;

function textToBytes(text: string): number[] {
  // Basic Latin-1 encoding; covers digits, currency-safe ASCII output.
  // The ₹ symbol is replaced with "Rs." since most cheap thermal printers
  // don't have the rupee glyph in their built-in font.
  const safe = text.replace(/₹/g, 'Rs.');
  return Array.from(safe).map(c => c.charCodeAt(0) & 0xff);
}

function line(text = '', width = 32): number[] {
  return [...textToBytes(text.slice(0, width)), 0x0a];
}

function centerLine(text: string, width = 32): number[] {
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return line(' '.repeat(pad) + text, width);
}

function divider(width = 32): number[] {
  return line('-'.repeat(width), width);
}

function twoColumn(left: string, right: string, width = 32): number[] {
  const space = Math.max(1, width - left.length - right.length);
  return line(left + ' '.repeat(space) + right, width);
}

function buildReceipt(bill: Bill, paperSize: '2inch' | '3inch'): Uint8Array {
  const width = paperSize === '2inch' ? 32 : 42;
  const bytes: number[] = [];

  bytes.push(ESC, 0x40); // init printer
  bytes.push(ESC, 0x61, 0x01); // center align

  bytes.push(...centerLine(RESTAURANT_INFO.name, width));
  bytes.push(...centerLine(RESTAURANT_INFO.owner, width));
  bytes.push(...centerLine(RESTAURANT_INFO.phone, width));
  bytes.push(...centerLine(RESTAURANT_INFO.address, width));
  bytes.push(...divider(width));

  bytes.push(ESC, 0x61, 0x00); // left align
  bytes.push(...twoColumn(`Invoice: ${bill.id}`, '', width));
  bytes.push(...twoColumn(`Order: ${bill.orderNo}`, '', width));
  bytes.push(...line(`Date: ${new Date(bill.date).toLocaleString('en-IN')}`, width));
  bytes.push(...divider(width));

  bytes.push(...twoColumn('Item', 'Amt', width));
  bytes.push(...divider(width));
  bill.items.forEach(item => {
    const name = `${item.menuItem.name} x${item.quantity}`;
    bytes.push(...twoColumn(name, `Rs.${item.price.toFixed(2)}`, width));
  });
  bytes.push(...divider(width));

  if (bill.withGST) {
    bytes.push(...twoColumn('Subtotal', `Rs.${bill.subtotal.toFixed(2)}`, width));
    bytes.push(...twoColumn('GST (5%)', `Rs.${bill.gst.toFixed(2)}`, width));
  }
  bytes.push(ESC, 0x45, 0x01); // bold on
  bytes.push(...twoColumn('TOTAL', `Rs.${bill.total.toFixed(2)}`, width));
  bytes.push(ESC, 0x45, 0x00); // bold off

  if (bill.paymentMethod === 'cash') {
    bytes.push(...twoColumn('Paid', `Rs.${bill.customerPaid.toFixed(2)}`, width));
    bytes.push(...twoColumn('Change', `Rs.${bill.change.toFixed(2)}`, width));
  } else if (bill.paymentMethod === 'split') {
    bytes.push(ESC, 0x45, 0x01); // bold on
    bytes.push(...line('Payment Method: SPLIT', width));
    bytes.push(ESC, 0x45, 0x00); // bold off
    bytes.push(...twoColumn('Cash', `Rs.${(bill.splitPayment?.cash || 0).toFixed(2)}`, width));
    bytes.push(...twoColumn('UPI', `Rs.${(bill.splitPayment?.upi || 0).toFixed(2)}`, width));
    bytes.push(...twoColumn('Total Paid', `Rs.${bill.customerPaid.toFixed(2)}`, width));
  } else {
    bytes.push(...line('Paid via UPI', width));
  }

  bytes.push(...divider(width));
  bytes.push(ESC, 0x61, 0x01); // center
  bytes.push(...centerLine('Thank You! Visit Again', width));
  bytes.push(0x0a, 0x0a, 0x0a);
  bytes.push(GS, 0x56, 0x00); // cut paper (full cut, if supported)

  return new Uint8Array(bytes);
}

/**
 * Sends the bill to the currently connected Bluetooth thermal printer as
 * raw ESC/POS commands, in chunks (most BLE printers cap writes at ~180-512 bytes).
 */
export const printBillViaBluetooth = async (
  bill: Bill,
  paperSize: '2inch' | '3inch'
): Promise<{ ok: boolean; error?: string }> => {
  if (!writeCharacteristic) {
    return { ok: false, error: 'No printer connected. Tap "Connect Printer" first.' };
  }

  try {
    const data = buildReceipt(bill, paperSize);
    const chunkSize = 180;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      if (writeCharacteristic.properties.writeWithoutResponse) {
        await writeCharacteristic.writeValueWithoutResponse(chunk);
      } else {
        await writeCharacteristic.writeValue(chunk);
      }
      // small delay so the printer's buffer keeps up
      await new Promise(r => setTimeout(r, 30));
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to send data to printer' };
  }
};
