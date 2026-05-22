import { injectable } from 'tsyringe';
import { MessageModel } from '../models/message.model';
import { BaseRepository } from './base.repository';
import { IMessage } from '../types/entities/message.entity';
import { IMessageRepository } from '../interfaces/repository_interfaces/IMessage.repository';
import { FilterQuery, Types } from 'mongoose';

@injectable()
export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
  constructor() {
    super(MessageModel);
  }
  // cursor based pagination
  async findMessagesByChatId(
    chatId: string,
    cursor?: string,
    limit: number = 10,
  ): Promise<{ messages: IMessage[]; hasMore: boolean; nextCursor: string | null }> {
    const query: FilterQuery<IMessage> = { chatId };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const messages = await this.model
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();
    const result = messages.reverse();
    const nextCursor = hasMore ? result[0]._id.toString() : null;
    return {
      messages: result,
      hasMore,
      nextCursor,
    };
  }

  async createTextMessage(data: {
    chatId: string;
    senderRole: 'user' | 'vendor';
    senderName: string;
    content: string;
  }): Promise<IMessage> {
    return this.create({
      ...data,
      chatId: new Types.ObjectId(data.chatId),
    });
  }

  async getLastMessage(chatId: string): Promise<IMessage | null> {
    return this.model.findOne({ chatId }).sort({ createdAt: -1 }).lean();
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: messageId });
    return result.deletedCount === 1;
  }

  async getMessageUnreadCount(
    chatId: string,
    senderRole: 'user' | 'vendor',
    lastReadAt: Date,
  ): Promise<number> {
    return await this.countDocuments({
      chatId,
      senderRole,
      createdAt: { $gt: lastReadAt },
    });
  }
}
