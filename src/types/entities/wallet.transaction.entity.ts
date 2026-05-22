import { Document, Types } from 'mongoose';
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '../../shared/constants/wallet';

export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

export interface IWalletTransaction extends Document {
  _id: Types.ObjectId;
  walletId: Types.ObjectId;
  userId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  createdAt: Date;
}
