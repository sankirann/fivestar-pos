import { Bill } from '../types';

// Centralizes how much of a bill's total was collected in cash vs UPI.
// Handles all three payment methods, and is safe against old bills saved
// before Split Payment existed (they just won't have `splitPayment`).

export const getCashAmount = (bill: Bill): number => {
  if (!bill) return 0;
  if (bill.paymentMethod === 'split') return bill.splitPayment?.cash || 0;
  if (bill.paymentMethod === 'cash') return bill.total || 0;
  return 0;
};

export const getUpiAmount = (bill: Bill): number => {
  if (!bill) return 0;
  if (bill.paymentMethod === 'split') return bill.splitPayment?.upi || 0;
  if (bill.paymentMethod === 'upi') return bill.total || 0;
  return 0;
};

export const getPaymentMethodLabel = (bill: Bill): string => {
  if (bill?.paymentMethod === 'split') return 'Split';
  if (bill?.paymentMethod === 'upi') return 'UPI';
  return 'Cash';
};
