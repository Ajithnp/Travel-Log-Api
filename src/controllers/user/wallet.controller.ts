import { Request, RequestHandler, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IWalletController } from '../../interfaces/controller_interfaces/user/IWalletController';
import {
  IWalletService,
  WalletDetailsResponseDTO,
  WalletBalanceResponseDTO,
} from '../../interfaces/service_interfaces/user/IWalletService';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { IApiResponse } from '../../types/common/IApiResponse';
import expressAsyncHandler from 'express-async-handler';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
import { WalletTransactionFilterType } from 'interfaces/repository_interfaces/IWalletTransactionRepository';

@injectable()
export class WalletController implements IWalletController {
  constructor(
    @inject('IWalletService')
    private _walletService: IWalletService,
  ) {}

  getWallet: RequestHandler = expressAsyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { page, limit } = getPaginationOptions(req);
    const filter = req.query.filter as WalletTransactionFilterType;
    const walletDetails = await this._walletService.getWalletDetails(userId, filter, page, limit);
    const response: IApiResponse<WalletDetailsResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: walletDetails,
    };
    res.status(HTTP_STATUS.OK).json(response);
  });

  getWalletBalance: RequestHandler = expressAsyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const balanceInfo = await this._walletService.getWalletBalance(userId);
    const response: IApiResponse<WalletBalanceResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: balanceInfo,
    };
    res.status(HTTP_STATUS.OK).json(response);
  });
}
