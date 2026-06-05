import { BaseRepository } from './base.repository';
import {
  IWalletTransactionRepository,
  WalletTransactionFilterType,
} from '../interfaces/repository_interfaces/IWalletTransactionRepository';
import { IWalletTransaction, TransactionType } from '../types/entities/wallet.transaction.entity';
import { ClientSession, FilterQuery, Types } from 'mongoose';
import { WalletTransaction } from '../models/wallet-tansaction.model';
import { TRANSACTION_TYPE } from '../shared/constants/wallet';

export class WalletTransactionRepository
  extends BaseRepository<IWalletTransaction>
  implements IWalletTransactionRepository
{
  constructor() {
    super(WalletTransaction);
  }

  async createTransaction(
    transaction: Partial<IWalletTransaction>,
    session?: ClientSession,
  ): Promise<IWalletTransaction | null> {
    const [createdTransaction] = await this.model.create([transaction], { session });
    return createdTransaction;
  }

  async updateTransactionStatus(
    transactionId: string,
    status: string,
    session: ClientSession,
  ): Promise<IWalletTransaction | null> {
    return this.model.findByIdAndUpdate(
      transactionId,
      { $set: { status } },
      { session, new: true, runValidators: true },
    );
  }

  async findTransactionsByUserId(
    userId: string,
    filter: WalletTransactionFilterType,
    page: number,
    limit: number,
  ): Promise<{ transactions: IWalletTransaction[]; totalDocs: number }> {
    const query: FilterQuery<IWalletTransaction> = { userId };

    if (filter === TRANSACTION_TYPE.CREDIT) {
      query.type = TRANSACTION_TYPE.CREDIT;
    } else if (filter === TRANSACTION_TYPE.DEBIT) {
      query.type = TRANSACTION_TYPE.DEBIT;
    } else if (filter === 'all') {
      query.type = { $in: [TRANSACTION_TYPE.CREDIT, TRANSACTION_TYPE.DEBIT] };
    }

    const skip = (page - 1) * limit;

    const [transactions, totalDocs] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(query),
    ]);

    return { transactions: transactions as IWalletTransaction[], totalDocs };
  }

  async calculateTotalAmountByType(userId: string, type: TransactionType): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { userId: new Types.ObjectId(userId), type, status: { $ne: 'failed' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }
}
