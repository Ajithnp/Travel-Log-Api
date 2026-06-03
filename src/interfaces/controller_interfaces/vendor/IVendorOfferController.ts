import { RequestHandler } from 'express';

export interface IVendorOfferController {
  createOffer: RequestHandler;
  getOffers: RequestHandler;
  deactivateOffer: RequestHandler;
}
