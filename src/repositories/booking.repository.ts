import {
  BookingListResult,
  CancellationRequestResult,
  IBooking,
  IBookingPopulated,
  ICancellationRequestPopulatedBooking,
  PopulatedBooking,
  IVendorScheduleBookingSummary,
  ScheduleBookingListResult,
  IScheduleBookingPopulated,
  IScheduleBookingSinglePopulated,
  ITicketPopulatedBooking,
} from '../types/entities/booking.entity';
import { BaseRepository } from './base.repository';
import {
  BookingFilters,
  IBookingRepository,
  SchedulePayoutTotals,
} from '../interfaces/repository_interfaces/IBookingRepository';
import {
  CommissionOverview,
} from '../interfaces/service_interfaces/admin/IAdminFinanceService';
import BookingModel from '../models/booking.model';
import mongoose, { ClientSession, Types } from 'mongoose';
import { BOOKING_STATUS, CANCELATION_STATUS, PAYMENT_STATUS } from '../shared/constants/booking';
import { FilterQuery } from 'mongoose';
import { toObjectId } from '../shared/utils/database/objectId.helper';

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
    return this.model
      .findOne({
        userId: new mongoose.Types.ObjectId(userId),
        scheduleId: new mongoose.Types.ObjectId(scheduleId),
        bookingStatus: {
          $nin: [BOOKING_STATUS.CANCELLED_BY_USER],
        },
      })
      .lean() as Promise<IBooking | null>;
  }

  attachPaymentIntent(
    bookingId: string,
    paymentIntentId: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null> {
    return this.model
      .findByIdAndUpdate(bookingId, { transactionId: paymentIntentId }, { new: true, session })
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
    stripePaymentIntentId?: string,
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
          paymentStatus: PAYMENT_STATUS.PAID,
          transactionId: stripePaymentIntentId ? stripePaymentIntentId : null,
        },
        { new: true, session },
      )
      .lean() as Promise<IBooking | null>;
  }

  async findById(id: string): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return this.model
      .findById(id)
      .populate('packageId', 'title destination duration cancellationPolicy images meetingPoint')
      .populate('scheduleId', 'startDate endDate reportingTime reportingLocation pricing notes')
      .populate('vendorId', 'businessName profilePhoto')
      .lean() as Promise<IBooking | null>;
  }

  async findByIdAndUserLean(id: string, userId: string): Promise<IBookingPopulated | null> {
    return this.model
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      })
      .populate('packageId', 'title')
      .lean() as Promise<IBookingPopulated | null>;
  }

  async findOneAndPopulate(bookingId: string): Promise<ITicketPopulatedBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) return null;

    const booking = await this.model
      .findById(bookingId)
      .populate({
        path: 'packageId',
        select: 'title location state difficultyLevel days nights inclusions',
      })
      .populate({
        path: 'scheduleId',
        select: 'startDate endDate reportingTime reportingLocation',
      })
      .populate({
        path: 'vendorId',
        select: 'name',
      })
      .lean();

    return booking as ITicketPopulatedBooking | null;
  }

  async findBookings(filters: BookingFilters): Promise<BookingListResult> {
    const pipeline: mongoose.PipelineStage[] = [];

    const matchStage: FilterQuery<IBooking> = {
      userId: new mongoose.Types.ObjectId(filters.userId),
    };

    if (filters.bookingStatus) {
      matchStage.bookingStatus = filters.bookingStatus;
    }

    pipeline.push({ $match: matchStage });

    pipeline.push({
      $lookup: {
        from: 'packages',
        localField: 'packageId',
        foreignField: '_id',
        as: 'packageId',
      },
    });

    pipeline.push({ $unwind: '$packageId' });


    if (filters.search) {
      pipeline.push({
        $match: {
          'packageId.location': {
            $regex: filters.search,
            $options: 'i',
          },
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: 'schedulepackages',
        localField: 'scheduleId',
        foreignField: '_id',
        as: 'scheduleId',
      },
    });

    pipeline.push({ $unwind: { path: '$scheduleId', preserveNullAndEmptyArrays: true } });
    pipeline.push({ $sort: { createdAt: -1 } });

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
              paymentStatus: 1,
              createdAt: 1,
              travelerCount: 1,
              grossAmount: 1,
              bookingCode: 1,
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
  }

  async findByIdAndUser(id: string, userId: string): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const booking = await this.model
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      })

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
          'averageRating',
          'totalReviews',
          'categoryId',
        ].join(' '),
        populate: [
          {
            path: 'categoryId',
            select: 'name',
          },
          {
            path: 'cancellationPolicy',
            select: '-createdAt -updatedAt -description',
          },
        ],
      })
      .populate({
        path: 'scheduleId',
        select: ['startDate', 'endDate', 'reportingTime', 'reportingLocation', 'notes'].join(' '),
      })

      .populate({
        path: 'vendorId',
        select: 'name ',
      })

      .lean();

    return booking as IBooking | null;
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    update: {
      cancellationReason: string;
      cancellationStatus: string;
      cancelledAt: Date;
      cancelationRefundAmount?: number;
    },
  ): Promise<IBooking | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: bookingId,
          userId: userId,
        },
        { $set: update },
        { new: true },
      )
      .lean() as Promise<IBooking | null>;
  }

  async getCancellationRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<CancellationRequestResult> {
    const pipeline: mongoose.PipelineStage[] = [];

    const matchStage: FilterQuery<IBooking> = {
      cancellationStatus: { $ne: null },
    };
    if (status) {
      matchStage.cancellationStatus = status;
    }

    pipeline.push({ $match: matchStage });

    pipeline.push({
      $lookup: {
        from: 'packages',
        localField: 'packageId',
        foreignField: '_id',
        as: 'package',
      },
    });
    pipeline.push({ $unwind: '$package' });

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    });
    pipeline.push({ $unwind: '$user' });

    pipeline.push({ $sort: { updatedAt: -1 } });

    pipeline.push({
      $facet: {
        requests: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: { $toString: '$_id' },
              bookingCode: 1,
              updatedAt: 1,
              finalAmount: 1,
              cancelationRefundAmount: 1,
              cancellationStatus: 1,
              packageTittle: '$package.title',
              userName: '$user.name',
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const [result] = await this.model.aggregate(pipeline);
    const requests = result.requests || [];
    const totalCount = result.totalCount[0] ? result.totalCount[0].count : 0;

    return { requests, total: totalCount };
  }

  async getCancellationRequestById(
    bookingId: string,
  ): Promise<ICancellationRequestPopulatedBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return null;
    }

    const booking = (await this.model
      .findOne({ _id: new mongoose.Types.ObjectId(bookingId) })
      .populate({
        path: 'userId',
        select: 'name email phone',
      })
      .populate({
        path: 'vendorId',
        select: 'name',
      })
      .populate({
        path: 'packageId',
        select: 'title cancellationPolicy',
        populate: {
          path: 'cancellationPolicy',
          select: '-createdAt -updatedAt -description',
        },
      })
      .populate({
        path: 'scheduleId',
        select: 'startDate',
      })
      .lean()) as ICancellationRequestPopulatedBooking | null;

    return booking;
  }

  async updateCancellationStatus(bookingId: string, status: string): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return null;
    }
    return this.model
      .findByIdAndUpdate(bookingId, { cancellationStatus: status }, { new: true })
      .lean() as Promise<IBooking | null>;
  }

  async findOneAndUpdateReject(
    bookingId: string,
    rejectedReason: string,
  ): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return null;
    }
    return this.findOneAndUpdate(
      {
        _id: bookingId,
      },
      {
        cancellationStatus: CANCELATION_STATUS.REJECTED,
        cancellationRejectedReason: rejectedReason,
      },
      { new: true },
    ) as Promise<IBooking | null>;
  }

  async findBookingWithSession(
    bookingId: string,
    session: ClientSession,
  ): Promise<IBookingPopulated | null> {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return null;
    }
    return this.model
      .findOne({ _id: new mongoose.Types.ObjectId(bookingId) })
      .populate('packageId', 'title')
      .session(session)
      .lean() as Promise<IBookingPopulated | null>;
  }

  async updateBookingWithSession(
    bookingId: string,
    update: Partial<IBooking>,
    session: ClientSession,
  ): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return null;
    }
    return this.model
      .findOneAndUpdate({ _id: new mongoose.Types.ObjectId(bookingId) }, update, {
        new: true,
        session,
      })
      .lean() as Promise<IBooking | null>;
  }

  async getVendorScheduleBookingSummary(
    scheduleId: string,
    vendorId: string,
  ): Promise<IVendorScheduleBookingSummary | null> {
    const stats = await this.model.aggregate([
      {
        $match: {
          scheduleId: new mongoose.Types.ObjectId(scheduleId),
          vendorId: new mongoose.Types.ObjectId(vendorId),
        },
      },
      {
        $group: {
          _id: null,
          totalConfirmedBookings: {
            $sum: {
              $cond: [{ $eq: ['$bookingStatus', BOOKING_STATUS.CONFIRMED] }, '$travelerCount', 0],
            },
          },
          totalCancelledBookings: {
            $sum: {
              $cond: [
                { $eq: ['$bookingStatus', BOOKING_STATUS.CANCELLED_BY_USER] },
                '$travelerCount',
                0,
              ],
            },
          },
          totalConfirmedAmount: {
            $sum: {
              $cond: [{ $eq: ['$bookingStatus', BOOKING_STATUS.CONFIRMED] }, '$finalAmount', 0],
            },
          },
          totalCancelledAmount: {
            $sum: {
              $cond: [
                { $eq: ['$bookingStatus', BOOKING_STATUS.CANCELLED_BY_USER] },
                '$finalAmount',
                0,
              ],
            },
          },
          totalVendorEarning: {
            $sum: {
              $add: [
                {
                  $cond: [
                    { $eq: ['$bookingStatus', BOOKING_STATUS.CONFIRMED] },
                    '$vendorEarning',
                    0,
                  ],
                },
                {
                  $cond: [
                    { $eq: ['$bookingStatus', BOOKING_STATUS.CANCELLED_BY_USER] },
                    {
                      $subtract: [
                        { $ifNull: ['$finalAmount', 0] },
                        { $ifNull: ['$cancelationRefundAmount', 0] },
                      ],
                    },
                    0,
                  ],
                },
              ],
            },
          },
          totalPlatformCommission: {
            $sum: {
              $cond: [
                { $eq: ['$bookingStatus', BOOKING_STATUS.CONFIRMED] },
                '$platformCommission',
                0,
              ],
            },
          },
        },
      },
    ]);

    const stat = stats[0] || {
      totalConfirmedBookings: 0,
      totalCancelledBookings: 0,
      totalConfirmedAmount: 0,
      totalCancelledAmount: 0,
      totalVendorEarning: 0,
      totalPlatformCommission: 0,
    };

    return {
      totalConfirmedBookings: stat.totalConfirmedBookings || 0,
      totalCancelledBookings: stat.totalCancelledBookings || 0,
      totalConfirmedAmount: stat.totalConfirmedAmount || 0,
      totalCancelledAmount: stat.totalCancelledAmount || 0,
      totalVendorEarning: stat.totalVendorEarning || 0,
      totalPlatformCommission: stat.totalPlatformCommission || 0,
    };
  }

  async findBookingsBySchedule(
    scheduleId: string,
    vendorId: string,
    page: number,
    limit: number,
    search?: string,
    filter?: string,
  ): Promise<ScheduleBookingListResult> {
    const matchStage: mongoose.FilterQuery<IBooking> = {
      scheduleId: new mongoose.Types.ObjectId(scheduleId),
      vendorId: new mongoose.Types.ObjectId(vendorId),
    };

    if (filter) {
      matchStage.bookingStatus = filter;
    }

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      ...(search
        ? [
          {
            $match: {
              $or: [
                { 'user.name': { $regex: search, $options: 'i' } },
                { bookingCode: { $regex: search, $options: 'i' } },
              ],
            },
          },
        ]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          bookings: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                bookingCode: 1,
                groupType: 1,
                travelerCount: 1,
                finalAmount: 1,
                paymentStatus: 1,
                bookingStatus: 1,
                createdAt: 1,
                userId: { name: '$user.name' },
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);
    const bookings = result.bookings as IScheduleBookingPopulated[];
    const totalCount = result.totalCount[0] ? result.totalCount[0].count : 0;

    return { bookings, total: totalCount };
  }

  async getVendorBookingDetails(
    bookingId: string,
    scheduleId: string,
    vendorId: string,
  ): Promise<IScheduleBookingSinglePopulated | null> {
    const booking = await this.model
      .findOne({
        _id: new mongoose.Types.ObjectId(bookingId),
        scheduleId: new mongoose.Types.ObjectId(scheduleId),
        vendorId: new mongoose.Types.ObjectId(vendorId),
      })
      .populate('userId', 'name')
      .lean();
    return booking as IScheduleBookingSinglePopulated | null;
  }

  async getTotalRevanueByVendorId(vendorId: string): Promise<{ totalRevenue: number } | null> {
    const result = await this.model.aggregate<{
      _id: mongoose.Types.ObjectId;
      totalRevenue: number;
    }>([
      {
        $match: {
          vendorId: new mongoose.Types.ObjectId(vendorId),
          bookingStatus: BOOKING_STATUS.COMPLETED,
        },
      },
      { $group: { _id: '$vendorId', totalRevenue: { $sum: '$vendorEarning' } } },
    ]);

    return result.length > 0 ? { totalRevenue: result[0].totalRevenue } : null;
  }

  async getCommissionOverview(): Promise<CommissionOverview> {
    const result = await this.model.aggregate([
      {
        $match: {
          bookingStatus: BOOKING_STATUS.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          totalGrossAmount: { $sum: '$finalAmount' },
          totalPlatformCommission: { $sum: '$platformCommission' },
          totalVendorEarnings: { $sum: '$vendorEarning' },
        },
      },
    ]);

    if (result.length > 0) {
      return {
        totalGrossAmount: result[0].totalGrossAmount || 0,
        totalPlatformCommission: result[0].totalPlatformCommission || 0,
        totalVendorEarnings: result[0].totalVendorEarnings || 0,
      };
    }

    return {
      totalGrossAmount: 0,
      totalPlatformCommission: 0,
      totalVendorEarnings: 0,
    };
  };

  async findPayableBookingsBySchedule(scheduleId: string): Promise<SchedulePayoutTotals | null> {
    const result = await this.model.aggregate([
      {
        $match: {
          scheduleId: toObjectId(scheduleId),
          bookingStatus: BOOKING_STATUS.CONFIRMED,
        }
      },
      {
        $group: {
          _id: '$vendorId',
          grossAmount: { $sum: '$finalAmount' },
          commissionAmount: { $sum: '$platformCommission' },
          netAmount: { $sum: '$vendorEarning' },
          bookingIds: { $push: '$_id' },
          bookingCount: { $sum: 1 }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return null;
    }

    const totals = result[0];
    return {
      vendorId: totals._id.toString(),
      grossAmount: totals.grossAmount,
      commissionAmount: totals.commissionAmount,
      netAmount: totals.netAmount,
      bookingIds: totals.bookingIds.map((id: Types.ObjectId) => id as Types.ObjectId),
      bookingCount: totals.bookingCount
    };
  }

}
