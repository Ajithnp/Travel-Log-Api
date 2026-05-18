import { RequestHandler } from 'express';

export interface IChatController {
  getUserChat: RequestHandler;

  getUserChatMessages: RequestHandler;

  sendUserMessage: RequestHandler;

  getVendorChats: RequestHandler;

  getVendorChatMessages: RequestHandler;

  sendVendorMessage: RequestHandler;

  pinMessage: RequestHandler;

  removeMember: RequestHandler;

  archiveChat: RequestHandler;

  getChatMembers: RequestHandler;

  markChatAsReadForVendor: RequestHandler;
}
