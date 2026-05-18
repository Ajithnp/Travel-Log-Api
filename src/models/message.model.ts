import { IMessage } from '../types/entities/message.entity';
import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    senderRole: {
      type: String,
      enum: ['user', 'vendor'],
      required: true,
    },

    senderName: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  },
);

MessageSchema.index({ chatId: 1, _id: -1 });
MessageSchema.index({ chatId: 1, createdAt: -1 });

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
