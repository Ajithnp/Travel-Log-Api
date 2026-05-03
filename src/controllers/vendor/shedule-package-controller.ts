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

@injectable()
export class ShedulePackageController implements ISchedulePackageController {
  constructor(
    @inject('ISchedulePackageService')
    private _shedulePackageService: ISchedulePackageService,
  ) {}

  createSchedule = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user?.id!;
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
    const vendorId = req.user?.id!;
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
}
