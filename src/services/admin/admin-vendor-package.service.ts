import { inject, injectable } from 'tsyringe';
import {
  IAdminVendorPackageOversightService,
  PackagesOversightResponseDTO,
  PackageScheduleResponseDTO,
  AdminPackageDetailsResponseDTO,
  ScheduleStatsResponseDTO,
  SchedulesResponseDTO,
} from '../../interfaces/service_interfaces/admin/IAdminVendorPackageService';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { ISchedulePackageRepository } from '../../interfaces/repository_interfaces/ISchedulePackage';
import { PaginatedData } from '../../types/common/IPaginationResponse';
import { PACKAGE_STATUS, SCHEDULE_STATUS } from '../../shared/constants/constants';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ScheduleStatus } from 'types/entities/schedule.entity';

@injectable()
export class AdminVendorPackageOversightService implements IAdminVendorPackageOversightService {
  constructor(
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
    @inject('ISchedulePackageRepository')
    private _schedulePackageRepository: ISchedulePackageRepository,
  ) {}

  async getPackages(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PackagesOversightResponseDTO> {
    const [{ packages, total }, totalPublished] = await Promise.all([
      this._basePackageRepository.getPackagesOversight(page, limit, search),
      this._basePackageRepository.countDocuments({
        status: PACKAGE_STATUS.PUBLISHED,
        isDeleted: false,
      }),
    ]);

    return {
      data: packages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocs: total,
      totalPublished,
    };
  }

  async getPackageDetails(packageId: string): Promise<AdminPackageDetailsResponseDTO> {
    const data = await this._basePackageRepository.getPackageDetails(packageId);
    if (!data) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return data;
  }

  async getPackageSchedules(
    packageId: string,
    page: number,
    limit: number,
    filter?: ScheduleStatus,
  ): Promise<PaginatedData<PackageScheduleResponseDTO>> {
    const { schedules, total } = await this._schedulePackageRepository.getPackageSchedules(
      packageId,
      page,
      limit,
      filter,
    );

    return {
      data: schedules,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocs: total,
    };
  }

  async getPackageScheduleStats(): Promise<ScheduleStatsResponseDTO> {
    const [totalSchedules, upcomingSchedules, completedSchedules, soldOutSchedules] =
      await Promise.all([
        this._schedulePackageRepository.countDocuments({}),
        this._schedulePackageRepository.countDocuments({ status: SCHEDULE_STATUS.UPCOMING }),
        this._schedulePackageRepository.countDocuments({ status: SCHEDULE_STATUS.COMPLETED }),
        this._schedulePackageRepository.countDocuments({ status: SCHEDULE_STATUS.SOLD_OUT }),
      ]);

    return {
      totalSchedules,
      upcomingSchedules,
      completedSchedules,
      soldOutSchedules,
    };
  }

  async getSchedules(
    page: number,
    limit: number,
    filter?: ScheduleStatus,
    search?: string,
  ): Promise<PaginatedData<SchedulesResponseDTO>> {
    const { schedules, total } = await this._schedulePackageRepository.getSchedulesAll(
      page,
      limit,
      filter,
      search,
    );

    return {
      data: schedules,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocs: total,
    };
  }
}
