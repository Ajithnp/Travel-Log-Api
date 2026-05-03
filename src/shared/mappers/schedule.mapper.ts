import { ISchedulePopulated, IPricingTier, ISchedule } from '../../types/entities/schedule.entity';
import {
  ScheduleListItemDTO,
  PricingTierDTO,
  ScheduleResponse,
} from '../../types/dtos/vendor/response.dtos';
import { SCHEDULE_STATUS } from '../../shared/constants/constants';
import { ScheduleListResponseDTO } from '../../types/common/IPaginationResponse';
import { PublicScheduleDTO } from '../../types/dtos/user/response.dtos';

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
    };
  }
}
