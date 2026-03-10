import { ISchedulePackageController } from 'interfaces/controller_interfaces/vendor/IShedulePackageController';
import { inject, injectable } from 'tsyringe';
import { ISchedulePackageService } from '../../interfaces/service_interfaces/vendor/ISchedulePackage';
import expressAsyncHandler from 'express-async-handler';
import { CreateScheduleInputDTO } from '../../types/dtos/vendor/request.dtos';
import { IApiResponse } from '../../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';

@injectable()
export class ShedulePackageController implements ISchedulePackageController {
  constructor(
    @inject('ISchedulePackageService')
    private _shedulePackageService: ISchedulePackageService,
  ) {}

  createSchedule = expressAsyncHandler(async (req, res) => {
    const vendorId = '69439e51b6d3322aa5969240';
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
}
