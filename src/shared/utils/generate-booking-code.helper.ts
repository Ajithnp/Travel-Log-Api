export function generateBookingCode() {
  return `#TRP-${Date.now()}`;
}

export function generatePayoutRefId() {
  return `#PTID-${crypto.randomUUID()}`;
}
