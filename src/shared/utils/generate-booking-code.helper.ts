export function generateBookingCode() {
  return `#TRP-${Date.now()}`;
}