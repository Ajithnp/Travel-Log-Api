import { BookingListResult, IBooking, PopulatedBooking } from '../types/entities/booking.entity';
import { BaseRepository } from './base.repository';
import { BookingFilters, IBookingRepository } from '../interfaces/repository_interfaces/IBookingRepository';
import BookingModel from '../models/booking.model';
import mongoose from 'mongoose';
import { BOOKING_STATUS } from '../shared/constants/booking';
import { FilterQuery } from 'mongoose';

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
      .findByIdAndUpdate(bookingId, {transactionId: paymentIntentId }, { new: true, session })
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
    bookingId: string,
    stripePaymentIntentId: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(bookingId),
          userId: new mongoose.Types.ObjectId(userId),

        },
        {
          bookingStatus: BOOKING_STATUS.CONFIRMED,
          paymentStatus: BOOKING_STATUS.CONFIRMED,
          paymentMethod: 'stripe',
          transactionId: stripePaymentIntentId,
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


  async findByIdAndUserLean(id: string, userId: string): Promise<IBooking | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return BookingModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean() as Promise<IBooking | null>; 
  }
  
  async findBookings(filters: BookingFilters): Promise<BookingListResult> {
   
    const pipeline: mongoose.PipelineStage[] = [];

    const matchStage: FilterQuery<IBooking> = {
      userId: new mongoose.Types.ObjectId(filters.userId),
    };

      if (filters.bookingStatus) {
            matchStage.bookingStatus = filters.bookingStatus
    }
    
    pipeline.push({ $match: matchStage });

      // Lookup package details
    pipeline.push({
      $lookup: {
        from: 'packages',       
        localField: 'packageId',
        foreignField: '_id',
        as: 'packageId',
      },
    });

    pipeline.push({ $unwind: '$packageId' });

    // Filter by package location (search)
      if (filters.search) {
        pipeline.push({
          $match: {
            'packageId.location': {
              $regex: filters.search,
              $options: 'i',      
            },
          },
        });
    };

    // Lookup schedule details
    pipeline.push({
      $lookup: {
        from: 'schedulepackages',      
        localField: 'scheduleId',
        foreignField: '_id',
        as: 'scheduleId',
      },
    });

    pipeline.push({ $unwind: { path: '$scheduleId', preserveNullAndEmptyArrays: true } });

      // Sort
    pipeline.push({ $sort: { createdAt: -1 } })

    // Facet for pagination + total count in one query

    pipeline.push({
      $facet: {
        bookings: [
          { $skip: (filters.page - 1) * filters.limit },
          { $limit: filters.limit },
          {
            $project: {
              'packageId.title': 1,
              'packageId.location': 1,
              'packageId.state': 1,

              'scheduleId.startDate': 1,
              'scheduleId.endDate': 1,
              'scheduleId.reportingLocation': 1,
              bookingStatus: 1,
              createdAt: 1,
              travelerCount: 1,
              grossAmount: 1,
              bookingCode:1,
             
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const [result] = await this.model.aggregate(pipeline);
    const bookings = result.bookings as PopulatedBooking[];
    const totalCount = result.totalCount[0] ? result.totalCount[0].count : 0;

    return { bookings, total: totalCount };
  };

  async findByIdAndUser(id: string, userId: string): Promise<IBooking | null> {
 
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
    return null
  }
 
    const booking = await BookingModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    })
 
      // ── Package populate ──────
    
      .populate({
        path: 'packageId',
        select: [
          'title',
          'location',
          'state',
          'usp',
          'days',
          'nights',
          'difficultyLevel',
          'cancellationPolicy',
          'itinerary',
          'inclusions',
          'exclusions',
          'packingList',
          'categoryId',
        ].join(' '),
           populate: {
           path:   'categoryId',   
           select: 'name'  
        },
    })
 
    // ── Schedule populate ─────
    .populate({
      path:   'scheduleId',
      select: [
        'startDate',
        'endDate',
        'reportingTime',
        'reportingLocation',
        'notes',
      ].join(' '),
    })
 
    // ── Vendor populate ──────

    .populate({
      path:   'vendorId',
      select: 'name ',
    })

    .lean()   
 
  return booking as IBooking | null
}
  
}
