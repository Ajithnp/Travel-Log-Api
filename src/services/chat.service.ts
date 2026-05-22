import { inject, injectable } from 'tsyringe';
import { IChatRepository } from '../interfaces/repository_interfaces/IChatRepository';
import { IMessageRepository } from '../interfaces/repository_interfaces/IMessage.repository';
import {
  ChatMemberDetailDTO,
  ChatRoomDTO,
  ChatRoomWithPreviewDTO,
  IChatService,
  MessageDTO,
  PaginatedMessagesDTO,
} from '../interfaces/service_interfaces/IChatService';
import { Types } from 'mongoose';
import { USER_ROLES } from '../shared/constants/roles';
import { ChatMapper } from '../shared/mappers/chat.mapper';
import { chatEmitter } from '../infrastructure/socket/namespaces/chat-emitter';
import logger from '../config/logger';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { AppError } from '../errors/AppError';
import { toObjectId } from '../shared/utils/database/objectId.helper';

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject('IChatRepository')
    private _chatRepo: IChatRepository,
    @inject('IMessageRepository')
    private _messageRepo: IMessageRepository,
  ) {}

  async ensureRoomExists(
    chatName: string,
    scheduleId: Types.ObjectId,
    packageId: Types.ObjectId,
    vendorId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<{ chatId: string }> {
    const existing = await this._chatRepo.findChatRoomByScheduleId(scheduleId);

    if (!existing) {
      const chatRoom = await this._chatRepo.createRoom({
        chatName,
        scheduleId,
        packageId,
        vendorId,
        userId,
      });
      return { chatId: chatRoom._id.toString() };
    }
    const isMember = await this._chatRepo.isMember(existing._id.toString(), userId.toString());
    if (!isMember) {
      await this._chatRepo.addMember(existing._id.toString(), userId.toString());
    }
    return { chatId: existing._id.toString() };
  }

  async getUserChat(chatId: string, userId: string): Promise<ChatRoomWithPreviewDTO> {
    const room = await this._chatRepo.findRoomByMemberId(chatId, userId);
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    const lastMessage = await this._messageRepo.getLastMessage(room._id.toString());
    const response = ChatMapper.toChatRoomWithPreviewDTO(room, lastMessage);
    return response;
  }

  async getUserChatMessages(
    chatId: Types.ObjectId,
    userId: Types.ObjectId,
    cursor: string | undefined,
    limit: number,
  ): Promise<PaginatedMessagesDTO> {
    const isMember = await this._chatRepo.isMember(chatId.toString(), userId.toString());
    if (!isMember) throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);

    const result = await this._messageRepo.findMessagesByChatId(chatId.toString(), cursor, limit);
    return {
      messages: result.messages.map(ChatMapper.toMessageDTO),
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    };
  }

  async sendUserMessage(
    chatId: Types.ObjectId,
    userId: Types.ObjectId,
    senderName: string,
    content: string,
  ): Promise<MessageDTO | undefined> {
    const isMember = await this._chatRepo.isActiveMember(chatId.toString(), userId.toString());
    if (!isMember) throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);

    const room = await this._chatRepo.findRoomById(chatId.toString());
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (room.status === 'archived')
      throw new AppError(ERROR_MESSAGES.CHAT_ARCHIVED, HTTP_STATUS.BAD_REQUEST);

    const message = await this._messageRepo.createTextMessage({
      chatId: chatId.toString(),
      senderId: userId.toString(),
      senderRole: USER_ROLES.USER,
      senderName,
      content,
    });

    try {
      chatEmitter.sendMessageUser(chatId.toString(), room.vendorId.toString(), {
        id: message._id.toString(),
        chatId: chatId.toString(),
        senderId: userId.toString(),
        senderRole: USER_ROLES.USER,
        senderName,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (err) {
      logger.error('[ChatService] Socket emit failed (non-fatal):', err);
    }
    return ChatMapper.toMessageDTO(message);
  }

  // ─── Vendor chat endpoints

  async getVendorChats(
    vendorId: string,
    status?: 'active' | 'archived',
    search?: string,
  ): Promise<ChatRoomWithPreviewDTO[]> {
    const rooms = await this._chatRepo.findRoomsByVendorId(vendorId, status, search);
    return Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await this._messageRepo.getLastMessage(room._id.toString());
        const lastReadAt = room.vendorLastReadAt || new Date(0);
        const unreadCount = await this._messageRepo.getMessageUnreadCount(
          room._id.toString(),
          USER_ROLES.USER,
          lastReadAt,
        );
        const dto = ChatMapper.toChatRoomWithPreviewDTO(room, lastMessage);
        return { ...dto, unreadCount };
      }),
    );
  }

  async getVendorChatMessages(
    chatId: string,
    vendorId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<PaginatedMessagesDTO> {
    const room = await this._chatRepo.findRoomById(chatId);
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (room.vendorId.toString() !== vendorId)
      throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);

    const result = await this._messageRepo.findMessagesByChatId(chatId, cursor, limit);
    return {
      messages: result.messages.map(ChatMapper.toMessageDTO),
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    };
  }

  async sendVendorMessage(
    chatId: string,
    vendorId: string,
    senderName: string,
    content: string,
  ): Promise<MessageDTO | undefined> {
    const room = await this._chatRepo.findRoomById(chatId);
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (room.vendorId.toString() !== vendorId)
      throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);
    if (room.status === 'archived')
      throw new AppError(ERROR_MESSAGES.CHAT_ARCHIVED, HTTP_STATUS.BAD_REQUEST);

    if (!content || content.trim() === '')
      throw new AppError(ERROR_MESSAGES.CONTENT_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    const message = await this._messageRepo.createTextMessage({
      chatId,
      senderId: vendorId,
      senderRole: USER_ROLES.VENDOR,
      senderName,
      content: content.trim(),
    });

    try {
      chatEmitter.sendMessageVendor(chatId, {
        id: message._id.toString(),
        chatId,
        senderId: vendorId,
        senderRole: USER_ROLES.VENDOR,
        senderName,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (err) {
      logger.error('[ChatService] Socket emit failed (non-fatal):', err);
    }
    return ChatMapper.toMessageDTO(message);
  }

  async pinMessage(chatId: string, vendorId: string, message: string): Promise<ChatRoomDTO | null> {
    const room = await this._chatRepo.findRoomById(chatId);
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (room.vendorId.toString() !== vendorId)
      throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);

    const updated = await this._chatRepo.pinMessage(chatId, message);

    if (updated) {
      try {
        chatEmitter.sendRoomUpdated(chatId, {
          chatId,
          pinnedMessage: message,
        });
      } catch (err) {
        logger.error('[ChatService] Socket emit failed (non-fatal):', err);
      }
    }
    return updated ? ChatMapper.toChatRoomDTO(updated) : null;
  }

  async removeMember(
    chatId: string,
    vendorId: string,
    userId: string,
  ): Promise<ChatRoomDTO | null> {
    const room = await this._chatRepo.findRoomById(chatId);
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (room.vendorId.toString() !== vendorId)
      throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);

    const member = room.members.find((m) => m.userId.toString() === userId);
    if (!member) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    const updated = await this._chatRepo.deactivateMember(chatId, userId);
    if (updated) {
      try {
        chatEmitter.sendRoomUpdated(chatId, {
          chatId,
          blockedUserId: userId,
        });
      } catch (err) {
        logger.error('[ChatService] Socket emit failed (non-fatal):', err);
      }
    }
    return updated ? ChatMapper.toChatRoomDTO(updated) : null;
  }

  async archiveRoom(chatId: string, vendorId: string): Promise<ChatRoomDTO | null> {
    const room = await this._chatRepo.findRoomById(chatId);
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (room.vendorId.toString() !== vendorId)
      throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);
    if (room.status === 'archived')
      throw new AppError(ERROR_MESSAGES.CHAT_ARCHIVED, HTTP_STATUS.BAD_REQUEST);

    const updated = await this._chatRepo.archiveRoom(chatId);
    if (updated) {
      try {
        chatEmitter.sendRoomUpdated(chatId, {
          chatId,
          status: 'archived',
        });
      } catch (err) {
        logger.error('[ChatService] Socket emit failed (non-fatal):', err);
      }
    }
    return updated ? ChatMapper.toChatRoomDTO(updated) : null;
  }

  async getChatMembers(chatId: string, vendorId: string): Promise<ChatMemberDetailDTO[]> {
    const room = await this._chatRepo.getRoomWithMembers(chatId);
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (room.vendorId.toString() !== vendorId)
      throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);

    return ChatMapper.toChatMemberDetailDTOList(room);
  }

  async markChatAsReadForVendor(chatId: string, vendorId: string): Promise<void> {
    const room = await this._chatRepo.findRoomById(chatId);
    if (!room) throw new AppError(ERROR_MESSAGES.CHAT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (room.vendorId.toString() !== vendorId)
      throw new AppError(ERROR_MESSAGES.FORBIDDEN_ACCESS, HTTP_STATUS.FORBIDDEN);

    await this._chatRepo.findOneAndUpdate(
      { _id: toObjectId(chatId) },
      { vendorLastReadAt: new Date() },
    );
  }
}
