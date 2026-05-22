import { IBaseRepository } from './IBaseRepository';
import {
  IWalletTransaction,
  TransactionStatus,
  TransactionType,
} from '../../types/entities/wallet.transaction.entity';
import { ClientSession } from 'mongoose';

export type WalletTransactionFilterType = 'credit' | 'debit' | 'all';

export interface IWalletTransactionRepository extends IBaseRepository<IWalletTransaction> {
  createTransaction(
    transaction: Partial<IWalletTransaction>,
    session: ClientSession,
  ): Promise<IWalletTransaction | null>;
  updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    session: ClientSession,
  ): Promise<IWalletTransaction | null>;
  findTransactionsByUserId(
    userId: string,
    filter: WalletTransactionFilterType,
    page: number,
    limit: number,
  ): Promise<{ transactions: IWalletTransaction[]; totalDocs: number }>;
  calculateTotalAmountByType(userId: string, type: TransactionType): Promise<number>;
}
