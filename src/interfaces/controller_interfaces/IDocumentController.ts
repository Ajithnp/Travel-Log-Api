import { RequestHandler } from 'express';

export interface IDocumentController {
  getBookingTicket: RequestHandler;

  getScheduleBookingsCSV: RequestHandler;
}
