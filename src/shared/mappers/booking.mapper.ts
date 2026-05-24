import mongoose from 'mongoose';
import {
  CancelationStatus,
  ICancellationRequestPopulatedBooking,
  IVendorScheduleBookingSummary,
} from '../../types/entities/booking.entity';

export interface CancellationRequestDetails {
  bookingId: string;
  bookingCode: string;
  userName: string;
  email: string;
  phoneNo: string;
  vendorName: string;
  startDate: Date;
  packageName: string;
  cancellationPolicy: CancellationPolicy | null;
  travelersCount: number;
  groupType: string;
  cancellationReason: string | null;
  updatedAt: Date;
  finalAmount: number;
  cancellationRefundAmount: number | null;
  cancelledAt: Date | null;
  cancellationRejectedReason: string | null;
}

export class BookingMapper {
  static toCancellationRequestDetails(
    booking: ICancellationRequestPopulatedBooking,
  ): CancellationRequestDetails {
    const pkg = booking.packageId;
    const rawPolicy = pkg?.cancellationPolicy;

    const cancellationPolicy: CancellationPolicy | null =
      rawPolicy !== null && rawPolicy !== undefined
        ? {
            id: rawPolicy._id?.toString() ?? '',
            key: rawPolicy.key ?? '',
            label: rawPolicy.label ?? '',
            rules: (rawPolicy.rules ?? []).map(
              (rule): CancellationRule => ({
                daysBeforeTrip: rule.daysBeforeTrip ?? 0,
                refundPercent: rule.refundPercent ?? 0,
              }),
            ),
            isActive: rawPolicy.isActive ?? false,
          }
        : null;

    return {
      bookingId: booking._id?.toString() ?? '',
      bookingCode: booking.bookingCode || '',
      userName: booking.userId?.name || '',
      email: booking.userId?.email || '',
      phoneNo: booking.userId?.phone || '',
      vendorName: booking.vendorId?.name || '',
      startDate: booking.scheduleId?.startDate,
      packageName: pkg?.title ?? '',
      cancellationPolicy,
      travelersCount: booking.travelerCount ?? 0,
      groupType: booking.groupType ?? 'SOLO',
      cancellationReason: booking.cancellationReason ?? null,
      updatedAt: booking.updatedAt,
      finalAmount: booking.finalAmount ?? 0,
      cancellationRefundAmount: booking.cancelationRefundAmount ?? null,
      cancellationRejectedReason: booking.cancellationRejectedReason ?? null,
      cancelledAt: booking.cancelledAt ?? null,
    };
  }

  static toDetailedResponse(booking: RawPopulatedBooking): BookingDetailDTO {
    const pkg = booking.packageId;

    const itinerary: ItineraryDayDTO[] = (pkg?.itinerary ?? [])
      .slice()
      .sort((a: RawItineraryDay, b: RawItineraryDay) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0))
      .map(
        (day: RawItineraryDay): ItineraryDayDTO => ({
          dayNumber: day.dayNumber ?? 0,
          title: day.title ?? null,
          activities: (day.activities ?? []).map(
            (act: RawActivity): ActivityDTO => ({
              startTime: act.startTime ?? null,
              endTime: act.endTime ?? null,
              title: act.title ?? null,
              description: act.description ?? null,
              location: act.location ?? null,
              specials: act.specials ?? [],
              included: act.included ?? false,
            }),
          ),
        }),
      );

    const rawCategory = pkg?.categoryId;

    const category: CategoryDTO | null =
      rawCategory !== null &&
      rawCategory !== undefined &&
      typeof rawCategory === 'object' &&
      '_id' in rawCategory &&
      'name' in rawCategory
        ? {
            id: (rawCategory as RawCategory)._id?.toString() ?? '',
            name: (rawCategory as RawCategory).name ?? '',
          }
        : null;

    const rawPolicy = pkg?.cancellationPolicy;

    const cancellationPolicy: CancellationPolicy | null =
      rawPolicy !== null &&
      rawPolicy !== undefined &&
      typeof rawPolicy === 'object' &&
      '_id' in rawPolicy &&
      'key' in rawPolicy
        ? {
            id: (rawPolicy as RawCancellationPolicy)._id?.toString() ?? '',
            key: (rawPolicy as RawCancellationPolicy).key ?? '',
            label: (rawPolicy as RawCancellationPolicy).label ?? '',
            rules: ((rawPolicy as RawCancellationPolicy).rules ?? []).map(
              (rule): CancellationRule => ({
                daysBeforeTrip: rule.daysBeforeTrip ?? 0,
                refundPercent: rule.refundPercent ?? 0,
              }),
            ),
            isActive: (rawPolicy as RawCancellationPolicy).isActive ?? false,
          }
        : null;

