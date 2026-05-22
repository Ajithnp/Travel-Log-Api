import { inject, injectable } from 'tsyringe';
import {
  IWalletService,
  WalletDetailsResponseDTO,
} from '../../interfaces/service_interfaces/user/IWalletService';
import { IWalletRepository } from '../../interfaces/repository_interfaces/IWalletRepository';
import {
  IWalletTransactionRepository,
  WalletTransactionFilterType,
} from '../../interfaces/repository_interfaces/IWalletTransactionRepository';
import { TRANSACTION_TYPE } from '../../shared/constants/wallet';
import { WalletMapper } from '../../shared/mappers/wallet.mapper';
import { ClientSession } from 'mongoose';
import { AppError } from 'errors/AppError';
import { ERROR_MESSAGES } from 'shared/constants/messages';
import { HTTP_STATUS } from 'shared/constants/http_status_code';

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject('IWalletRepository')
    private _walletRepository: IWalletRepository,
    @inject('IWalletTransactionRepository')
    private _walletTransactionRepository: IWalletTransactionRepository,
  ) {}

  async getWalletDetails(
    userId: string,
    filter: WalletTransactionFilterType,
    page: number,
    limit: number,
  ): Promise<WalletDetailsResponseDTO> {
    let wallet = await this._walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      wallet = await this._walletRepository.createWallet(userId);
    }
    const balance = wallet.balance || 0;

    const [totalCredit, totalDebit, paginatedResult] = await Promise.all([
      this._walletTransactionRepository.calculateTotalAmountByType(userId, TRANSACTION_TYPE.CREDIT),
      this._walletTransactionRepository.calculateTotalAmountByType(userId, TRANSACTION_TYPE.DEBIT),
      this._walletTransactionRepository.findTransactionsByUserId(userId, filter, page, limit),
    ]);

    return {
      balance,
      totalCredit,
      totalDebit,
      transactions: {
        data: WalletMapper.toTransactionDTOList(paginatedResult.transactions),
        currentPage: page,
        totalPages: Math.ceil(paginatedResult.totalDocs / limit),
        totalDocs: paginatedResult.totalDocs,
      },
    };
  }

  async getWalletBalance(userId: string): Promise<{ balance: number }> {
    let wallet = await this._walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      wallet = await this._walletRepository.createWallet(userId);
    }
    return { balance: wallet.balance || 0 };
  }

  async deductBalance(
    userId: string,
    amount: number,
    description: string,
    session: ClientSession,
    referenceId?: string,
  ): Promise<void> {
    const wallet = await this._walletRepository.findWalletByUserId(userId, session);
    if (!wallet) {
      throw new AppError(ERROR_MESSAGES.WALLET_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }

    if (wallet.balance < amount) {
      throw new AppError(ERROR_MESSAGES.INSUFFICIENT_WALLET_BALANCE, HTTP_STATUS.BAD_REQUEST);
    }
    await this._walletRepository.decrementBalance(userId, amount, session);
    await this._walletTransactionRepository.createTransaction(
      {
        walletId: wallet._id as any,
        userId: userId as any,
        type: TRANSACTION_TYPE.DEBIT,
        amount,
        description,
        referenceId,
        status: 'success',
      },
      session,
    );
  }
}
