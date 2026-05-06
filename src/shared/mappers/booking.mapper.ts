import mongoose from 'mongoose';

export class BookingMapper {
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

    // category====

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

    const mappedPackage: PackageDTO = {
      id: pkg?._id?.toString() ?? '',
      title: pkg?.title ?? '',
      location: pkg?.location ?? '',
      state: pkg?.state ?? '',
      usp: pkg?.usp ?? '',
      days: pkg?.days ?? '',
      nights: pkg?.nights ?? '',
      difficultyLevel: pkg?.difficultyLevel ?? '',
      cancellationPolicy: pkg?.cancellationPolicy ?? '',
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

    // ── Vendor ────────
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

    // ── Final DTO ─────
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

      paymentStatus: booking.paymentStatus ?? '',
      paymentMethod: booking.paymentMethod ?? null,
      transactionId: booking.transactionId ?? null,

      bookingStatus: booking.bookingStatus ?? '',
      cancellationReason: booking.cancellationReason ?? null,
      cancelledAt: booking.cancelledAt?.toISOString?.() ?? null,
      cancelledBy: booking.cancelledBy ?? null,

      isAttended: booking.isAttended ?? false,
      attendedAt: booking.attendedAt?.toISOString?.() ?? null,
      hasReviewed: booking.hasReviewed ?? false,
      ticketUrl: booking.ticketUrl ?? null,

      createdAt: booking.createdAt?.toISOString?.() ?? '',
      updatedAt: booking.updatedAt?.toISOString?.() ?? '',
    };
  }
}

// INPUTS

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

interface RawPackage {
  _id?: mongoose.Types.ObjectId;
  title?: string;
  location?: string;
  state?: string;
  usp?: string;
  days?: string;
  nights?: string;
  difficultyLevel?: string;
  cancellationPolicy?: string;
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
  cancellationPolicy: string;
  inclusions: string[];
  exclusions: string[];
  packingList: string[];
  itinerary: ItineraryDayDTO[];
  category: CategoryDTO | null;
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

  paymentStatus: string;
  paymentMethod: string | null;
  transactionId: string | null;

  bookingStatus: string;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;

  isAttended: boolean;
  attendedAt: string | null;
  hasReviewed: boolean;
  ticketUrl: string | null;

  createdAt: string;
  updatedAt: string;
}
