import { RequestHandler } from 'express';

export interface IUserController {
  profile: RequestHandler;
}
