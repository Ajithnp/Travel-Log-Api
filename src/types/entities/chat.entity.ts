import mongoose, { Document, Types } from 'mongoose';

export interface IChatMember {
  userId: Types.ObjectId;
  joinedAt: Date;
  isActive: boolean;
}

export interface IChat extends Document {
  _id: Types.ObjectId;
  chatName: string;
  scheduleId: Types.ObjectId;
  packageId: Types.ObjectId;
  vendorId: Types.ObjectId;

  vendorLastReadAt?: Date;

  members: IChatMember[];

  pinnedMessage?: string;

  status: 'active' | 'archived';

  archivedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface IMemberPopulated {
  _id: mongoose.Types.ObjectId;
  name: string;
}

export interface IChatMemberPopulated extends Omit<IChatMember, 'userId'> {
  userId: IMemberPopulated;
}

export interface IChatWithMembersPopulated extends Omit<IChat, 'members'> {
  members: IChatMemberPopulated[];
}
