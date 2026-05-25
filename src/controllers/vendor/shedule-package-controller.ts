import { ISchedulePackageController } from '../../interfaces/controller_interfaces/vendor/IShedulePackageController';
import { inject, injectable } from 'tsyringe';
import { ISchedulePackageService } from '../../interfaces/service_interfaces/vendor/ISchedulePackage';
import expressAsyncHandler from 'express-async-handler';
import { CreateScheduleInputDTO } from '../../types/dtos/vendor/request.dtos';
import { IApiResponse } from '../../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { FilterType } from '../../types/db';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
import {
  ScheduleStatusResponseDTO,
  VendorScheduleBookingSummaryDTO,
} from '../../types/dtos/vendor/response.dtos';
import { ScheduleStatus } from '../../types/entities/schedule.entity';

@injectable()
export class ShedulePackageController implements ISchedulePackageController {
  constructor(
    @inject('ISchedulePackageService')
    private _shedulePackageService: ISchedulePackageService,
  ) {}

  createSchedule = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const packageId = req.params.packageId;

    const payload: CreateScheduleInputDTO = {
      ...req.body,
      packageId,
    };

    await this._shedulePackageService.createSchedule(vendorId, payload);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.SCHEDULE_CREATED_SUCCESSFULLY,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  fetchSchedules = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const filters: FilterType = {
      selectedFilter,
      search,
      page,
      limit,
      startDate,
      endDate,
    };

    const result = await this._shedulePackageService.fetchVendorSchedules(vendorId, filters);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.SCHEDULE_CREATED_SUCCESSFULLY,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getSchedule = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user!.id;
    const scheduleId = req.params.scheduleId;
    const schedule = await this._shedulePackageService.getSchedule(scheduleId, vendorId);

    const successResponse: IApiResponse<typeof schedule> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: schedule,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getVendorScheduleBookingSummary = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user?.id;
    const scheduleId = req.params.scheduleId as string;
    const summary = await this._shedulePackageService.getVendorScheduleBookingSummary(
      scheduleId,
      vendorId,
    );

    const successResponse: IApiResponse<VendorScheduleBookingSummaryDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: summary,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getScheduleBookings = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user!.id;
    const scheduleId = req.params.scheduleId as string;
    const { page, limit, search } = getPaginationOptions(req);
    const filter = req.query.filter as string | undefined;

    const bookings = await this._shedulePackageService.getScheduleBookings(
      scheduleId,
      vendorId,
      page,
      limit,
      search,
      filter,
    );

    const successResponse: IApiResponse<typeof bookings> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: bookings,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getScheduleBookingDetails = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user!.id;
    const scheduleId = req.params.scheduleId as string;
    const bookingId = req.params.bookingId as string;

    const bookingDetails = await this._shedulePackageService.getScheduleBookingDetails(
      scheduleId,
      bookingId,
      vendorId,
    );

    const successResponse: IApiResponse<typeof bookingDetails> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: bookingDetails,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  updateScheduleStatus = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user?.id;
    const scheduleId = req.params.scheduleId as string;
    const { status } = req.body as { status: ScheduleStatus };

    const result = await this._shedulePackageService.updateScheduleStatus(
      scheduleId,
      vendorId,
      status,
    );

    const successResponse: IApiResponse<ScheduleStatusResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.SCHEDULE_STATUS_UPDATED_SUCCESSFULLY,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
