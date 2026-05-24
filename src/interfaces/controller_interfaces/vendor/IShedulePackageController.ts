import { RequestHandler } from 'express';

export interface ISchedulePackageController {
  createSchedule: RequestHandler;
  fetchSchedules: RequestHandler;
  getSchedule: RequestHandler;
  getVendorScheduleBookingSummary: RequestHandler;
  getScheduleBookings: RequestHandler;
  getScheduleBookingDetails: RequestHandler;
  updateScheduleStatus: RequestHandler;
}
