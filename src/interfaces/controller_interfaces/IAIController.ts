import { RequestHandler } from 'express';

export interface IAIController {
  askChatbot: RequestHandler;
  getRecommendedPackages: RequestHandler;
}
