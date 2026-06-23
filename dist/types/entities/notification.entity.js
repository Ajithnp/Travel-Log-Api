"use strict";
// notification interface
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_NOTIFICATION_TYPES = exports.VendorNotificationType = exports.AdminNotificationType = exports.UserNotificationType = void 0;
var UserNotificationType;
(function (UserNotificationType) {
    UserNotificationType["BookingConfirmed"] = "booking_confirmed";
    UserNotificationType["BookingCancelRequest"] = "booking_cancel_request";
    UserNotificationType["PaymentSuccess"] = "payment_success";
    UserNotificationType["PaymentFailed"] = "payment_failed";
    UserNotificationType["TripReminder"] = "trip_reminder";
    UserNotificationType["TripCancelledByVendor"] = "trip_cancelled_by_vendor";
    UserNotificationType["RefundProcessed"] = "refund_processed";
    UserNotificationType["ReviewReminder"] = "review_reminder";
    UserNotificationType["WishlistNewSchedule"] = "wishlist_new_schedule";
})(UserNotificationType || (exports.UserNotificationType = UserNotificationType = {}));
var AdminNotificationType;
(function (AdminNotificationType) {
    AdminNotificationType["NewVerification"] = "new_verification";
    AdminNotificationType["VendorResubmitted"] = "vendor_resubmitted";
    AdminNotificationType["PayoutFailed"] = "payout_failed";
    AdminNotificationType["VendorTripCancelledLarge"] = "vendor_trip_cancelled_large";
    AdminNotificationType["RepeatedCancellations"] = "repeated_cancellations";
    AdminNotificationType["LargeRefund"] = "large_refund";
    AdminNotificationType["AdminLogin"] = "admin_login";
    AdminNotificationType["RejectedCancellation"] = "rejected_cancellation";
})(AdminNotificationType || (exports.AdminNotificationType = AdminNotificationType = {}));
var VendorNotificationType;
(function (VendorNotificationType) {
    VendorNotificationType["NewBooking"] = "new_booking";
    VendorNotificationType["BookingCancelled"] = "booking_cancelled";
    VendorNotificationType["NewReview"] = "new_review";
    VendorNotificationType["VerificationApproved"] = "verification_approved";
    VendorNotificationType["VerificationRejected"] = "verification_rejected";
    VendorNotificationType["PackageFlagged"] = "package_flagged";
    VendorNotificationType["VendorBlocked"] = "vendor_blocked";
    VendorNotificationType["PayoutProcessed"] = "payout_processed";
    VendorNotificationType["PayoutFailed"] = "payout_failed";
    VendorNotificationType["TripReminder"] = "trip_reminder";
    VendorNotificationType["CancellationWarning"] = "cancellation_warning";
})(VendorNotificationType || (exports.VendorNotificationType = VendorNotificationType = {}));
exports.ALL_NOTIFICATION_TYPES = [
    ...Object.values(UserNotificationType),
    ...Object.values(VendorNotificationType),
    ...Object.values(AdminNotificationType),
];
