import { Types } from 'mongoose';
import { IChat, IChatWithMembersPopulated } from '../../types/entities/chat.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IChatRepository extends IBaseRepository<IChat> {
  findChatRoomByScheduleId(scheduleId: Types.ObjectId): Promise<IChat | null>;

  findRoomById(chatId: string): Promise<IChat | null>;

  findRoomByMemberId(chatId: string,userId:string): Promise<IChat | null>;

  findRoomsByUserId(userId: string): Promise<IChat[]>;

  createRoom(data: {
    chatName: string;
    scheduleId: Types.ObjectId;
    packageId: Types.ObjectId;
    vendorId: Types.ObjectId;
    userId: Types.ObjectId;
  }): Promise<IChat>;

  isMember(roomId: string, userId: string): Promise<boolean>;

  addMember(chatId: string, userId: string): Promise<IChat | null>;

  findRoomsByVendorId(vendorId: string, status?: 'active' | 'archived', search?: string): Promise<IChat[]>;

  isActiveMember(chatId: string, userId: string): Promise<boolean>;

  pinMessage(chatId: string, message: string): Promise<IChat | null>;

  deactivateMember(chatId: string, userId: string): Promise<IChat | null>;

  archiveRoom(chatId: string): Promise<IChat | null>;

  canAccessRoom(chatId: string, userId: string, role: string): Promise<boolean>;

  getRoomWithMembers(chatId: string): Promise<IChatWithMembersPopulated | null>;
}