    const mappedPackage: PackageDTO = {
      id: pkg?._id?.toString() ?? '',
      title: pkg?.title ?? '',
      location: pkg?.location ?? '',
      state: pkg?.state ?? '',
      usp: pkg?.usp ?? '',
      days: pkg?.days ?? '',
      nights: pkg?.nights ?? '',
      difficultyLevel: pkg?.difficultyLevel ?? '',
      cancellationPolicy,
      inclusions: pkg?.inclusions ?? [],
      exclusions: pkg?.exclusions ?? [],
      packingList: pkg?.packingList ?? [],
      itinerary,
      category,
    };

    const sched = booking.scheduleId;

    const mappedSchedule: ScheduleDTO = {
      id: sched?._id?.toString() ?? '',
      startDate: sched?.startDate ?? '',
      endDate: sched?.endDate ?? '',
      reportingTime: sched?.reportingTime ?? '',
      reportingLocation: sched?.reportingLocation ?? '',
      notes: sched?.notes ?? null,
    };

    const vendor = booking.vendorId;

    const mappedVendor: VendorDTO = {
      id: vendor?._id?.toString() ?? '',
      name: vendor?.name ?? '',
    };

    // ── Travelers ───

    const travelers: TravelerDTO[] = (booking.travelers ?? [])
      .slice()
      .sort((a: RawTraveler, b: RawTraveler) => (b.isLead ? 1 : 0) - (a.isLead ? 1 : 0))
      .map(
        (t: RawTraveler): TravelerDTO => ({
          fullName: t.fullName ?? '',
          idType: t.idType ?? '',
          idNumber: t.idNumber ?? '',
          isLead: t.isLead ?? false,
          phoneNumber: t.phoneNumber || null,
          emailAddress: t.emailAddress || null,
          emergencyContact: t.emergencyContact || null,
          relation: t.relation || null,
        }),
      );

    // ── Financials ──────────
    const financials: FinancialsDTO = {
      grossAmount: booking.grossAmount ?? 0,
      discountAmount: booking.discountAmount ?? 0,
      walletAmountUsed: booking.walletAmountUsed ?? 0,
      finalAmount: booking.finalAmount ?? 0,
    };

    return {
      id: booking._id?.toString() ?? '',
      bookingCode: booking.bookingCode ?? '',
      userId: booking.userId?.toString() ?? '',

      package: mappedPackage,
      schedule: mappedSchedule,
      vendor: mappedVendor,

      groupType: booking.groupType ?? 'SOLO',
      travelerCount: booking.travelerCount ?? 0,
      travelers,

      financials,

      cancellationPolicy,

      paymentStatus: booking.paymentStatus ?? '',
      paymentMethod: booking.paymentMethod ?? null,
      transactionId: booking.transactionId ?? null,

      bookingStatus: booking.bookingStatus ?? '',
      cancellationReason: booking.cancellationReason ?? null,
      cancelledAt: booking.cancelledAt?.toISOString?.() ?? null,
      cancelledBy: booking.cancelledBy ?? null,
      cancellationStatus: booking.cancellationStatus ?? null,

      isAttended: booking.isAttended ?? false,
      attendedAt: booking.attendedAt?.toISOString?.() ?? null,
      hasReviewed: booking.hasReviewed ?? false,
      ticketUrl: booking.ticketUrl ?? null,
      chatId: null,

      createdAt: booking.createdAt?.toISOString?.() ?? '',
      updatedAt: booking.updatedAt?.toISOString?.() ?? '',
    };
  }

}

interface RawActivity {
  startTime?: string | null;
  endTime?: string | null;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  specials?: string[];
  included?: boolean;
}

interface RawItineraryDay {
  dayNumber?: number;
  title?: string | null;
  activities?: RawActivity[];
}

interface RawCategory {
  _id?: mongoose.Types.ObjectId;
  name?: string;
}

interface RawCancellationRule {
  daysBeforeTrip?: number;
  refundPercent?: number;
}

interface RawCancellationPolicy {
  _id?: mongoose.Types.ObjectId;
  key?: string;
  label?: string;
  rules?: RawCancellationRule[];
  isActive?: boolean;
}

