export type PaymentMethod = 'wallet' | 'stripe' | 'combined';

export interface PaymentSplit {
  method: PaymentMethod;
  walletAmount: number;
  stripeAmount: number;
}

export function calculatePaymentSplit(
  totalAmount: number,
  walletBalance: number,
  useWallet: boolean,
): PaymentSplit {
  if (!useWallet || walletBalance === 0) {
    return { method: 'stripe', walletAmount: 0, stripeAmount: totalAmount };
  }

  if (walletBalance >= totalAmount) {
    return { method: 'wallet', walletAmount: totalAmount, stripeAmount: 0 };
  }

  return {
    method: 'combined',
    walletAmount: walletBalance,
    stripeAmount: totalAmount - walletBalance,
  };
}
