"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBookingCode = generateBookingCode;
exports.generatePayoutRefId = generatePayoutRefId;
function generateBookingCode() {
    return `#TRP-${Date.now()}`;
}
function generatePayoutRefId() {
    return `#PTID-${crypto.randomUUID()}`;
}
