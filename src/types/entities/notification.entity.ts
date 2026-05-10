// notification interface

import { Types } from "mongoose";
import { UserRole } from "./user.entity";


export enum UserNotificationType {
  BookingConfirmed = "booking_confirmed",
  PaymentSuccess = "payment_success",
  PaymentFailed = "payment_failed",
  TripReminder = "trip_reminder",
  TripCancelledByVendor = "trip_cancelled_by_vendor",
  RefundProcessed = "refund_processed",
  ReviewReminder = "review_reminder",
  WishlistNewSchedule = "wishlist_new_schedule",
};

export enum AdminNotificationType {
  NewVerification = "new_verification",
  VendorResubmitted = "vendor_resubmitted",
  PayoutFailed = "payout_failed",
  VendorTripCancelledLarge = "vendor_trip_cancelled_large",
  RepeatedCancellations = "repeated_cancellations",
  LargeRefund = "large_refund",
  AdminLogin = "admin_login",
}

export enum VendorNotificationType {
  NewBooking = "new_booking",
  BookingCancelled = "booking_cancelled",
  NewReview = "new_review",
  VerificationApproved = "verification_approved",
  VerificationRejected = "verification_rejected",
  PackageFlagged = "package_flagged",
  VendorBlocked = "vendor_blocked",
  PayoutProcessed = "payout_processed",
  PayoutFailed = "payout_failed",
  TripReminder = "trip_reminder",
  CancellationWarning = "cancellation_warning",
}

export type NotificationType =
  | UserNotificationType
  | VendorNotificationType
  | AdminNotificationType;

export const ALL_NOTIFICATION_TYPES: string[] = [
  ...Object.values(UserNotificationType),
  ...Object.values(VendorNotificationType),
  ...Object.values(AdminNotificationType),
];

export interface INotification extends Document {
  _id: Types.ObjectId;
  receipientId: Types.ObjectId;
  receipientRole: UserRole;
  senderId?: Types.ObjectId;
  notificationType: NotificationType;
  title: string;
  message: string;
  data:Record<string, unknown>;
  redirectUrl?: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
