import { Types } from 'mongoose';

export interface IChatService {
  ensureRoomExists(
    chatName: string,
    scheduleId: Types.ObjectId,
    packageId: Types.ObjectId,
    vendorId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<{ chatId: string }>;

  getUserChat(chatId: string, userId: string): Promise<ChatRoomDTO>;

  getUserChatMessages(
    chatId: Types.ObjectId,
    userId: Types.ObjectId,
    cursor: string | undefined,
    limit: number,
  ): Promise<PaginatedMessagesDTO>;

  sendUserMessage(
    chatId: Types.ObjectId,
    userId: Types.ObjectId,
    senderName: string,
    messageType: 'text' | 'image',
    content?: string,
  ): Promise<MessageDTO | undefined>;

  // ─── Vendor chat endpoints

  getVendorChats(
    vendorId: string,
    status?: 'active' | 'archived',
    search?: string,
  ): Promise<ChatRoomWithPreviewDTO[]>;

  getVendorChatMessages(
    chatId: string,
    vendorId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<PaginatedMessagesDTO>;

  sendVendorMessage(
    chatId: string,
    vendorId: string,
    senderName: string,
    content: string,
  ): Promise<MessageDTO | undefined>;

  pinMessage(chatId: string, vendorId: string, message: string): Promise<ChatRoomDTO | null>;

  removeMember(chatId: string, vendorId: string, userId: string): Promise<ChatRoomDTO | null>;

  archiveRoom(chatId: string, vendorId: string): Promise<ChatRoomDTO | null>;

  getChatMembers(chatId: string, vendorId: string): Promise<ChatMemberDetailDTO[]>;

  markChatAsReadForVendor(chatId: string, vendorId: string): Promise<void>;
}

export type SenderRole = 'user' | 'vendor';
export type RoomStatus = 'active' | 'archived';

export interface MessageDTO {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: SenderRole;
  senderName: string;
  content: string;
  createdAt: Date;
}

export interface ChatMemberDTO {
  userId: string;
  isActive: boolean;
}

export interface ChatRoomDTO {
  id: string;
  chatName: string;
  scheduleId: string;
  packageId: string;
  vendorId: string;
  members: ChatMemberDTO[];
  status: RoomStatus;
  pinnedMessage?: string;
  createdAt: Date;
}

export interface ChatPreviewDTO {
  id: string;
  chatName: string;
  status: RoomStatus;
  pinnedMessage?: string;
  lastMessage: {
    senderName: string;
    content?: string;
    createdAt: Date;
  } | null;
}

export interface ChatRoomWithPreviewDTO extends ChatRoomDTO {
  lastMessage: MessageDTO | null;
  unreadCount?: number;
}

export interface ChatMemberDetailDTO {
  id: string;
  name: string;
  status: boolean;
}

export interface PaginatedMessagesDTO {
  messages: MessageDTO[];
  hasMore: boolean;
  nextCursor: string | null;
}
