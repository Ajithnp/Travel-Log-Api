"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.SchedulePackageRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const schedule_model_1 = __importDefault(require("../models/schedule.model"));
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../shared/constants/constants");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const booking_1 = require("../shared/constants/booking");
let SchedulePackageRepository = class SchedulePackageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(schedule_model_1.default);
    }
    findOverlapping(packageId, startDate, endDate, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                packageId: new mongoose_1.default.Types.ObjectId(packageId),
                status: { $in: [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.ONGOING] },
                startDate: { $lte: endDate },
                endDate: { $gte: startDate },
            };
            if (excludeId) {
                query._id = { $ne: new mongoose_1.default.Types.ObjectId(excludeId) };
            }
            return this.findOne(query);
        });
    }
    findSchedulesWithPackage(filters, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = {
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
            };
            if ((_a = filters.selectedFilter) === null || _a === void 0 ? void 0 : _a.trim()) {
                query.status = filters.selectedFilter;
            }
            if (filters.startDate || filters.endDate) {
                query.startDate = Object.assign(Object.assign({}, (filters.startDate ? { $gte: new Date(filters.startDate) } : {})), (filters.endDate ? { $lte: new Date(filters.endDate) } : {}));
            }
            const skip = (filters.page - 1) * filters.limit;
            const [schedules, total] = yield Promise.all([
                this.model
                    .find(query)
                    .populate('packageId', 'title days difficultyLevel')
                    .sort({ startDate: -1 })
                    .skip(skip)
                    .limit(filters.limit)
                    .lean(),
                this.model.countDocuments(query),
            ]);
            return { schedules, total };
        });
    }
    getStatusCounts(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                { $match: { vendorId: (0, objectId_helper_1.toObjectId)(vendorId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]);
            return result.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});
        });
    }
    findPublicSchedulesByPackage(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .find({
                packageId: new mongoose_1.default.Types.ObjectId(packageId),
                status: { $in: [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT] },
            })
                .sort({ startDate: 1 })
                .lean();
        });
    }
    countCompletedByVendor(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.countDocuments({
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                status: constants_1.SCHEDULE_STATUS.COMPLETED,
            });
        });
    }
    confirmSeats(scheduleId, seatsCount, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOneAndUpdate({
                _id: new mongoose_1.Types.ObjectId(scheduleId),
            }, { $inc: { seatsBooked: seatsCount } }, { new: true, session });
        });
    }
    cancelSeats(scheduleId, seatsCount, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.updateOne({
                _id: new mongoose_1.Types.ObjectId(scheduleId),
            }, { $inc: { seatsBooked: -seatsCount } }, { session });
        });
    }
    updateScheduleStatus(scheduleId, status, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.updateOne({
                _id: new mongoose_1.Types.ObjectId(scheduleId),
            }, { $set: { status } }, { session });
        });
    }
    getPackageSchedules(packageId, page, limit, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const pipeline = [
                {
                    $match: Object.assign({ packageId: (0, objectId_helper_1.toObjectId)(packageId) }, (filter
                        ? { status: filter }
                        : {
                            status: {
                                $in: [
                                    constants_1.SCHEDULE_STATUS.UPCOMING,
                                    constants_1.SCHEDULE_STATUS.SOLD_OUT,
                                    constants_1.SCHEDULE_STATUS.COMPLETED,
                                ],
                            },
                        })),
                },
                {
                    $lookup: {
                        from: 'bookings',
                        localField: '_id',
                        foreignField: 'scheduleId',
                        pipeline: [
                            {
                                $match: {
                                    bookingStatus: { $ne: booking_1.BOOKING_STATUS.CANCELLED_BY_USER },
                                },
                            },
                        ],
                        as: 'bookings',
                    },
                },
                {
                    $facet: {
                        metadata: [{ $count: 'total' }],
                        data: [
                            { $sort: { startDate: 1 } },
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 1,
                                    startDate: 1,
                                    endDate: 1,
                                    totalSeats: 1,
                                    status: 1,
                                    soldSeats: '$seatsBooked',
                                    bookingsCount: { $size: '$bookings' },
                                    totalRevanue: { $sum: '$bookings.finalAmount' },
                                },
                            },
                        ],
                    },
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            const total = (_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.metadata) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.total) !== null && _c !== void 0 ? _c : 0;
            const schedules = (_d = result === null || result === void 0 ? void 0 : result.data) !== null && _d !== void 0 ? _d : [];
            return { schedules, total };
        });
    }
    getSchedulesAll(page, limit, filter, search) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const matchStage = {};
            if (filter) {
                matchStage.status = filter;
            }
            const pipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'packages',
                        localField: 'packageId',
                        foreignField: '_id',
                        as: 'packageData',
                        pipeline: [{ $project: { title: 1, location: 1, days: 1 } }],
                    },
                },
                { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'vendorId',
                        foreignField: '_id',
                        as: 'vendorData',
                        pipeline: [{ $project: { name: 1 } }],
                    },
                },
                { $addFields: { vendor: { $arrayElemAt: ['$vendorData', 0] } } },
            ];
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                const regex = { $regex: search.trim(), $options: 'i' };
                pipeline.push({
                    $match: {
                        $or: [
                            { 'package.title': regex },
                            { 'package.location': regex },
                            { 'vendor.name': regex },
                        ],
                    },
                });
            }
            pipeline.push({
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'scheduleId',
                    pipeline: [
                        {
                            $match: {
                                bookingStatus: { $ne: booking_1.BOOKING_STATUS.CANCELLED_BY_USER },
                            },
                        },
                        { $project: { finalAmount: 1 } },
                    ],
                    as: 'bookings',
                },
            }, {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { startDate: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                packageTittle: '$package.title',
                                packageLocation: '$package.location',
                                totalDays: { $toInt: '$package.days' },
                                vendorName: '$vendor.name',
                                startDate: 1,
                                endDate: 1,
                                totalSeats: 1,
                                totalBooked: '$seatsBooked',
                                status: 1,
                                totalRevanue: { $sum: '$bookings.finalAmount' },
                            },
                        },
                    ],
                },
            });
            const [result] = yield this.model.aggregate(pipeline);
            const total = (_c = (_b = (_a = result.metadata) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.total) !== null && _c !== void 0 ? _c : 0;
            const schedules = (_d = result.data) !== null && _d !== void 0 ? _d : [];
            return { schedules, total };
        });
    }
    getPayoutSchedulesCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const pipeline = [
                {
                    $match: {
                        status: constants_1.SCHEDULE_STATUS.COMPLETED,
                        payoutStatus: constants_1.PAYOUT_STATUS.PENDING,
                        endDate: { $lte: twoDaysAgo },
                    },
                },
                {
                    $count: 'count',
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            return (result === null || result === void 0 ? void 0 : result.count) || 0;
        });
    }
    getSchedulesForPayout(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const matchStage = {
                status: constants_1.SCHEDULE_STATUS.COMPLETED,
                payoutStatus: constants_1.PAYOUT_STATUS.PENDING,
            };
            const pipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'packages',
                        localField: 'packageId',
                        foreignField: '_id',
                        as: 'packageData',
                        pipeline: [{ $project: { title: 1 } }],
                    },
                },
                { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'vendorId',
                        foreignField: '_id',
                        as: 'vendorData',
                        pipeline: [{ $project: { name: 1 } }],
                    },
                },
                { $addFields: { vendor: { $arrayElemAt: ['$vendorData', 0] } } },
            ];
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                const regex = { $regex: search.trim(), $options: 'i' };
                pipeline.push({
                    $match: {
                        $or: [{ 'package.title': regex }, { 'vendor.name': regex }],
                    },
                });
            }
            pipeline.push({
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'scheduleId',
                    pipeline: [
                        {
                            $match: {
                                bookingStatus: { $nin: [booking_1.BOOKING_STATUS.PENDING, booking_1.BOOKING_STATUS.PAYMENT_FAILED] },
                                paymentStatus: { $eq: booking_1.PAYMENT_STATUS.PAID },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                grossAmount: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    '$bookingStatus',
                                                    [booking_1.BOOKING_STATUS.COMPLETED, booking_1.BOOKING_STATUS.CONFIRMED],
                                                ],
                                            },
                                            '$finalAmount',
                                            0,
                                        ],
                                    },
                                },
                                commissionAmount: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    '$bookingStatus',
                                                    [booking_1.BOOKING_STATUS.COMPLETED, booking_1.BOOKING_STATUS.CONFIRMED],
                                                ],
                                            },
                                            '$platformCommission',
                                            0,
                                        ],
                                    },
                                },
                                netAmount: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    '$bookingStatus',
                                                    [booking_1.BOOKING_STATUS.COMPLETED, booking_1.BOOKING_STATUS.CONFIRMED],
                                                ],
                                            },
                                            '$vendorEarning',
                                            0,
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
                    ],
                    as: 'bookings',
                },
            }, {
                $lookup: {
                    from: 'vendorinfos',
                    localField: 'vendorId',
                    foreignField: 'userId',
                    as: 'vendorInfoData',
                    pipeline: [{ $project: { transactionConnect: 1 } }],
                },
            }, {
                $lookup: {
                    from: 'payouts',
                    localField: '_id',
                    foreignField: 'scheduleId',
                    as: 'failedPayouts',
                    pipeline: [{ $match: { status: constants_1.PAYOUT_STATUS.FAILED } }, { $project: { _id: 1 } }],
                },
            }, {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { endDate: 1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                vendorId: 1,
                                vendorname: '$vendor.name',
                                scheduleId: '$_id',
                                scheduleStartDate: '$startDate',
                                scheduleEndDate: '$endDate',
                                packageTittle: '$package.title',
                                grossAmount: { $ifNull: [{ $arrayElemAt: ['$bookings.grossAmount', 0] }, 0] },
                                commissionAmount: {
                                    $ifNull: [{ $arrayElemAt: ['$bookings.commissionAmount', 0] }, 0],
                                },
                                netAmount: { $ifNull: [{ $arrayElemAt: ['$bookings.netAmount', 0] }, 0] },
                                totalRefundedAmount: {
                                    $ifNull: [{ $arrayElemAt: ['$bookings.totalRefundedAmount', 0] }, 0],
                                },
                                status: 1,
                                scheduledAt: '$createdAt',
                                payoutsEnabled: {
                                    $let: {
                                        vars: { info: { $arrayElemAt: ['$vendorInfoData', 0] } },
                                        in: { $ifNull: ['$$info.transactionConnect.payoutsEnabled', false] },
                                    },
                                },
                                transactionConnectId: {
                                    $let: {
                                        vars: { info: { $arrayElemAt: ['$vendorInfoData', 0] } },
                                        in: { $ifNull: ['$$info.transactionConnect.accountId', ''] },
                                    },
                                },
                                readyToPayout: {
                                    $lte: [{ $add: ['$endDate', 2 * 24 * 60 * 60 * 1000] }, new Date()],
                                },
                                alreadyFailed: { $gt: [{ $size: '$failedPayouts' }, 0] },
                            },
                        },
                    ],
                },
            });
            const [result] = yield this.model.aggregate(pipeline);
            const total = (_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.metadata) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.total) !== null && _c !== void 0 ? _c : 0;
            const schedules = (_d = result === null || result === void 0 ? void 0 : result.data) !== null && _d !== void 0 ? _d : [];
            return { schedules, total };
        });
    }
    markSchedulePayoutAsCompleted(scheduleId, payoutId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(scheduleId) }, { payoutStatus: 'paid', payoutId }, { new: true });
        });
    }
    scheduledStatsByVendor(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const now = new Date();
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            const pipeline = [
                {
                    $match: {
                        vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                    },
                },
                {
                    $facet: {
                        total: [
                            { $match: { status: constants_1.SCHEDULE_STATUS.COMPLETED } },
                            { $group: { _id: null, value: { $sum: 1 } } },
                        ],
                        currentMonth: [
                            {
                                $match: {
                                    createdAt: { $gte: currentMonthStart },
                                    status: {
                                        $in: [
                                            constants_1.SCHEDULE_STATUS.COMPLETED,
                                            constants_1.SCHEDULE_STATUS.ONGOING,
                                            constants_1.SCHEDULE_STATUS.SOLD_OUT,
                                            constants_1.SCHEDULE_STATUS.UPCOMING,
                                        ],
                                    },
                                },
                            },
                            { $group: { _id: null, value: { $sum: 1 } } },
                        ],
                        previousMonth: [
                            {
                                $match: {
                                    createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
                                    status: {
                                        $in: [
                                            constants_1.SCHEDULE_STATUS.COMPLETED,
                                            constants_1.SCHEDULE_STATUS.ONGOING,
                                            constants_1.SCHEDULE_STATUS.SOLD_OUT,
                                            constants_1.SCHEDULE_STATUS.UPCOMING,
                                        ],
                                    },
                                },
                            },
                            { $group: { _id: null, value: { $sum: 1 } } },
                        ],
                        activeSchedule: [
                            {
                                $match: {
                                    status: { $in: [constants_1.SCHEDULE_STATUS.ONGOING, constants_1.SCHEDULE_STATUS.UPCOMING] },
                                },
                            },
                            { $count: 'count' },
                        ],
                        ongoingSchedule: [
                            {
                                $match: {
                                    status: { $in: [constants_1.SCHEDULE_STATUS.ONGOING] },
                                },
                            },
                            { $count: 'count' },
                        ],
                    },
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            const totalSchedule = ((_b = (_a = result === null || result === void 0 ? void 0 : result.total) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || 0;
            const currentMonthRevanue = ((_d = (_c = result === null || result === void 0 ? void 0 : result.currentMonth) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || 0;
            const previousMonthRevanue = ((_f = (_e = result === null || result === void 0 ? void 0 : result.previousMonth) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) || 0;
            const activeSchedule = ((_h = (_g = result === null || result === void 0 ? void 0 : result.activeSchedule) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.count) || 0;
            const ongoingSchedule = ((_k = (_j = result === null || result === void 0 ? void 0 : result.ongoingSchedule) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.count) || 0;
            return {
                totalSchedule,
                currentMonthSchedule: currentMonthRevanue,
                hasGrowth: currentMonthRevanue > previousMonthRevanue,
                activeSchedule,
                ongoingSchedule,
            };
        });
    }
    getUpcomingSchedules(vendorId_1) {
        return __awaiter(this, arguments, void 0, function* (vendorId, limit = 5) {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                        status: {
                            $in: [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT, constants_1.SCHEDULE_STATUS.ONGOING],
                        },
                    },
                },
                { $sort: { startDate: 1 } },
                { $limit: limit },
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
                        from: 'bookings',
                        localField: '_id',
                        foreignField: 'scheduleId',
                        as: 'bookings',
                        pipeline: [{ $match: { bookingStatus: booking_1.BOOKING_STATUS.CONFIRMED } }],
                    },
                },
                {
                    $addFields: {
                        package: { $arrayElemAt: ['$package', 0] },
                        bookedCount: { $sum: '$bookings.travelerCount' },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        startDate: 1,
                        endDate: 1,
                        packageTitle: '$package.title',
                        status: 1,
                        bookedCount: 1,
                        totalSeats: 1,
                    },
                },
            ]);
            return result;
        });
    }
    getScheduleStats() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const [result] = yield this.model.aggregate([
                {
                    $facet: {
                        active: [
                            {
                                $match: {
                                    status: {
                                        $in: [
                                            constants_1.SCHEDULE_STATUS.UPCOMING,
                                            constants_1.SCHEDULE_STATUS.SOLD_OUT,
                                            constants_1.SCHEDULE_STATUS.ONGOING,
                                        ],
                                    },
                                },
                            },
                            { $count: 'count' },
                        ],
                        completed: [
                            {
                                $match: { status: constants_1.SCHEDULE_STATUS.COMPLETED },
                            },
                            { $count: 'count' },
                        ],
                    },
                },
            ]);
            return {
                activeSchedules: ((_b = (_a = result === null || result === void 0 ? void 0 : result.active) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
                completedSchedules: ((_d = (_c = result === null || result === void 0 ? void 0 : result.completed) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.count) || 0,
            };
        });
    }
};
exports.SchedulePackageRepository = SchedulePackageRepository;
exports.SchedulePackageRepository = SchedulePackageRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], SchedulePackageRepository);
