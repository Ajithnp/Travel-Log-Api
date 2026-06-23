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
exports.VendorInfoRepository = void 0;
const vendor_info_model_1 = require("../models/vendor.info.model");
const base_repository_1 = require("./base.repository");
const tsyringe_1 = require("tsyringe");
const booking_1 = require("../shared/constants/booking");
const constants_1 = require("../shared/constants/constants");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
let VendorInfoRepository = class VendorInfoRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(vendor_info_model_1.VendorInformationModel);
    }
    findVendorWithUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield vendor_info_model_1.VendorInformationModel.findOne({ userId })
                .populate('userId')
                .lean()
                .exec();
            return vendor;
        });
    }
    updateStripeAccountId(vendorId, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model
                .updateOne({ userId: (0, objectId_helper_1.toObjectId)(vendorId) }, { $set: { 'transactionConnect.accountId': accountId } })
                .exec();
        });
    }
    updateStripeAccountStatus(vendorId, onboardingComplete, chargesEnabled, payoutsEnabled) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model
                .updateOne({ userId: (0, objectId_helper_1.toObjectId)(vendorId) }, {
                'transactionConnect.onboardingComplete': onboardingComplete,
                'transactionConnect.chargesEnabled': chargesEnabled,
                'transactionConnect.payoutsEnabled': payoutsEnabled,
            })
                .exec();
        });
    }
    findVendors(vendorSearchQuery_1, vendorFilter_1) {
        return __awaiter(this, arguments, void 0, function* (vendorSearchQuery, vendorFilter, options = { skip: 0, limit: 10, sort: { createdAt: -1 } }) {
            const pipeline = [
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $unwind: '$user',
                },
                { $match: { isProfileVerified: true } },
                { $match: vendorSearchQuery },
                { $match: vendorFilter },
                { $sort: options.sort },
                { $skip: options.skip },
                { $limit: options.limit },
            ];
            const result = yield vendor_info_model_1.VendorInformationModel.aggregate(pipeline);
            return result;
        });
    }
    countVendorDocuments(vendorSearchQuery, vendorFilter, matchQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const pipeline = [
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
            ];
            if (matchQuery)
                pipeline.push({ $match: matchQuery });
            pipeline.push({ $match: vendorSearchQuery }, { $match: vendorFilter }, { $count: 'totalDocs' });
            const result = yield vendor_info_model_1.VendorInformationModel.aggregate(pipeline);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalDocs) || 0;
        });
    }
    findVendorsVerificationDetails(vendorSearchQuery_1, vendorFilter_1) {
        return __awaiter(this, arguments, void 0, function* (vendorSearchQuery, vendorFilter, options = { skip: 0, limit: 10, sort: { createdAt: -1 } }) {
            const pipeline = [
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                { $match: { 'user.role': 'vendor' } },
                { $match: vendorSearchQuery },
                { $match: vendorFilter },
                { $sort: options.sort },
                { $skip: options.skip },
                { $limit: options.limit },
            ];
            const result = yield vendor_info_model_1.VendorInformationModel.aggregate(pipeline);
            return result;
        });
    }
    getCommissionOverviewByVendors(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const skip = (page - 1) * limit;
            const pipeline = [
                {
                    $match: {
                        isProfileVerified: true,
                    },
                },
                {
                    $lookup: {
                        from: 'bookings',
                        let: { vendorId: '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$vendorId', '$$vendorId'] },
                                    bookingStatus: booking_1.BOOKING_STATUS.COMPLETED,
                                },
                            },
                        ],
                        as: 'completedBookings',
                    },
                },
                {
                    $lookup: {
                        from: 'packages',
                        let: { vendorId: '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$vendorId', '$$vendorId'] },
                                    status: constants_1.PACKAGE_STATUS.PUBLISHED,
                                    isActive: true,
                                },
                            },
                            { $count: 'count' },
                        ],
                        as: 'vendorPackages',
                    },
                },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        let: { vendorId: '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$vendorId', '$$vendorId'] },
                                    status: constants_1.SCHEDULE_STATUS.COMPLETED,
                                },
                            },
                            { $count: 'count' },
                        ],
                        as: 'vendorSchedules',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'vendorDetails',
                    },
                },
                {
                    $unwind: { path: '$vendorDetails', preserveNullAndEmptyArrays: true },
                },
                {
                    $addFields: {
                        vendorName: { $ifNull: ['$vendorDetails.name', 'Unknown Vendor'] },
                        totalBookings: { $size: '$completedBookings' },
                        totalGrossAmount: { $sum: '$completedBookings.finalAmount' },
                        totalPlatformCommission: { $sum: '$completedBookings.platformCommission' },
                        totalVendorEarnings: { $sum: '$completedBookings.vendorEarning' },
                        totalPackages: {
                            $ifNull: [{ $arrayElemAt: ['$vendorPackages.count', 0] }, 0],
                        },
                        totalCompletedSchedules: {
                            $ifNull: [{ $arrayElemAt: ['$vendorSchedules.count', 0] }, 0],
                        },
                    },
                },
            ];
            if (search) {
                pipeline.push({
                    $match: {
                        vendorName: { $regex: search, $options: 'i' },
                    },
                });
            }
            pipeline.push({
                $sort: { totalGrossAmount: -1 },
            });
            pipeline.push({
                $project: {
                    _id: 0,
                    vendorName: 1,
                    totalPackages: 1,
                    totalCompletedSchedules: 1,
                    totalBookings: 1,
                    totalGrossAmount: 1,
                    totalPlatformCommission: 1,
                    totalVendorEarnings: 1,
                },
            });
            pipeline.push({
                $facet: {
                    metadata: [{ $count: 'totalDocs' }],
                    data: [{ $skip: skip }, { $limit: limit }],
                    totals: [
                        {
                            $group: {
                                _id: null,
                                totalBookings: { $sum: '$totalBookings' },
                                totalSchedules: { $sum: '$totalCompletedSchedules' },
                            },
                        },
                    ],
                },
            });
            const [result] = yield this.model.aggregate(pipeline);
            const totalDocs = ((_b = (_a = result === null || result === void 0 ? void 0 : result.metadata) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.totalDocs) || 0;
            const totals = ((_c = result === null || result === void 0 ? void 0 : result.totals) === null || _c === void 0 ? void 0 : _c[0]) || { totalBookings: 0, totalSchedules: 0 };
            return {
                data: (result === null || result === void 0 ? void 0 : result.data) || [],
                page,
                limit,
                totalPages: Math.ceil(totalDocs / limit),
                totalDocs,
                totalBookings: totals.totalBookings || 0,
                totalScedules: totals.totalSchedules || 0,
            };
        });
    }
    findActivevendors() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield this.model.aggregate([
                {
                    $match: { isProfileVerified: true },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $unwind: '$user',
                },
                {
                    $match: { 'user.isBlocked': false },
                },
                {
                    $count: 'activeVendors',
                },
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.activeVendors) || 0;
        });
    }
    findTop5Vendors() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $match: { isProfileVerified: true },
                },
                {
                    $lookup: {
                        from: 'payouts',
                        localField: 'userId',
                        foreignField: 'vendorId',
                        as: 'payouts',
                    },
                },
                {
                    $addFields: {
                        totalRevenue: { $sum: '$payouts.commissionAmount' },
                    },
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 5 },
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
                        vendorId: '$userId',
                        vendorName: { $ifNull: ['$user.name', 'Unknown Vendor'] },
                        totalRevenue: 1,
                    },
                },
            ]);
            return result;
        });
    }
};
exports.VendorInfoRepository = VendorInfoRepository;
exports.VendorInfoRepository = VendorInfoRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], VendorInfoRepository);
