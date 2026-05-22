import { RequestHandler } from 'express';

export interface IBookingController {
  initiateBooking: RequestHandler;
  confirmBookingWallet: RequestHandler;
  verifyPayment: RequestHandler;
  getBookings: RequestHandler;
  getBookingDetails: RequestHandler;
  cancelBookingRequest: RequestHandler;
}
