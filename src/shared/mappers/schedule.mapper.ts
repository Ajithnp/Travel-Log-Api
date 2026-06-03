import {
  ISchedulePopulated,
  IPricingTier,
  ISchedule,
  ISchedulePopulatedPacakge,
} from '../../types/entities/schedule.entity';
import {
  ScheduleListItemDTO,
  PricingTierDTO,
  ScheduleResponse,
  VendorScheduleBookingSummaryDTO,
} from '../../types/dtos/vendor/response.dtos';
import { SCHEDULE_STATUS } from '../../shared/constants/constants';
import { ScheduleListResponseDTO } from '../../types/common/IPaginationResponse';
import { PublicScheduleDTO } from '../../types/dtos/user/response.dtos';
import {
  IVendorScheduleBookingSummary,
  IScheduleBookingPopulated,
  ScheduleBookingListResult,
  IScheduleBookingSinglePopulated,
} from 'types/entities/booking.entity';
import {
  ScheduleBookingDetailDTO,
  ScheduleBookingSingleDetailDTO,
} from '../../types/dtos/vendor/response.dtos';
import { PaginatedData } from '../../types/common/IPaginationResponse';
import { TravelerDTO } from './booking.mapper';

export class ScheduleMapper {
  static mapPricing = (tier: IPricingTier): PricingTierDTO => ({
    type: tier.type,
    peopleCount: tier.peopleCount,
    price: tier.price,
  });

  static toListItem(schedule: ISchedulePopulated): ScheduleListItemDTO {
    const soloPricing =
      schedule.pricing.find((p: IPricingTier) => p.type === 'SOLO')?.price ?? null;

    return {
      scheduleId: schedule._id.toString(),
      packageId: schedule.packageId._id.toString(),
      packageTitle: schedule.packageId.title ?? '',
      packageDays: schedule.packageId.days ?? '',
      difficultyLevel: schedule.packageId.difficultyLevel ?? '',
      startDate: schedule.startDate.toISOString(),
      endDate: schedule.endDate.toISOString(),
      reportingTime: schedule.reportingTime,
      reportingLocation: schedule.reportingLocation,
      pricing: schedule.pricing.map(ScheduleMapper.mapPricing),
      soloPricing, // convenience for UI
      totalSeats: schedule.totalSeats,
      seatsBooked: schedule.seatsBooked,
      seatsRemaining: schedule.totalSeats - schedule.seatsBooked,
      status: schedule.status,
      notes: schedule.notes ?? null,
    };
  }

  static toListResponse(
    schedules: ISchedulePopulated[],
    total: number,
    page: number,
    limit: number,
    statusCounts: Record<string, number>,
  ): ScheduleListResponseDTO {
    return {
      data: schedules.map(ScheduleMapper.toListItem),
      totalDocs: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      statusCounts: {
        upcoming: statusCounts[SCHEDULE_STATUS.UPCOMING] ?? 0,
        ongoing: statusCounts[SCHEDULE_STATUS.ONGOING] ?? 0,
        completed: statusCounts[SCHEDULE_STATUS.COMPLETED] ?? 0,
        cancelled: statusCounts[SCHEDULE_STATUS.CANCELLED] ?? 0,
        soldOut: statusCounts[SCHEDULE_STATUS.SOLD_OUT] ?? 0,
      },
    };
  }

  static toResponse(schedule: ISchedule): ScheduleResponse {
    return {
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      reportingTime: schedule.reportingTime,
      reportingLocation: schedule.reportingLocation,
      pricing: schedule.pricing.map(ScheduleMapper.mapPricing),
      totalSeats: schedule.totalSeats,
      seatsBooked: schedule.seatsBooked,
      seatsRemaining: schedule.totalSeats - schedule.seatsBooked,
      notes: schedule.notes ?? null,
      status: schedule.status,
      cancellationReason: schedule.cancellationReason ?? null,
      cancelledAt: schedule.cancelledAt ?? null,
      cancelledBookings: schedule.cancelledBookings ?? null,
      totalRefunded: schedule.totalRefunded ?? null,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  static toPublicSchedule(schedule: ISchedule): PublicScheduleDTO {
    return {
      scheduleId: schedule._id.toString(),
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      status: schedule.status,
      seatsRemaining: schedule.totalSeats - schedule.seatsBooked,
      pricing: schedule.pricing.map((tier) => ({
        type: tier.type,
        peopleCount: tier.peopleCount,
        price: tier.price,
      })),
      reportingLocation: schedule.reportingLocation,
      reportingTime: schedule.reportingTime,
    };
  }

  static toBookingSummaryResponse(
    schedule: ISchedulePopulatedPacakge,
    stats: IVendorScheduleBookingSummary,
  ): VendorScheduleBookingSummaryDTO {
    return {
      scheduleId: schedule._id.toString(),
      packageTitle: schedule.packageId.title,
      packageLocation: schedule.packageId.location,
      packageState: schedule.packageId.state,
      basePrice: schedule.packageId.basePrice,
      startDate: schedule.startDate.toISOString(),
      endDate: schedule.endDate.toISOString(),
      reportingTime: schedule.reportingTime,
      reportingLocation: schedule.reportingLocation,
      totalSeats: schedule.totalSeats,
      scheduleStatus: schedule.status,
      totalConfirmedBookings: stats.totalConfirmedBookings,
      totalCancelledBookings: stats.totalCancelledBookings,
      totalConfirmedAmount: stats.totalConfirmedAmount,
      totalCancelledAmount: stats.totalCancelledAmount,
      totalVendorEarning: stats.totalVendorEarning,
      totalPlatformCommission: stats.totalPlatformCommission,
    };
  }

  static toScheduleBookingDetail(booking: IScheduleBookingPopulated): ScheduleBookingDetailDTO {
    return {
      id: booking._id.toString(),
      username: booking.userId?.name ?? '',
      bookingCode: booking.bookingCode,
      groupType: booking.groupType,
      travallersCount: booking.travelerCount,
      finalAmount: booking.finalAmount,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      bookedOn: booking.createdAt.toISOString(),
    };
  }

  static toScheduleBookingListResponse(
    result: ScheduleBookingListResult,
    page: number,
    limit: number,
  ): PaginatedData<ScheduleBookingDetailDTO> {
    return {
      data: result.bookings.map(ScheduleMapper.toScheduleBookingDetail),
      totalDocs: result.total,
      currentPage: page,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  static toScheduleBookingSingleDetail(
    booking: IScheduleBookingSinglePopulated,
  ): ScheduleBookingSingleDetailDTO {
    const travelers: TravelerDTO[] = (booking.travelers ?? [])
      .slice()
      .sort((a, b) => (b.isLead ? 1 : 0) - (a.isLead ? 1 : 0))
      .map(
        (t): TravelerDTO => ({
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

    return {
      id: booking._id.toString(),
      username: booking.userId?.name ?? '',
      bookingCode: booking.bookingCode,
      groupType: booking.groupType,
      paymentMethod: booking.paymentMethod ?? null,
      bookedOn: booking.createdAt?.toISOString?.() ?? String(booking.createdAt),
      finalAmount: booking.finalAmount,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      travelers,
    };
  }
}
