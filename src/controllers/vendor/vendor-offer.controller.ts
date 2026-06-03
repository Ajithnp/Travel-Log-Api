import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import expressAsyncHandler from 'express-async-handler';
import { IVendorOfferController } from '../../interfaces/controller_interfaces/vendor/IVendorOfferController';
import {
  CreateOfferRequestDTO,
  IVendorOfferService,
} from '../../interfaces/service_interfaces/vendor/IVendorOfferService';
import { SERVICE_TOKENS } from '../../shared/constants/di.tokens';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { IApiResponse } from '../../types/common/IApiResponse';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';

@injectable()
export class VendorOfferController implements IVendorOfferController {
  constructor(
    @inject(SERVICE_TOKENS.VENDOR_OFFER_SERVICE)
    private _offerService: IVendorOfferService,
  ) {}

  createOffer = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.id as string;
    await this._offerService.createOffer(vendorId, req.body as CreateOfferRequestDTO);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OFFER_CREATED_SUCCESSFULLY,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  getOffers = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.id as string;
    const { page, limit, search } = getPaginationOptions(req);
    const activeFilter = req.query.isActive as string | undefined;
    const isActive = activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined;

    const result = await this._offerService.getVendorOffers(vendorId, {
      page,
      limit,
      search,
      isActive,
    });

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  deactivateOffer = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.id as string;
    const offerId = req.params.offerId;

    await this._offerService.deactivateOffer(vendorId, offerId);

    const successResponse: IApiResponse<null> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: 'Offer deactivated successfully',
      data: null,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
