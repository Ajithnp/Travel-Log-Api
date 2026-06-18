import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { inject, injectable } from 'tsyringe';
import { ChartDataPoint, DashboardAnalyticsResponseDTO, IVendorService, RecentBookingActivityResponseDTO, VendorDashBoardStatsDTO } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { Types } from 'mongoose';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { VendorProfileResponseDTO } from '../../types/dtos/vendor/response.dtos';
import { IFileStorageHandlerService } from '../../interfaces/service_interfaces/IFileStorageBusinessService';
import { UpdateProfileLogoRequestDTO } from '../../validators/vendor/profile.validation';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { getDateRange, getGranularity } from '../../shared/utils/date.helper';
import { IPayoutRepository } from '../../interfaces/repository_interfaces/IPayoutRepository';
import { IBookingRepository } from '../../interfaces/repository_interfaces/IBookingRepository';
import { BOOKING_STATUS } from '../../shared/constants/booking';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { ISchedulePackageRepository } from '../../interfaces/repository_interfaces/ISchedulePackage';
import { PACKAGE_STATUS } from '../../shared/constants/constants';

@injectable()
export class VendorService implements IVendorService {
  constructor(
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
    @inject('IFileStorageHandlerService')
    private _fileStorage: IFileStorageHandlerService,
    @inject('IPayoutRepository')
    private _payoutRepository: IPayoutRepository,
    @inject('IBookingRepository')
    private _bookingRepository: IBookingRepository,
    @inject('IBasePackageRepository')
    private _packageRepository: IBasePackageRepository,
    @inject('ISchedulePackageRepository')
    private _scheduleRepository: ISchedulePackageRepository,
  ) { }

  async profile(userId: string): Promise<VendorProfileResponseDTO> {
    const vendorDoc = await this._vendorInfoRepository.findVendorWithUserId(userId);

    if (
      !vendorDoc ||
      vendorDoc.status === VENDOR_VERIFICATION_STATUS.PENDING ||
      vendorDoc.status === VENDOR_VERIFICATION_STATUS.REJECTED
    ) {
      const userDoc = await this._userRepository.findById(userId);

      if (!userDoc) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

      return {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        role: userDoc.role,
        profileLogo: null,
        businessAddress: null,
        contactPersonName: null,
        isProfileVerified: false,
        status: vendorDoc?.status ? vendorDoc.status : VENDOR_VERIFICATION_STATUS.PENDING,
        reasonForReject: vendorDoc?.reasonForReject ? vendorDoc.reasonForReject : '',
        createdAt: userDoc.createdAt,
      };
    }

    return {
      id: (vendorDoc._id as Types.ObjectId).toString(),
      name: vendorDoc.userId.name,
      email: vendorDoc.userId.email,
      phone: vendorDoc.userId.phone,
      role: vendorDoc.userId.role,
      profileLogo: vendorDoc.documents?.profileLogo?.key,
      businessAddress: vendorDoc.businessInfo?.businessAddress,
      contactPersonName: vendorDoc.businessInfo?.contactPersonName,
      isProfileVerified: vendorDoc.isProfileVerified,
      userId: (vendorDoc.userId?._id as Types.ObjectId).toString(),
      status: vendorDoc.status,
      reasonForReject: vendorDoc?.reasonForReject ? vendorDoc.reasonForReject : '',
      createdAt: vendorDoc?.createdAt,
    };
  }

  async updateProfileLogo(vendorId: string, payload: UpdateProfileLogoRequestDTO): Promise<void> {
    const vendorDoc = await this._vendorInfoRepository.findVendorWithUserId(vendorId);
    if (!vendorDoc) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (vendorDoc.documents?.profileLogo?.key) {
      await this._fileStorage.deleteFile(vendorDoc.documents?.profileLogo.key);
    }

    const file = payload.files[0];
    await this._vendorInfoRepository.findByIdAndUpdate(payload.vendorInfoId, {
      'documents.profileLogo': {
        key: file.key,
        fieldName: 'companyLogo',
      },
    });
  };

  async getSummaryStats(vendorId: string): Promise<VendorDashBoardStatsDTO> {

    const vendor = await this._userRepository.findOne({ _id: toObjectId(vendorId) });
    if (!vendor) throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const [revanueStats, totalBookings, totalPackages, scheduleStats] = await Promise.all([
      this._payoutRepository.revenueStatsByVendor(vendorId),
      this._bookingRepository.countDocuments({ vendorId: vendorId, bookingStatus: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CONFIRMED] } }),
      this._packageRepository.countDocuments({ vendorId: vendorId, status: PACKAGE_STATUS.PUBLISHED, isActive: true }),
      this._scheduleRepository.scheduledStatsByVendor(vendorId),

    ])
    return {
      revanueStats,
      totalBookings,
      totalPackages,
      scheduleStats,
    }
  };

  async getDashboardAnalytics(vendorId: string, period: string, customFrom?: Date, customTo?: Date): Promise<DashboardAnalyticsResponseDTO> {
    const { from, now } = getDateRange(period, customFrom, customTo);
    const granularity = getGranularity(from, now, period);
    
    const [rawTrend, bookingsByPackage] = await Promise.all([
      this._bookingRepository.getAnalytics(vendorId, from, now, granularity),
      this._bookingRepository.getTopPerformingPackages(vendorId)
    ]);

    const trend: ChartDataPoint[] = rawTrend.map((r) => ({
      date: r._id,
      bookings: r.count,
      revenue: Math.round(r.revenue),
    }));

    return {
      granularity,
      trend,
      bookingsByPackage: bookingsByPackage
    };
  }

  async dashboardRecentActivity(vendorId: string): Promise<RecentBookingActivityResponseDTO> {

    const [bookings, schedules] = await Promise.all([
      this._bookingRepository.getRecentActivity(vendorId),
      this._scheduleRepository.getUpcomingSchedules(vendorId),
    ]);

    return {
      bookings,
      schedules
    };
  }


}
