import { inject, injectable } from 'tsyringe';
import { IChatService } from '../interfaces/service_interfaces/IChatService';
import { IChatController } from '../interfaces/controller_interfaces/IChatController';
import expressAsyncHandler from 'express-async-handler';
import { IApiResponse } from '../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../shared/constants/messages';
import { Types } from 'mongoose';

@injectable()
export class ChatController implements IChatController {
  constructor(
    @inject('IChatService')
    private _chatService: IChatService,
  ) {}

  // ─── USER

  getUserChat = expressAsyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const chatId = req.params.chatId;
    const result = await this._chatService.getUserChat(chatId, userId);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  getUserChatMessages = expressAsyncHandler(async (req, res) => {
    const userId = new Types.ObjectId(req.user!.id);
    const chatId = new Types.ObjectId(req.params.chatId);
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this._chatService.getUserChatMessages(chatId, userId, cursor, limit);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  sendUserMessage = expressAsyncHandler(async (req, res) => {
    const userId = new Types.ObjectId(req.user!.id);
    const chatId = new Types.ObjectId(req.params.chatId);
    const { content } = req.body;
    const senderName = req.user!.name;

    const message = await this._chatService.sendUserMessage(chatId, userId, senderName, content);

    const successResponse: IApiResponse<typeof message> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: message,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  // ─── VENDOR

  getVendorChats = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user!.id;
    const status = req.query.status as 'active' | 'archived' | undefined;
    const search = req.query.search as string | undefined;

    const chats = await this._chatService.getVendorChats(vendorId, status, search);

    const successResponse: IApiResponse<typeof chats> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: chats,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  getVendorChatMessages = expressAsyncHandler(async (req, res) => {
    const vendorId = new Types.ObjectId(req.user!.id);
    const chatId = new Types.ObjectId(req.params.chatId);
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 30;

    const result = await this._chatService.getVendorChatMessages(
      chatId.toString(),
      vendorId.toString(),
      cursor,
      limit,
    );

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  sendVendorMessage = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const chatId = req.params.chatId;
    const { content } = req.body;
    const senderName = req.user!.name;

    const message = await this._chatService.sendVendorMessage(
      chatId,
      vendorId,
      senderName,
      content,
    );

    const successResponse: IApiResponse<typeof message> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: message,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  pinMessage = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const chatId = req.params.chatId;
    const message = req.body.message;

    const updated = await this._chatService.pinMessage(chatId, vendorId, message);

    const successResponse: IApiResponse<typeof updated> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: updated,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  removeMember = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user!.id;
    const chatId = req.params.chatId;
    const userId = req.params.userId;

    await this._chatService.removeMember(chatId, vendorId, userId);

    const successResponse: IApiResponse<null> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: null,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  archiveChat = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user!.id;
    const chatId = req.params.chatId;

    await this._chatService.archiveRoom(chatId, vendorId);

    const successResponse: IApiResponse<null> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: null,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getChatMembers = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user!.id;
    const chatId = req.params.chatId;

    const result = await this._chatService.getChatMembers(chatId, vendorId);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  markChatAsReadForVendor = expressAsyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const chatId = req.params.chatId;
    await this._chatService.markChatAsReadForVendor(chatId, vendorId);

    const successResponse: IApiResponse<void> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
