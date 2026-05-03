import { RequestHandler } from 'express';

export interface IBookingController {
  initiateBooking: RequestHandler;
  verifyPayment: RequestHandler;
}
