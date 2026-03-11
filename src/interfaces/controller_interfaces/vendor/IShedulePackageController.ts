import { RequestHandler } from 'express';

export interface ISchedulePackageController {
    createSchedule: RequestHandler;
    fetchSchedules: RequestHandler;
}
