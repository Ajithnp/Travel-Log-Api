import { RequestHandler } from 'express';

export interface IAdminUserController {
  getAllUsers: RequestHandler;
  blockOrUnblockUser: RequestHandler;
}
