import { IBooking } from '../types/entities/booking.entity';
import { BaseRepository } from './base.repository';
import { IBookingRepository } from '../interfaces/repository_interfaces/IBookingRepository';
import BookingModel from '../models/booking.model';
import mongoose from 'mongoose';
import { BOOKING_STATUS } from '../shared/constants/booking';

export class BookingRepository extends BaseRepository<IBooking> implements IBookingRepository {
  constructor() {
    super(BookingModel);
  }

  async createBooking(
    data: Partial<IBooking>,
    session?: mongoose.ClientSession,
  ): Promise<IBooking> {
    const booking = await this.model.create([data], { session });
    return booking[0];
  }

  async findActiveBookingByUserAndSchedule(
    userId: string,
    scheduleId: string,
  ): Promise<IBooking | null> {
    return BookingModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      scheduleId: new mongoose.Types.ObjectId(scheduleId),
      bookingStatus: {
        $nin: [BOOKING_STATUS.CANCELLED_BY_USER, BOOKING_STATUS.CANCELLED_BY_VENDOR],
      },
    }).lean() as Promise<IBooking | null>;
  }

  attachPaymentIntent(
    bookingId: string,
    paymentIntentId: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null> {
    return this.model
      .findByIdAndUpdate(bookingId, { paymentIntentId }, { new: true, session })
      .lean() as Promise<IBooking | null>;
  }

  markFailedPayment(bookingId: string, session?: mongoose.ClientSession): Promise<IBooking | null> {
    return this.model
      .findByIdAndUpdate(
        bookingId,
        { bookingStatus: BOOKING_STATUS.PAYMENT_FAILED },
        { new: true, session },
      )
      .lean() as Promise<IBooking | null>;
  }

  confirmBooking(
    userId: string,
    scheduleId: string,
    bookingId: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(bookingId),
          userId: new mongoose.Types.ObjectId(userId),
          scheduleId: new mongoose.Types.ObjectId(scheduleId),
        },
        {
          bookingStatus: BOOKING_STATUS.CONFIRMED,
          paymentStatus: BOOKING_STATUS.CONFIRMED,
        },
        { new: true, session },
      )
      .lean() as Promise<IBooking | null>;
  }

  async findById(id: string): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BookingModel.findById(id)
      .populate('packageId', 'title destination duration cancellationPolicy images meetingPoint')
      .populate('scheduleId', 'startDate endDate reportingTime reportingLocation pricing notes')
      .populate('vendorId', 'businessName profilePhoto')
      .lean() as Promise<IBooking | null>;
  }

  async findByIdAndUser(id: string, userId: string): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BookingModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate('packageId', 'title destination duration cancellationPolicy images meetingPoint')
      .populate('scheduleId', 'startDate endDate reportingTime reportingLocation pricing notes')
      .populate('vendorId', 'businessName profilePhoto')
      .lean() as Promise<IBooking | null>;
  }
}
