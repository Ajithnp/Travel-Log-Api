import {
  TransactionStatus,
  TransactionType,
} from '../../../types/entities/wallet.transaction.entity';
import { PaginatedData } from '../../../types/common/IPaginationResponse';
import { WalletTransactionFilterType } from 'interfaces/repository_interfaces/IWalletTransactionRepository';
import { ClientSession } from 'mongoose';

export interface TransactionDTO {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  description: string;
  referenceId: string;
  createdAt: string;
}

export interface WalletDetailsResponseDTO {
  balance: number;
  totalCredit: number;
  totalDebit: number;
  totalReward: number;
  transactions: PaginatedData<TransactionDTO>;
}

export interface WalletBalanceResponseDTO {
  balance: number;
}

export interface IWalletService {
  getWalletDetails(
    userId: string,
    filter: WalletTransactionFilterType,
    page: number,
    limit: number,
  ): Promise<WalletDetailsResponseDTO>;

  getWalletBalance(userId: string): Promise<WalletBalanceResponseDTO>;

  deductBalance(
    userId: string,
    amount: number,
    description: string,
    session: ClientSession,
    referenceId?: string,
  ): Promise<void>;
}
