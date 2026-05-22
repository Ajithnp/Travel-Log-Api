import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import {
  IChat,
  IChatMemberPopulated,
  IChatWithMembersPopulated,
} from '../types/entities/chat.entity';
import { ChatModel } from '../models/chat.model';
import { IChatRepository } from '../interfaces/repository_interfaces/IChatRepository';
import { Types, ClientSession } from 'mongoose';

@injectable()
export class ChatRepository extends BaseRepository<IChat> implements IChatRepository {
  constructor() {
    super(ChatModel);
  }

  async findChatRoomByScheduleId(
    scheduleId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<IChat | null> {
    return await this.model.findOne({ scheduleId }).session(session || null);
  }

  async findRoomById(chatId: string): Promise<IChat | null> {
    return await this.model.findById(chatId).lean();
  }

  async findRoomByMemberId(chatId: string, userId: string): Promise<IChat | null> {
    return await this.model.findOne({ _id: chatId, 'members.userId': userId }).lean();
  }

  async createRoom(data: {
    chatName: string;
    scheduleId: Types.ObjectId;
    packageId: Types.ObjectId;
    vendorId: Types.ObjectId;
    userId: Types.ObjectId;
  }): Promise<IChat> {
    return await this.create({
      chatName: data.chatName,
      scheduleId: data.scheduleId,
      packageId: data.packageId,
      vendorId: data.vendorId,
      members: [{ userId: data.userId, joinedAt: new Date(), isActive: true }],
      status: 'active',
    });
  }

  async isMember(chatId: string, userId: string): Promise<boolean> {
    const count = await this.countDocuments({
      _id: chatId,
      'members.userId': userId,
    });
    return count > 0;
  }

  async addMember(chatId: string, userId: string): Promise<IChat | null> {
    return await this.findByIdAndUpdate(
      chatId,
      {
        $push: { members: { userId, joinedAt: new Date(), isActive: true } },
      },
      { new: true },
    );
  }

  async findRoomsByUserId(userId: string): Promise<IChat[]> {
    return await this.model
      .find({
        'members.userId': userId,
      })
      .populate('scheduleId', 'startDate endDate')
      .populate('packageId', 'name')
      .populate('vendorId', 'name')
      .sort({ updatedAt: -1 })
      .lean();
  }

  async findRoomsByVendorId(
    vendorId: string,
    status?: 'active' | 'archived',
    search?: string,
  ): Promise<IChat[]> {
    const query: Record<string, unknown> = { vendorId };
    if (status) query.status = status;
    if (search) query.chatName = { $regex: search, $options: 'i' };

    return await this.model
      .find(query)
      .populate('scheduleId', 'startDate endDate')
      .populate('packageId', 'name')
      .sort({ updatedAt: -1 })
      .lean();
  }

  async isActiveMember(chatId: string, userId: string): Promise<boolean> {
    const room = await this.model
      .findOne({
        _id: chatId,
        members: { $elemMatch: { userId, isActive: true } },
      })
      .lean();

    return !!room;
  }

  async pinMessage(chatId: string, message: string): Promise<IChat | null> {
    return await this.model
      .findByIdAndUpdate(chatId, { pinnedMessage: message }, { new: true })
      .lean();
  }

  async deactivateMember(
    chatId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<IChat | null> {
    return await this.model
      .findOneAndUpdate(
        { _id: chatId, 'members.userId': userId },
        { $set: { 'members.$.isActive': false } },
        { new: true, session },
      )
      .lean();
  }

  async archiveRoom(chatId: string): Promise<IChat | null> {
    return await this.model
      .findByIdAndUpdate(chatId, { status: 'archived', archivedAt: new Date() }, { new: true })
      .lean();
  }

  async canAccessRoom(chatId: string, userId: string, role: string): Promise<boolean> {
    if (role === 'vendor') {
      const room = await this.model
        .findOne({
          _id: chatId,
          vendorId: userId,
        })
        .lean();
      return !!room;
    }

    const room = await this.model
      .findOne({
        _id: chatId,
        'members.userId': userId,
      })
      .lean();
    return !!room;
  }

  async getRoomWithMembers(chatId: string): Promise<IChatWithMembersPopulated | null> {
    return await this.model
      .findById(chatId)
      .populate<{ members: IChatMemberPopulated[] }>('members.userId', 'name')
      .lean();
  }
}
