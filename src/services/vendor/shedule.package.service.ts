import { ISchedulePackageService } from 'interfaces/service_interfaces/vendor/ISchedulePackage';
import { inject, injectable } from 'tsyringe';
import { ISchedulePackageRepository } from 'interfaces/repository_interfaces/ISchedulePackage';
import { CreateScheduleInputDTO } from 'types/dtos/vendor/request.dtos';
import { IBasePackageRepository } from 'interfaces/repository_interfaces/IBasePackageRepository';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { PACKAGE_STATUS } from '../../shared/constants/constants';
import { IPricingTier } from '../../types/entities/schedule.entity';
import { FilterType } from 'types/db';
import { ScheduleMapper } from '../../shared/mappers/schedule.mapper';
import { ScheduleListResponseDTO } from '../../types/common/IPaginationResponse';
import mongoose from 'mongoose';
import { ScheduleResponse } from '../../types/dtos/vendor/response.dtos';
@injectable()
export class SchedulePackageService implements ISchedulePackageService {
  constructor(
    @inject('ISchedulePackageRepository')
    private _schedulePackageRepository: ISchedulePackageRepository,
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
  ) {}

  private validateDateRange(startDate: Date, endDate: Date, packageDurationDays: number): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    //  Start must be at least 7 days in future
    const minStartDate = new Date(today);
    minStartDate.setDate(minStartDate.getDate() + 7);

    if (startDate < minStartDate) {
      throw new AppError(
        ERROR_MESSAGES.SCHEDULE_TRIP_ATLEAST_SEVEN_DAYS_BEFORE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // cannot schedule more than 4 months ahead
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 4);

    if (startDate > maxDate) {
      throw new AppError(
        ERROR_MESSAGES.CANNOT_SCHEDULE_TRIPS_FOUR_MONTH_IN_ADVANCE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    //  End date must come after start date
    if (endDate < startDate) {
      throw new AppError(ERROR_MESSAGES.END_DATE_MUST_AFTER_START_DATE, HTTP_STATUS.BAD_REQUEST);
    }

    // Duration must match package duration
    const expectedNights = packageDurationDays - 1;
    const actualNights = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (actualNights !== expectedNights) {
      throw new AppError(
        `Package duration is ${packageDurationDays} days (${expectedNights} nights) but selected dates span ${actualNights} nights.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  private buildPricing(pricingInput: CreateScheduleInputDTO['pricing']): IPricingTier[] {
    const tiers: IPricingTier[] = [];

    tiers.push({
      type: 'SOLO',
      peopleCount: 1,
      price: pricingInput.solo,
    });

    if (pricingInput.duo) {
      tiers.push({
        type: 'DUO',
        peopleCount: 2,
        price: pricingInput.duo,
      });
    }

    if (pricingInput.group) {
      tiers.push({
        type: 'GROUP',
        peopleCount: 4,
        price: pricingInput.group,
      });
    }

    return tiers;
  }

  async createSchedule(vendorId: string, data: CreateScheduleInputDTO): Promise<void> {
    const pkdId = toObjectId(data.packageId);
    const vendorObjId = toObjectId(vendorId);
    const pkg = await this._basePackageRepository.findOne({
      _id: pkdId,
      vendorId: vendorObjId,
    });

    if (!pkg) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (pkg.status !== PACKAGE_STATUS.PUBLISHED) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_PUBLISHED, HTTP_STATUS.BAD_REQUEST);
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    this.validateDateRange(startDate, endDate, Number(pkg.days));

    // Check for overlapping schedules on this same package
    // Two schedules for the same package cannot overlap
    const overlap = await this._schedulePackageRepository.findOverlapping(
      data.packageId,
      startDate,
      endDate,
    );
    if (overlap) {
      throw new AppError(
        `A schedule for this package already exists between ` +
          `${overlap.startDate.toDateString()} and ${overlap.endDate.toDateString()}. ` +
          `Dates cannot overlap.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    const pricing = this.buildPricing(data.pricing);

    await this._schedulePackageRepository.create({
      ...data,
      packageId: pkdId,
      vendorId: vendorObjId,
      pricing,
      startDate,
      endDate,
    });
  }

  //==========================================================
  async fetchVendorSchedules(
    vendorId: string,
    filters: FilterType,
  ): Promise<ScheduleListResponseDTO> {
      
    const [{ schedules, total }, statusCounts] = await Promise.all([
      this._schedulePackageRepository.findSchedulesWithPackage(filters, vendorId),
      this._schedulePackageRepository.getStatusCounts(vendorId),
    ]);
      
    return ScheduleMapper.toListResponse(
    schedules,
    total,
    filters.page,  
    filters.limit,  
    statusCounts,
   );
  }

  //=====================================================
  async getSchedule(scheduleId: string, vendorId: string): Promise<ScheduleResponse> {
      
    const schedule = await this._schedulePackageRepository.findOne({
        _id: new mongoose.Types.ObjectId(scheduleId),
        vendorId: new mongoose.Types.ObjectId(vendorId)
    })
    if (!schedule) {
      throw new AppError(ERROR_MESSAGES.SCHEDULE_NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }
    return ScheduleMapper.toResponse(schedule)
  }
}