interface RawPackage {
  _id?: mongoose.Types.ObjectId;
  title?: string;
  location?: string;
  state?: string;
  usp?: string;
  days?: string;
  nights?: string;
  difficultyLevel?: string;
  cancellationPolicy?: RawCancellationPolicy | mongoose.Types.ObjectId | null;
  inclusions?: string[];
  exclusions?: string[];
  packingList?: string[];
  itinerary?: RawItineraryDay[];
  categoryId?: RawCategory | mongoose.Types.ObjectId | null;
}

interface RawSchedule {
  _id?: mongoose.Types.ObjectId;
  startDate?: string;
  endDate?: string;
  reportingTime?: string;
  reportingLocation?: string;
  notes?: string | null;
}

interface RawVendor {
  _id?: mongoose.Types.ObjectId;
  name?: string;
}

interface RawTraveler {
  fullName?: string;
  idType?: string;
  idNumber?: string;
  isLead?: boolean;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  emergencyContact?: string | null;
  relation?: string | null;
}

export interface RawPopulatedBooking {
  _id?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  packageId?: RawPackage;
  scheduleId?: RawSchedule;
  vendorId?: RawVendor;
  bookingCode?: string;
  groupType?: 'SOLO' | 'DUO' | 'GROUP';
  travelerCount?: number;
  travelers?: RawTraveler[];
  grossAmount?: number;
  discountAmount?: number;
  walletAmountUsed?: number;
  finalAmount?: number;
  platformCommission?: number;
  vendorEarning?: number;
  couponId?: mongoose.Types.ObjectId | null;
  offerId?: mongoose.Types.ObjectId | null;
  paymentStatus?: string;
  paymentMethod?: string | null;
  transactionId?: string | null;
  bookingStatus?: string;
  cancellationStatus?: CancelationStatus | null;
  cancellationReason?: string | null;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  isAttended?: boolean;
  attendedAt?: Date | null;
  hasReviewed?: boolean;
  ticketUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// OUTPUT

export interface TravelerDTO {
  fullName: string;
  idType: string;
  idNumber: string;
  isLead: boolean;
  phoneNumber: string | null;
  emailAddress: string | null;
  emergencyContact: string | null;
  relation: string | null;
}

export interface ActivityDTO {
  startTime: string | null;
  endTime: string | null;
  title: string | null;
  description: string | null;
  location: string | null;
  specials: string[];
  included: boolean;
}

export interface ItineraryDayDTO {
  dayNumber: number;
  title: string | null;
  activities: ActivityDTO[];
}

export interface CategoryDTO {
  id: string;
  name: string;
}

export interface PackageDTO {
  id: string;
  title: string;
  location: string;
  state: string;
  usp: string;
  days: string;
  nights: string;
  difficultyLevel: string;
  cancellationPolicy: CancellationPolicy | null;
  inclusions: string[];
  exclusions: string[];
  packingList: string[];
  itinerary: ItineraryDayDTO[];
  category: CategoryDTO | null;
}

export interface CancellationRule {
  daysBeforeTrip: number;
  refundPercent: number;
}

export interface CancellationPolicy {
  id: string;
  key: string;
  label: string;
  rules: CancellationRule[];
  isActive: boolean;
}

export interface ScheduleDTO {
  id: string;
  startDate: string;
  endDate: string;
  reportingTime: string;
  reportingLocation: string;
  notes: string | null;
}

export interface VendorDTO {
  id: string;
  name: string;
}

export interface FinancialsDTO {
  grossAmount: number;
  discountAmount: number;
  walletAmountUsed: number;
  finalAmount: number;
}

export interface BookingDetailDTO {
  id: string;
  bookingCode: string;
  userId: string;

  package: PackageDTO;
  schedule: ScheduleDTO;
  vendor: VendorDTO;

  groupType: 'SOLO' | 'DUO' | 'GROUP';
  travelerCount: number;
  travelers: TravelerDTO[];

  financials: FinancialsDTO;

  cancellationPolicy: CancellationPolicy | null;

  paymentStatus: string;
  paymentMethod: string | null;
  transactionId: string | null;

  bookingStatus: string;
  cancellationStatus: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;

  isAttended: boolean;
  attendedAt: string | null;
  hasReviewed: boolean;
  ticketUrl: string | null;
  chatId: string | null;

  createdAt: string;
  updatedAt: string;
}



