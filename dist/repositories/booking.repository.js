"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const base_repository_1 = require("./base.repository");
const booking_model_1 = __importDefault(require("../models/booking.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const booking_1 = require("../shared/constants/booking");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const date_helper_1 = require("../shared/utils/date.helper");
class BookingRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(booking_model_1.default);
    }
    createBooking(data, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this.model.create([data], { session });
            return booking[0];
        });
    }
    findActiveBookingByUserAndSchedule(userId, scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                scheduleId: new mongoose_1.default.Types.ObjectId(scheduleId),
                bookingStatus: {
                    $nin: [booking_1.BOOKING_STATUS.CANCELLED_BY_USER],
                },
            })
                .lean();
        });
    }
    attachPaymentIntent(bookingId, paymentIntentId, session) {
        return this.model
            .findByIdAndUpdate(bookingId, { transactionId: paymentIntentId }, { new: true, session })
            .lean();
    }
    markFailedPayment(bookingId, session) {
        return this.model
            .findByIdAndUpdate(bookingId, { bookingStatus: booking_1.BOOKING_STATUS.PAYMENT_FAILED }, { new: true, session })
            .lean();
    }
    confirmBooking(userId, bookingId, stripePaymentIntentId, session) {
        return this.model
            .findOneAndUpdate({
            _id: new mongoose_1.default.Types.ObjectId(bookingId),
            userId: new mongoose_1.default.Types.ObjectId(userId),
        }, {
            bookingStatus: booking_1.BOOKING_STATUS.CONFIRMED,
            paymentStatus: booking_1.PAYMENT_STATUS.PAID,
            transactionId: stripePaymentIntentId ? stripePaymentIntentId : null,
        }, { new: true, session })
            .lean();
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id))
                return null;
            return this.model
                .findById(id)
                .populate('packageId', 'title destination duration cancellationPolicy images meetingPoint')
                .populate('scheduleId', 'startDate endDate reportingTime reportingLocation pricing notes')
                .populate('vendorId', 'businessName profilePhoto')
                .lean();
        });
    }
    findByIdAndUserLean(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findOne({
                _id: new mongoose_1.default.Types.ObjectId(id),
                userId: new mongoose_1.default.Types.ObjectId(userId),
            })
                .populate('packageId', 'title')
                .lean();
        });
    }
    findOneAndPopulate(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId))
                return null;
            const booking = yield this.model
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
            return booking;
        });
    }
    findBookings(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [];
            const matchStage = {
                userId: new mongoose_1.default.Types.ObjectId(filters.userId),
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
            const [result] = yield this.model.aggregate(pipeline);
            const bookings = result.bookings;
            const totalCount = result.totalCount[0] ? result.totalCount[0].count : 0;
            return { bookings, total: totalCount };
        });
    }
    findByIdAndUser(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return null;
            }
            const booking = yield this.model
                .findOne({
                _id: new mongoose_1.default.Types.ObjectId(id),
                userId: new mongoose_1.default.Types.ObjectId(userId),
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
            return booking;
        });
    }
    cancelBooking(bookingId, userId, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findOneAndUpdate({
                _id: bookingId,
                userId: userId,
            }, { $set: update }, { new: true })
                .lean();
        });
    }
    getCancellationRequests(page, limit, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [];
            const matchStage = {
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
            const [result] = yield this.model.aggregate(pipeline);
            const requests = result.requests || [];
            const totalCount = result.totalCount[0] ? result.totalCount[0].count : 0;
            return { requests, total: totalCount };
        });
    }
    getCancellationRequestById(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                return null;
            }
            const booking = (yield this.model
                .findOne({ _id: new mongoose_1.default.Types.ObjectId(bookingId) })
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
                .lean());
            return booking;
        });
    }
    updateCancellationStatus(bookingId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                return null;
            }
            return this.model
                .findByIdAndUpdate(bookingId, { cancellationStatus: status }, { new: true })
                .lean();
        });
    }
    findOneAndUpdateReject(bookingId, rejectedReason) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                return null;
            }
            return this.findOneAndUpdate({
                _id: bookingId,
            }, {
                cancellationStatus: booking_1.CANCELATION_STATUS.REJECTED,
                cancellationRejectedReason: rejectedReason,
            }, { new: true });
        });
    }
    findBookingWithSession(bookingId, session) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                return null;
            }
            return this.model
                .findOne({ _id: new mongoose_1.default.Types.ObjectId(bookingId) })
                .populate('packageId', 'title')
                .session(session)
                .lean();
        });
    }
    updateBookingWithSession(bookingId, update, session) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                return null;
            }
            return this.model
                .findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(bookingId) }, update, {
                new: true,
                session,
            })
                .lean();
        });
    }
    getVendorScheduleBookingSummary(scheduleId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.model.aggregate([
                {
                    $match: {
                        scheduleId: new mongoose_1.default.Types.ObjectId(scheduleId),
                        vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalConfirmedBookings: {
                            $sum: {
                                $cond: [{ $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CONFIRMED] }, '$travelerCount', 0],
                            },
                        },
                        totalCancelledBookings: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] },
                                    '$travelerCount',
                                    0,
                                ],
                            },
                        },
                        totalConfirmedAmount: {
                            $sum: {
                                $cond: [{ $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CONFIRMED] }, '$finalAmount', 0],
                            },
                        },
                        totalCancelledAmount: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] },
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
                                            { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CONFIRMED] },
                                            '$vendorEarning',
                                            0,
                                        ],
                                    },
                                    {
                                        $cond: [
                                            { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] },
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
                                    { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CONFIRMED] },
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
        });
    }
    findBookingsBySchedule(scheduleId, vendorId, page, limit, search, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchStage = {
                scheduleId: new mongoose_1.default.Types.ObjectId(scheduleId),
                vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
            };
            if (filter) {
                matchStage.bookingStatus = filter;
            }
            const pipeline = [
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
            const [result] = yield this.model.aggregate(pipeline);
            const bookings = result.bookings;
            const totalCount = result.totalCount[0] ? result.totalCount[0].count : 0;
            return { bookings, total: totalCount };
        });
    }
    getVendorBookingDetails(bookingId, scheduleId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this.model
                .findOne({
                _id: new mongoose_1.default.Types.ObjectId(bookingId),
                scheduleId: new mongoose_1.default.Types.ObjectId(scheduleId),
                vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
            })
                .populate('userId', 'name')
                .lean();
            return booking;
        });
    }
    getTotalRevanueByVendorId(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
                        bookingStatus: booking_1.BOOKING_STATUS.COMPLETED,
                    },
                },
                { $group: { _id: '$vendorId', totalRevenue: { $sum: '$vendorEarning' } } },
            ]);
            return result.length > 0 ? { totalRevenue: result[0].totalRevenue } : null;
        });
    }
    getCommissionOverview() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        bookingStatus: booking_1.BOOKING_STATUS.COMPLETED,
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
        });
    }
    findPayableBookingsBySchedule(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        scheduleId: (0, objectId_helper_1.toObjectId)(scheduleId),
                        paymentStatus: { $in: [booking_1.PAYMENT_STATUS.PAID, booking_1.PAYMENT_STATUS.REFUNDED] },
                        bookingStatus: { $nin: [booking_1.BOOKING_STATUS.PENDING, booking_1.BOOKING_STATUS.PAYMENT_FAILED] },
                    },
                },
                {
                    $group: {
                        _id: '$vendorId',
                        grossAmount: {
                            $sum: {
                                $cond: [
                                    { $in: ['$bookingStatus', [booking_1.BOOKING_STATUS.COMPLETED, booking_1.BOOKING_STATUS.CONFIRMED]] },
                                    '$finalAmount',
                                    0,
                                ],
                            },
                        },
                        commissionAmount: {
                            $sum: {
                                $cond: [
                                    { $in: ['$bookingStatus', [booking_1.BOOKING_STATUS.COMPLETED, booking_1.BOOKING_STATUS.CONFIRMED]] },
                                    '$platformCommission',
                                    0,
                                ],
                            },
                        },
                        vendorEarnings: {
                            $sum: {
                                $cond: [
                                    { $in: ['$bookingStatus', [booking_1.BOOKING_STATUS.COMPLETED, booking_1.BOOKING_STATUS.CONFIRMED]] },
                                    '$vendorEarning',
                                    0,
                                ],
                            },
                        },
                        totalAmountFromCancelation: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] },
                                    { $subtract: ['$finalAmount', { $ifNull: ['$cancelationRefundAmount', 0] }] },
                                    0,
                                ],
                            },
                        },
                        bookingIds: { $push: '$_id' },
                        bookingCount: { $sum: 1 },
                    },
                },
            ]);
            if (!result || result.length === 0) {
                return null;
            }
            const totals = result[0];
            return {
                vendorId: totals._id.toString(),
                grossAmount: totals.grossAmount,
                commissionAmount: totals.commissionAmount,
                vendorEarnings: totals.vendorEarnings,
                totalAmountFromCancelation: totals.totalAmountFromCancelation,
                bookingIds: totals.bookingIds.map((id) => id),
                bookingCount: totals.bookingCount,
            };
        });
    }
    findAllBookingsByScheduleId(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        scheduleId: (0, objectId_helper_1.toObjectId)(scheduleId),
                        bookingStatus: {
                            $nin: [
                                booking_1.BOOKING_STATUS.PENDING,
                                booking_1.BOOKING_STATUS.PAYMENT_FAILED,
                                booking_1.BOOKING_STATUS.CANCELLED_BY_USER,
                            ],
                        },
                        paymentStatus: { $in: [booking_1.PAYMENT_STATUS.PAID, booking_1.PAYMENT_STATUS.REFUNDED] },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                        pipeline: [{ $project: { name: 1 } }],
                    },
                },
                { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
                {
                    $project: {
                        _id: 0,
                        userName: '$user.name',
                        selectedGroupType: '$groupType',
                        finalAmount: 1,
                        platformCommission: 1,
                        vendorEarning: 1,
                    },
                },
            ]);
            return result.length > 0 ? result : null;
        });
    }
    findBookingStatsByScheduleId(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const result = yield this.model.aggregate([
                {
                    $match: {
                        scheduleId: (0, objectId_helper_1.toObjectId)(scheduleId),
                        bookingStatus: { $nin: [booking_1.BOOKING_STATUS.PENDING, booking_1.BOOKING_STATUS.PAYMENT_FAILED] },
                        paymentStatus: { $in: [booking_1.PAYMENT_STATUS.PAID, booking_1.PAYMENT_STATUS.REFUNDED] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        scheduleId: { $first: '$scheduleId' },
                        packageId: { $first: '$packageId' },
                        vendorId: { $first: '$vendorId' },
                        totalBookingsCount: { $sum: 1 },
                        totalCancellationsCount: {
                            $sum: { $cond: [{ $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] }, 1, 0] },
                        },
                        totalBookingGross: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] },
                                    0,
                                    '$finalAmount',
                                ],
                            },
                        },
                        totalPlatformCommission: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] },
                                    0,
                                    '$platformCommission',
                                ],
                            },
                        },
                        totalVendorEarnings: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] },
                                    0,
                                    '$vendorEarning',
                                ],
                            },
                        },
                        totalRefundedAmount: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$bookingStatus', booking_1.BOOKING_STATUS.CANCELLED_BY_USER] },
                                    { $subtract: ['$finalAmount', { $ifNull: ['$cancelationRefundAmount', 0] }] },
                                    0,
                                ],
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: 'scheduleId',
                        foreignField: '_id',
                        as: 'schedule',
                    },
                },
                {
                    $lookup: {
                        from: 'packages',
                        localField: 'packageId',
                        foreignField: '_id',
                        as: 'package',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'vendorId',
                        foreignField: '_id',
                        as: 'vendor',
                    },
                },
                { $unwind: { path: '$schedule', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$package', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
            ]);
            if (!result || result.length === 0) {
                return null;
            }
            const totals = result[0];
            return {
                packageTitle: (_b = (_a = totals.package) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : 'Unknown Package',
                vendorName: (_d = (_c = totals.vendor) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : 'Unknown Vendor',
                scheduleStartDate: (_e = totals.schedule) === null || _e === void 0 ? void 0 : _e.startDate,
                scheduleEndDate: (_f = totals.schedule) === null || _f === void 0 ? void 0 : _f.endDate,
                schedulePayoutStatus: totals.schedule.payoutStatus,
                totalBookingsCount: totals.totalBookingsCount,
                totalCancellationsCount: totals.totalCancellationsCount,
                totalBookingGross: totals.totalBookingGross,
                totalPlatformCommission: totals.totalPlatformCommission,
                totalVendorEarnings: totals.totalVendorEarnings,
                totalRefundedAmount: totals.totalRefundedAmount,
            };
        });
    }
    payoutOverviewByScheduleId(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        scheduleId: (0, objectId_helper_1.toObjectId)(scheduleId),
                        bookingStatus: {
                            $nin: [
                                booking_1.BOOKING_STATUS.PENDING,
                                booking_1.BOOKING_STATUS.PAYMENT_FAILED,
                                booking_1.BOOKING_STATUS.CANCELLED_BY_USER,
                            ],
                        },
                        paymentStatus: { $in: [booking_1.PAYMENT_STATUS.PAID, booking_1.PAYMENT_STATUS.REFUNDED] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalGrossAmount: { $sum: '$finalAmount' },
                        totalPlatformCommission: { $sum: '$platformCommission' },
                        totalVendorEarnings: { $sum: '$vendorEarning' },
                        totalBookingsCount: { $sum: 1 },
                    },
                },
            ]);
            if (result.length > 0) {
                return {
                    totalBookingsCount: result[0].totalBookingsCount || 0,
                    totalGrossAmount: result[0].totalGrossAmount || 0,
                    totalPlatformCommission: result[0].totalPlatformCommission || 0,
                    totalVendorEarnings: result[0].totalVendorEarnings || 0,
                };
            }
            return {
                totalBookingsCount: 0,
                totalGrossAmount: 0,
                totalPlatformCommission: 0,
                totalVendorEarnings: 0,
            };
        });
    }
    getAnalytics(vendorId, from, to, granularity) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.aggregate([
                {
                    $match: {
                        vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
                        paymentStatus: booking_1.PAYMENT_STATUS.PAID,
                        bookingStatus: { $in: [booking_1.BOOKING_STATUS.CONFIRMED, booking_1.BOOKING_STATUS.COMPLETED] },
                        createdAt: { $gte: from, $lte: to },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: date_helper_1.GRANULARITY_FORMAT[granularity],
                                date: '$createdAt',
                            },
                        },
                        count: { $sum: 1 },
                        revenue: { $sum: '$vendorEarning' },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
        });
    }
    getTopPerformingPackages(vendorId_1) {
        return __awaiter(this, arguments, void 0, function* (vendorId, limit = 5) {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
                        paymentStatus: booking_1.PAYMENT_STATUS.PAID,
                        bookingStatus: booking_1.BOOKING_STATUS.COMPLETED,
                    },
                },
                {
                    $group: {
                        _id: '$packageId',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'packages',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'pkg',
                    },
                },
                { $addFields: { pkg: { $arrayElemAt: ['$pkg', 0] } } },
                {
                    $project: {
                        packageTitle: { $ifNull: ['$pkg.title', 'Unknown'] },
                        bookingCount: '$count',
                    },
                },
            ]);
            return result;
        });
    }
    getRecentActivity(vendorId_1) {
        return __awaiter(this, arguments, void 0, function* (vendorId, limit = 5) {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
                        paymentStatus: booking_1.PAYMENT_STATUS.PAID,
                        bookingStatus: booking_1.BOOKING_STATUS.CONFIRMED,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                        pipeline: [{ $project: { name: 1, profile: 1 } }],
                    },
                },
                {
                    $lookup: {
                        from: 'packages',
                        localField: 'packageId',
                        foreignField: '_id',
                        as: 'package',
                        pipeline: [{ $project: { title: 1 } }],
                    },
                },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: 'scheduleId',
                        foreignField: '_id',
                        as: 'schedule',
                        pipeline: [{ $project: { startDate: 1, endDate: 1 } }],
                    },
                },
                {
                    $addFields: {
                        user: { $arrayElemAt: ['$user', 0] },
                        package: { $arrayElemAt: ['$package', 0] },
                        schedule: { $arrayElemAt: ['$schedule', 0] },
                    },
                },
                {
                    $project: {
                        id: '$_id',
                        _id: 0,
                        userName: '$user.name',
                        packageTitle: '$package.title',
                        startDate: '$schedule.startDate',
                        endDate: '$schedule.endDate',
                        groupType: '$groupType',
                        travellerCount: '$travellerCount',
                        finalAmount: '$finalAmount',
                        status: '$bookingStatus',
                        createdAt: 1,
                    },
                },
            ]);
            return result;
        });
    }
}
exports.BookingRepository = BookingRepository;
