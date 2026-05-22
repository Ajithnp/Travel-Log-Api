import { IMessage } from '../../types/entities/message.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IMessageRepository extends IBaseRepository<IMessage> {
  findMessagesByChatId(
    chatId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<{ messages: IMessage[]; hasMore: boolean; nextCursor: string | null }>;

  createTextMessage(data: {
    chatId: string;
    senderId: string;
    senderRole: 'user' | 'vendor';
    senderName: string;
    content: string;
  }): Promise<IMessage>;

  getLastMessage(chatId: string): Promise<IMessage | null>;

  deleteMessage(messageId: string): Promise<boolean>;

  getMessageUnreadCount(
    chatId: string,
    senderRole: 'user' | 'vendor',
    lastReadAt: Date,
  ): Promise<number>;
}
