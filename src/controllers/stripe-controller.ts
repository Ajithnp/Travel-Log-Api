import { inject, injectable } from "tsyringe";
import expressAsyncHandler from "express-async-handler";
import { HTTP_STATUS, SUCCESS_STATUS } from "../shared/constants/http_status_code";
import { IStripeController } from "../interfaces/controller_interfaces/IPaymentController";
import { Request, Response } from "express";
import { IApiResponse } from "../types/common/IApiResponse";
import { IStripeService } from "../interfaces/service_interfaces/IStripeService";
import { SUCCESS_MESSAGES } from "../shared/constants/messages";


@injectable()
export class StripeController implements IStripeController {
  constructor(
    @inject('IStripeService')
    private _stripeService: IStripeService,
  ) {}

  initiateStripeOnboarding = expressAsyncHandler(async (req:Request, res:Response) => {
    const vendorId = req.user!.id;
  const result = await this._stripeService.createOnboardingLink(vendorId);

  const successResponse: IApiResponse<typeof result> = {
    success: SUCCESS_STATUS.SUCCESS,
    message: SUCCESS_MESSAGES.OK,
    data: result,
  };
  res.status(HTTP_STATUS.OK).json(successResponse);
});

getStripeOnboardingStatus = expressAsyncHandler(async (req:Request, res:Response) => {
  const vendorId = req.user!.id;
  const result = await this._stripeService.getStripeOnboardingStatus(vendorId);

  const successResponse: IApiResponse<typeof result> = {
    success: SUCCESS_STATUS.SUCCESS,
    message: SUCCESS_MESSAGES.OK,
    data: result,
  };
  res.status(HTTP_STATUS.OK).json(successResponse);
});
}
