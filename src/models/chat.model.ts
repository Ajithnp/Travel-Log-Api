import mongoose from 'mongoose';
import { IChat } from '../types/entities/chat.entity';
import { IChatMember } from '../types/entities/chat.entity';

const ChatMemberSchema = new mongoose.Schema<IChatMember>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const ChatSchema = new mongoose.Schema<IChat>(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchedulePackage',
      required: true,
      unique: true, 
      index: true,
    },

    chatName: {
      type: String,
      required: true,
      trim: true,
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    vendorLastReadAt: {
      type: Date,
      default: null,
    },

    members: {
      type: [ChatMemberSchema],
      required: true,
      default: [],
    },

    pinnedMessage: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      required: true,
    },

    archivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

ChatSchema.index({ vendorId: 1 });
ChatSchema.index({ packageId: 1 });
ChatSchema.index({ 'members.userId': 1 });

export const ChatModel = mongoose.model<IChat>('Chat', ChatSchema);
