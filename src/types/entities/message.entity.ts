import { Document, Types } from 'mongoose';

export type SenderRole = 'user' | 'vendor';
export type MessageType = 'text' | 'image';

export interface IMessage extends Document {
  _id: Types.ObjectId;

  chatId: Types.ObjectId;

  senderId: Types.ObjectId;

  senderRole: SenderRole;

  senderName: string;

  content: string;

  createdAt: Date;
  updatedAt: Date;
}
