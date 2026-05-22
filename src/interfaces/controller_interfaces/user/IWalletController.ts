import { RequestHandler } from 'express';

export interface IWalletController {
  getWallet: RequestHandler;
  getWalletBalance: RequestHandler;
}
