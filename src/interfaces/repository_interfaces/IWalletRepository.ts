import { IBaseRepository } from './IBaseRepository';
import { IWallet } from '../../types/entities/wallet.entity';
import { ClientSession } from 'mongoose';

export interface IWalletRepository extends IBaseRepository<IWallet> {
  createWallet(userId: string, session?: ClientSession): Promise<IWallet>;
  findWalletByUserId(userId: string, session?: ClientSession): Promise<IWallet | null>;
  incrementBalance(userId: string, amount: number, session: ClientSession): Promise<IWallet | null>;
  decrementBalance(userId: string, amount: number, session: ClientSession): Promise<IWallet | null>;
  getBalance(userId: string): Promise<number>;
}
