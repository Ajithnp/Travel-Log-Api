"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePaymentSplit = calculatePaymentSplit;
function calculatePaymentSplit(totalAmount, walletBalance, useWallet) {
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
