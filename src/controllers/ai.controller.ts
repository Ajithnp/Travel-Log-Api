import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { IApiResponse } from '../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../shared/constants/messages';
import expressAsyncHandler from 'express-async-handler';
import { IRagService } from '../interfaces/service_interfaces/IRagService';
import { ChatMessage, validateChatHistory } from '../shared/utils/format-ai-chat-history';
import { IAIController } from '../interfaces/controller_interfaces/IAIController';
import { IRecommendationService } from '../interfaces/service_interfaces/IRecommendationService';

@injectable()
export class AIController implements IAIController {
  constructor(
    @inject('IRagService')
    private _ragService: IRagService,
    @inject('IRecommendationService')
    private _recommendationService: IRecommendationService,
  ) {}

  askChatbot = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { message, chatHistory } = req.body as { message: string; chatHistory: ChatMessage[] };
    const validatedHistory = validateChatHistory(chatHistory);

    const data = await this._ragService.askChatbot(message, validatedHistory);

    const successResponse: IApiResponse<typeof data> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getRecommendedPackages = expressAsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      //  const userId:string = req.user?.id;
      const userId = '693f90f3988c22ce3b927138';

      const data = await this._recommendationService.getRecommendedPackages(userId);

      const successResponse: IApiResponse<typeof data> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data,
      };
      res.status(HTTP_STATUS.OK).json(successResponse);
    },
  );
}
