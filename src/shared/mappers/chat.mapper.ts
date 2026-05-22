import {
  IChat,
  IChatMemberPopulated,
  IChatWithMembersPopulated,
} from '../../types/entities/chat.entity';
import { IMessage } from '../../types/entities/message.entity';
import {
  ChatMemberDetailDTO,
  ChatRoomDTO,
  ChatRoomWithPreviewDTO,
  MessageDTO,
} from '../../interfaces/service_interfaces/IChatService';

export class ChatMapper {
  static toChatRoomDTO(chat: IChat): ChatRoomDTO {
    return {
      id: chat._id.toString(),
      chatName: chat.chatName,
      scheduleId: chat.scheduleId.toString(),
      packageId: chat.packageId.toString(),
      vendorId: chat.vendorId.toString(),
      members: chat.members.map((m) => ({
        userId: m.userId.toString(),
        isActive: m.isActive,
      })),
      status: chat.status,
      pinnedMessage: chat.pinnedMessage,
      createdAt: chat.createdAt,
    };
  }

  static toChatRoomWithPreviewDTO(
    chat: IChat,
    lastMessage: IMessage | null,
  ): ChatRoomWithPreviewDTO {
    return {
      ...ChatMapper.toChatRoomDTO(chat),
      lastMessage: lastMessage ? ChatMapper.toMessageDTO(lastMessage) : null,
    };
  }

  static toMessageDTO(message: IMessage): MessageDTO {
    return {
      id: message._id.toString(),
      chatId: message.chatId.toString(),
      senderId: message.senderId.toString(),
      senderRole: message.senderRole,
      senderName: message.senderName,
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  static toChatMemberDetailDTO(member: IChatMemberPopulated): ChatMemberDetailDTO {
    return {
      id: member.userId._id.toString(),
      name: member.userId.name,
      status: member.isActive ? true : false,
    };
  }

  static toChatMemberDetailDTOList(chat: IChatWithMembersPopulated): ChatMemberDetailDTO[] {
    return chat.members.map(ChatMapper.toChatMemberDetailDTO);
  }
}
