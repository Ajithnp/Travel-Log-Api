import { RequestHandler } from 'express';

export interface IBookingController {
  initiateBooking: RequestHandler;
  confirmBooking: RequestHandler;
}
