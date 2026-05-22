import logger from '../../../config/logger';
import {
  ChatMessagePayload,
  ChatRoomUpdatedPayload,
  SocketRooms,
  TypedIOServer,
} from '../types/socket.types';
import { CHAT_EVENTS } from '../types/socket.event';

export class ChatEmitter {
  private static instance: ChatEmitter;
  private io: TypedIOServer | null = null;

  private constructor() {}

  static getInstance(): ChatEmitter {
    if (!ChatEmitter.instance) {
      ChatEmitter.instance = new ChatEmitter();
    }
    return ChatEmitter.instance;
  }

  init(io: TypedIOServer): void {
    this.io = io;
    logger.info('[ChatEmitter] Initialized with Socket.IO server.');
  }

  // Broadcast new message to everyone in the chat room
  sendMessageUser(chatId: string, vendorId: string, payload: ChatMessagePayload): void {
    if (!this.io) {
      logger.warn('[ChatEmitter] io not initialized. Skipping emit.');
      return;
    }

    const room = SocketRooms.forChat(chatId);
    const vendorRoom = SocketRooms.forUser(vendorId);
    logger.info(`[ChatEmitter] Emitting '${CHAT_EVENTS.MESSAGE_NEW}' → room: "${room}"`);
    this.io.to(room).emit(CHAT_EVENTS.MESSAGE_NEW, payload);
    this.io.to(vendorRoom).emit(CHAT_EVENTS.MESSAGE_NEW, payload);
  }

  sendMessageVendor(chatId: string, payload: ChatMessagePayload): void {
    if (!this.io) {
      logger.warn('[ChatEmitter] io not initialized. Skipping emit.');
      return;
    }

    const room = SocketRooms.forChat(chatId);
    logger.info(`[ChatEmitter] Emitting '${CHAT_EVENTS.MESSAGE_NEW}' → room: "${room}"`);
    this.io.to(room).emit(CHAT_EVENTS.MESSAGE_NEW, payload);
  }

  // Broadcast room update (pin / archive) to everyone in the chat room
  sendRoomUpdated(chatId: string, payload: ChatRoomUpdatedPayload): void {
    if (!this.io) return;

    const room = SocketRooms.forChat(chatId);
    logger.info(`[ChatEmitter] Emitting '${CHAT_EVENTS.ROOM_UPDATED}' → room: "${room}"`);
    this.io.to(room).emit(CHAT_EVENTS.ROOM_UPDATED, payload);
  }

  isReady(): boolean {
    return this.io !== null;
  }
}

export const chatEmitter = ChatEmitter.getInstance();
