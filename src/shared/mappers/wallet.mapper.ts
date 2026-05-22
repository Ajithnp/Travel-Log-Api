import { TransactionDTO } from '../../interfaces/service_interfaces/user/IWalletService';
import { IWalletTransaction } from '../../types/entities/wallet.transaction.entity';

export class WalletMapper {
  static toTransactionDTO(transaction: IWalletTransaction): TransactionDTO {
    return {
      id: transaction._id.toString(),
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount.toFixed(2),
      description: transaction.description,
      referenceId: transaction.referenceId ?? '',
      createdAt: transaction.createdAt.toISOString(),
    };
  }

  static toTransactionDTOList(transactions: IWalletTransaction[]): TransactionDTO[] {
    return transactions.map(this.toTransactionDTO);
  }
}
