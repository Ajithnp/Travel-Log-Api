import { RequestHandler } from 'express';

export interface IAdminUserController {
  getAllUsers: RequestHandler;
  blockOrUnblockUser: RequestHandler;
  getCancellationRequests: RequestHandler;
  getCancellationRequestDetails: RequestHandler;
  rejectCancellationRequest: RequestHandler;
  approveCancellationRequest: RequestHandler;
}
