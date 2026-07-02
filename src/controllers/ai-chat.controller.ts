import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { IApiResponse } from "../types/common/IApiResponse";
import { HTTP_STATUS, SUCCESS_STATUS } from "../shared/constants/http_status_code";
import { SUCCESS_MESSAGES } from "../shared/constants/messages";
import expressAsyncHandler from "express-async-handler";
import { IAIChatController } from "../interfaces/controller_interfaces/IAIChatController";
import { IRagService } from "../interfaces/service_interfaces/IRagService";
import { ChatMessage, validateChatHistory } from "../shared/utils/format-ai-chat-history";

@injectable()
export class AIChatController implements IAIChatController {
  constructor(
    @inject('IRagService')
    private _aiChatService: IRagService,
  ) {}

  askChatbot = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {

    const { message, chatHistory } = req.body as {message:string, chatHistory:ChatMessage[]};

    const validatedHistory = validateChatHistory(chatHistory);

    const data = await this._aiChatService.askChatbot(message, validatedHistory);

    const successResponse: IApiResponse<typeof data> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}