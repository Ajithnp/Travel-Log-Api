"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const payout_model_1 = require("../models/payout.model");
const constants_1 = require("../shared/constants/constants");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const date_helper_1 = require("../shared/utils/date.helper");
let PayoutRepository = class PayoutRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(payout_model_1.PayoutModel);
    }
    updateStatus(payoutId, status, extras) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findByIdAndUpdate(payoutId, Object.assign({ status }, extras));
        });
    }
    payoutStats() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const pipeline = [
                {
                    $facet: {
                        totalPayouts: [{ $group: { _id: null, value: { $sum: 1 } } }],
                        completedPayouts: [
                            { $match: { status: constants_1.PAYOUT_STATUS.COMPLETED } },
                            { $group: { _id: null, value: { $sum: 1 } } },
                        ],
                        failedPayouts: [
                            { $match: { status: constants_1.PAYOUT_STATUS.FAILED } },
                            { $group: { _id: null, value: { $sum: 1 } } },
                        ],
                        processingPayouts: [
                            { $match: { status: constants_1.PAYOUT_STATUS.PROCESSING } },
                            { $group: { _id: null, value: { $sum: 1 } } },
                        ],
                        totalRevenue: [{ $group: { _id: null, value: { $sum: '$grossAmount' } } }],
                        totalCommision: [{ $group: { _id: null, value: { $sum: '$commissionAmount' } } }],
                        totalNetAmount: [{ $group: { _id: null, value: { $sum: '$netAmount' } } }],
                    },
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            return {
                totalPayouts: ((_b = (_a = result === null || result === void 0 ? void 0 : result.totalPayouts) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || 0,
                totalReleased: ((_d = (_c = result === null || result === void 0 ? void 0 : result.completedPayouts) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || 0,
                totalFailed: ((_f = (_e = result === null || result === void 0 ? void 0 : result.failedPayouts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) || 0,
                totalRevanue: ((_h = (_g = result === null || result === void 0 ? void 0 : result.totalRevenue) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.value) || 0,
                commissionEarned: ((_k = (_j = result === null || result === void 0 ? void 0 : result.totalCommision) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.value) || 0,
                netAmount: ((_m = (_l = result === null || result === void 0 ? void 0 : result.totalNetAmount) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.value) || 0,
            };
        });
    }
    findAllPayouts(page, limit, search, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const matchStage = {};
            if (filter) {
                matchStage.status = filter;
            }
            const pipeline = [
                { $match: matchStage },
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
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: 'scheduleId',
                        foreignField: '_id',
                        as: 'scheduleData',
                    },
                },
                { $addFields: { schedule: { $arrayElemAt: ['$scheduleData', 0] } } },
                {
                    $lookup: {
                        from: 'packages',
                        localField: 'schedule.packageId',
                        foreignField: '_id',
                        as: 'packageData',
                        pipeline: [{ $project: { title: 1 } }],
                    },
                },
                { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
            ];
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                pipeline.push({
                    $match: {
                        $or: [
                            { 'vendor.name': { $regex: search.trim(), $options: 'i' } },
                            { 'package.title': { $regex: search.trim(), $options: 'i' } },
                        ],
                    },
                });
            }
            pipeline.push({
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                scheduleId: '$schedule._id',
                                vendorname: '$vendor.name',
                                scheduleStartDate: '$schedule.startDate',
                                scheduleEndDate: '$schedule.endDate',
                                packageTittle: '$package.title',
                                grossAmount: 1,
                                commissionAmount: 1,
                                netAmount: 1,
                                status: 1,
                                scheduledAt: 1,
                            },
                        },
                    ],
                },
            });
            const [result] = yield this.model.aggregate(pipeline);
            return {
                payouts: (result === null || result === void 0 ? void 0 : result.data) || [],
                total: ((_a = result === null || result === void 0 ? void 0 : result.metadata[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            };
        });
    }
    findAllPayoutsByVendor(vendorId, page, limit, search, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const pipeline = [
                {
                    $match: Object.assign({ vendorId: (0, objectId_helper_1.toObjectId)(vendorId) }, (filter ? { status: filter } : {})),
                },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: 'scheduleId',
                        foreignField: '_id',
                        as: 'schedule',
                        pipeline: [{ $project: { startDate: 1, endDate: 1, packageId: 1 } }],
                    },
                },
                { $addFields: { schedule: { $arrayElemAt: ['$schedule', 0] } } },
                {
                    $lookup: {
                        from: 'packages',
                        localField: 'schedule.packageId',
                        foreignField: '_id',
                        as: 'packageData',
                        pipeline: [{ $project: { title: 1 } }],
                    },
                },
                { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
            ];
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                pipeline.push({
                    $match: {
                        'package.title': { $regex: search.trim(), $options: 'i' },
                    },
                });
            }
            pipeline.push({
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                payoutId: '$_id',
                                scheduleId: '$scheduleId',
                                scheduleStartDate: '$schedule.startDate',
                                scheduleEndDate: '$schedule.endDate',
                                packageTittle: '$package.title',
                                grossAmount: 1,
                                commissionAmount: 1,
                                netAmount: 1,
                                status: 1,
                                scheduledAt: 1,
                            },
                        },
                    ],
                },
            });
            const [result] = yield this.model.aggregate(pipeline);
            return {
                payouts: (result === null || result === void 0 ? void 0 : result.data) || [],
                total: ((_a = result === null || result === void 0 ? void 0 : result.metadata[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            };
        });
    }
    revenueStatsByVendor(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
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
                        total: [{ $group: { _id: null, value: { $sum: '$netAmount' } } }],
                        currentMonth: [
                            {
                                $match: {
                                    createdAt: { $gte: currentMonthStart },
                                },
                            },
                            { $group: { _id: null, value: { $sum: '$netAmount' } } },
                        ],
                        previousMonth: [
                            {
                                $match: {
                                    createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
                                },
                            },
                            { $group: { _id: null, value: { $sum: '$netAmount' } } },
                        ],
                    },
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            const totalRevanue = ((_b = (_a = result === null || result === void 0 ? void 0 : result.total) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || 0;
            const currentMonthRevanue = ((_d = (_c = result === null || result === void 0 ? void 0 : result.currentMonth) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || 0;
            const previousMonthRevanue = ((_f = (_e = result === null || result === void 0 ? void 0 : result.previousMonth) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) || 0;
            return {
                totalRevanue,
                currentMonthRevanue,
                previousMonthRevanue,
                hasGrowth: currentMonthRevanue > previousMonthRevanue,
            };
        });
    }
    getTotalEarnings() {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield this.model.aggregate([
                {
                    $group: {
                        _id: null,
                        totalVendorEarnings: { $sum: '$netAmount' },
                        totalCommission: { $sum: '$commissionAmount' },
                        totalBookings: { $sum: { $size: '$bookingIds' } },
                    },
                },
            ]);
            return {
                totalVendorEarnings: (result === null || result === void 0 ? void 0 : result.totalVendorEarnings) || 0,
                totalCommission: (result === null || result === void 0 ? void 0 : result.totalCommission) || 0,
                totalBookings: (result === null || result === void 0 ? void 0 : result.totalBookings) || 0,
            };
        });
    }
    findTop5Packages() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: 'scheduleId',
                        foreignField: '_id',
                        as: 'schedule',
                        pipeline: [{ $project: { packageId: 1 } }],
                    },
                },
                { $addFields: { schedule: { $arrayElemAt: ['$schedule', 0] } } },
                {
                    $group: {
                        _id: '$schedule.packageId',
                        revanueGenerate: { $sum: '$commissionAmount' },
                        totalScheduleCompleted: { $sum: 1 },
                    },
                },
                { $sort: { revanueGenerate: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'packages',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'package',
                        pipeline: [{ $project: { title: 1 } }],
                    },
                },
                { $addFields: { package: { $arrayElemAt: ['$package', 0] } } },
                {
                    $project: {
                        _id: 0,
                        id: '$package._id',
                        packageTitle: { $ifNull: ['$package.title', 'Unknown Package'] },
                        revanueGenerate: 1,
                        totalScheduleCompleted: 1,
                    },
                },
            ]);
            return result;
        });
    }
    platformRevenueTrend(startDate, endDate, granularity) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.aggregate([
                {
                    $match: {
                        status: constants_1.PAYOUT_STATUS.COMPLETED,
                        createdAt: { $gte: startDate, $lte: endDate },
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
                        totalRevenue: { $sum: '$grossAmount' },
                        totalCommission: { $sum: '$commissionAmount' },
                        totalVendorEarnings: { $sum: '$netAmount' },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
        });
    }
};
exports.PayoutRepository = PayoutRepository;
exports.PayoutRepository = PayoutRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], PayoutRepository);
