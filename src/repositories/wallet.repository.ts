import { ClientSession } from 'mongoose';
import { Wallet } from '../models/wallet.model';
import { IWallet } from '../types/entities/wallet.entity';
import { BaseRepository } from './base.repository';
import { IWalletRepository } from '../interfaces/repository_interfaces/IWalletRepository';

export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {
  constructor() {
    super(Wallet);
  }

  async createWallet(userId: string, session?: ClientSession): Promise<IWallet> {
    const [wallet] = await this.model.create([{ userId, balance: 0 }], { session });
    return wallet as IWallet;
  }

  async findWalletByUserId(userId: string, session?: ClientSession): Promise<IWallet | null> {
    const wallet = await this.model.findOne({ userId }).session(session || null);
    return wallet;
  }

  async incrementBalance(
    userId: string,
    amount: number,
    session: ClientSession,
  ): Promise<IWallet | null> {
    return this.model.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { session, new: true, runValidators: true },
    );
  }

  async decrementBalance(
    userId: string,
    amount: number,
    session: ClientSession,
  ): Promise<IWallet | null> {
    return this.model.findOneAndUpdate(
      { userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { session, new: true, runValidators: true },
    );
  }
}
