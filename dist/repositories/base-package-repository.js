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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePackageRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const package_model_1 = require("../models/package.model");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../shared/constants/constants");
const booking_1 = require("../shared/constants/booking");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
let BasePackageRepository = class BasePackageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(package_model_1.PackageModel);
    }
    buildSortStage(sort) {
        switch (sort) {
            case 'price_low_high':
                return { startingFromPrice: 1 };
            case 'price_high_low':
                return { startingFromPrice: -1 };
            case 'newest':
                return { earliestDate: 1 };
            case 'top_rated':
                return { averageRating: -1, totalReviews: -1 };
            case 'offered':
                return { hasOffer: -1, offerPercentage: -1 };
            default:
                return { createdAt: -1 };
        }
    }
    findPackages(vendorId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const matchStage = {
                vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
            };
            if ((_a = filters.search) === null || _a === void 0 ? void 0 : _a.trim()) {
                const regex = { $regex: filters.search.trim(), $options: 'i' };
                matchStage.$or = [{ location: regex }, { state: regex }];
            }
            if ((_b = filters.selectedFilter) === null || _b === void 0 ? void 0 : _b.trim()) {
                matchStage.status = filters.selectedFilter;
            }
            const skip = (filters.page - 1) * filters.limit;
            const now = new Date();
            const pipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'offers',
                        let: { pkgId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$packageId', '$$pkgId'] },
                                            { $eq: ['$isActive', true] },
                                            { $gt: ['$validUntil', now] },
                                        ],
                                    },
                                },
                            },
                            { $sort: { discountValue: -1 } },
                            { $limit: 1 },
                            { $project: { discountValue: 1 } },
                        ],
                        as: 'activeOffer',
                    },
                },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        let: { pkgId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$packageId', '$$pkgId'] },
                                            { $in: ['$status', [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT]] },
                                        ],
                                    },
                                },
                            },
                            { $count: 'count' },
                        ],
                        as: 'scheduleMeta',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'categoryData',
                        pipeline: [{ $project: { name: 1 } }],
                    },
                },
                {
                    $lookup: {
                        from: 'cancellationpolicies',
                        localField: 'cancellationPolicy',
                        foreignField: '_id',
                        as: 'policyData',
                        pipeline: [{ $project: { label: 1, key: 1 } }],
                    },
                },
                {
                    $addFields: {
                        hasOffer: { $gt: [{ $size: '$activeOffer' }, 0] },
                        offerPercentage: { $ifNull: [{ $arrayElemAt: ['$activeOffer.discountValue', 0] }, 0] },
                        scheduleCount: { $ifNull: [{ $arrayElemAt: ['$scheduleMeta.count', 0] }, 0] },
                        categoryId: { $ifNull: [{ $arrayElemAt: ['$categoryData', 0] }, null] },
                        cancellationPolicy: { $ifNull: [{ $arrayElemAt: ['$policyData', 0] }, null] },
                    },
                },
                {
                    $facet: {
                        metadata: [{ $count: 'total' }],
                        data: [
                            { $sort: { createdAt: 1 } },
                            { $skip: skip },
                            { $limit: filters.limit },
                            {
                                $project: {
                                    title: 1,
                                    location: 1,
                                    basePrice: 1,
                                    state: 1,
                                    status: 1,
                                    days: 1,
                                    nights: 1,
                                    difficultyLevel: 1,
                                    images: 1,
                                    createdAt: 1,
                                    categoryId: 1,
                                    cancellationPolicy: 1,
                                    hasOffer: 1,
                                    offerPercentage: 1,
                                    scheduleCount: 1,
                                },
                            },
                        ],
                    },
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            return {
                requests: (_c = result.data) !== null && _c !== void 0 ? _c : [],
                total: (_e = (_d = result.metadata[0]) === null || _d === void 0 ? void 0 : _d.total) !== null && _e !== void 0 ? _e : 0,
            };
        });
    }
    packageMetaDataByVendorId(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const packages = (yield this.model
                .find({
                vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
                isActive: true,
            }, {
                _id: 1,
                title: 1,
            })
                .lean()
                .exec());
            return packages.map((pkg) => ({
                id: pkg._id.toString(),
                packageTittle: pkg.title,
            }));
        });
    }
    findPublicPackages(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const page = Number(filters.page) || 1;
            const limit = Number(filters.limit) || 12;
            const pipeline = [];
            // ── Stage 1: Base match
            const matchStage = {
                status: constants_1.PACKAGE_STATUS.PUBLISHED,
                isActive: true,
            };
            if (filters.difficulty) {
                matchStage.difficultyLevel = filters.difficulty;
            }
            if ((_a = filters.search) === null || _a === void 0 ? void 0 : _a.trim()) {
                const regex = { $regex: filters.search.trim(), $options: 'i' };
                matchStage.$or = [{ state: regex }, { location: regex }];
            }
            pipeline.push({ $match: matchStage });
            pipeline.push({
                $addFields: {
                    daysNum: { $toInt: '$days' },
                },
            });
            if (filters.minDuration || filters.maxDuration) {
                const durationMatch = {};
                if (filters.minDuration)
                    durationMatch.$gte = Number(filters.minDuration);
                if (filters.maxDuration)
                    durationMatch.$lte = Number(filters.maxDuration);
                pipeline.push({ $match: { daysNum: durationMatch } });
            }
            // ── Stage 2: Category lookup + filter
            pipeline.push({
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryData',
                },
            });
            pipeline.push({
                $addFields: {
                    category: { $arrayElemAt: ['$categoryData', 0] },
                },
            });
            if (filters.category) {
                pipeline.push({
                    $match: {
                        $or: [
                            { 'category.slug': filters.category },
                            ...(mongoose_1.default.Types.ObjectId.isValid(filters.category)
                                ? [{ categoryId: new mongoose_1.default.Types.ObjectId(filters.category) }]
                                : []),
                        ],
                    },
                });
            }
            // ── Stage 3: Join schedules
            pipeline.push({
                $lookup: {
                    from: 'schedulepackages',
                    let: { pkgId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$packageId', '$$pkgId'] },
                                        { $in: ['$status', [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT]] },
                                        { $gt: ['$startDate', new Date()] },
                                        ...(filters.startDate
                                            ? [{ $gte: ['$startDate', new Date(filters.startDate)] }]
                                            : []),
                                        ...(filters.endDate ? [{ $lte: ['$startDate', new Date(filters.endDate)] }] : []),
                                    ],
                                },
                            },
                        },
                        { $sort: { startDate: 1 } },
                        {
                            $project: {
                                pricing: 1,
                                startDate: 1,
                                endDate: 1,
                                status: 1,
                            },
                        },
                    ],
                    as: 'activeSchedules',
                },
            });
            // ── Stage 4: Remove packages with no active schedules
            pipeline.push({
                $match: { 'activeSchedules.0': { $exists: true } },
            });
            // ── Stage 5: Compute derived fields
            pipeline.push({
                $addFields: {
                    startingFromPrice: {
                        $min: {
                            $map: {
                                input: '$activeSchedules',
                                as: 'sc',
                                in: {
                                    $let: {
                                        vars: {
                                            soloTier: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$$sc.pricing',
                                                            as: 'p',
                                                            cond: { $eq: ['$$p.type', 'SOLO'] },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                        in: '$$soloTier.price',
                                    },
                                },
                            },
                        },
                    },
                    earliestDate: { $min: '$activeSchedules.startDate' },
                    earliestEndDate: {
                        $let: {
                            vars: {
                                earliestSchedule: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$activeSchedules',
                                                as: 'sc',
                                                cond: {
                                                    $eq: ['$$sc.startDate', { $min: '$activeSchedules.startDate' }],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                            in: '$$earliestSchedule.endDate',
                        },
                    },
                    earliestScheduleStatus: {
                        $let: {
                            vars: {
                                earliestSchedule: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$activeSchedules',
                                                as: 'sc',
                                                cond: {
                                                    $eq: ['$$sc.startDate', { $min: '$activeSchedules.startDate' }],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                            in: '$$earliestSchedule.status',
                        },
                    },
                    scheduleCount: {
                        $size: {
                            $filter: {
                                input: '$activeSchedules',
                                as: 'sc',
                                cond: {
                                    $in: ['$$sc.status', [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT]],
                                },
                            },
                        },
                    },
                    isSoldOut: {
                        $eq: [
                            {
                                $size: {
                                    $filter: {
                                        input: '$activeSchedules',
                                        as: 'sc',
                                        cond: { $eq: ['$$sc.status', constants_1.SCHEDULE_STATUS.SOLD_OUT] },
                                    },
                                },
                            },
                            { $size: '$activeSchedules' },
                        ],
                    },
                },
            });
            // ── Stage 6: Price range filter
            const minPrice = filters.minPrice !== undefined ? Number(filters.minPrice) : undefined;
            const maxPrice = filters.maxPrice !== undefined ? Number(filters.maxPrice) : undefined;
            const hasMinPrice = minPrice !== undefined && minPrice > 0;
            const hasMaxPrice = maxPrice !== undefined;
            if (hasMinPrice || hasMaxPrice) {
                const priceMatch = {};
                if (hasMinPrice)
                    priceMatch.$gte = minPrice;
                if (hasMaxPrice)
                    priceMatch.$lte = maxPrice;
                pipeline.push({ $match: { startingFromPrice: priceMatch } });
            }
            // ── Stage 7: Rating filter
            if (filters.minRating !== undefined) {
                pipeline.push({
                    $match: { averageRating: { $gte: Number(filters.minRating) } },
                });
            }
            // ── Stage 8: Vendor lookup
            pipeline.push({
                $lookup: {
                    from: 'users',
                    localField: 'vendorId',
                    foreignField: '_id',
                    as: 'vendorData',
                    pipeline: [{ $project: { name: 1 } }],
                },
            });
            pipeline.push({
                $addFields: {
                    vendor: { $arrayElemAt: ['$vendorData', 0] },
                },
            });
            // ── Stage 9: Offer lookup — check if package has an active, non-expired offer
            pipeline.push({
                $lookup: {
                    from: 'offers',
                    let: { pkgId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$packageId', '$$pkgId'] },
                                        { $eq: ['$isActive', true] },
                                        { $gte: ['$validUntil', new Date()] },
                                    ],
                                },
                            },
                        },
                        { $sort: { discountValue: -1 } },
                        { $limit: 1 },
                        { $project: { discountValue: 1 } },
                    ],
                    as: 'activeOffer',
                },
            });
            pipeline.push({
                $addFields: {
                    hasOffer: { $gt: [{ $size: '$activeOffer' }, 0] },
                    offerPercentage: {
                        $ifNull: [{ $arrayElemAt: ['$activeOffer.discountValue', 0] }, 0],
                    },
                },
            });
            // ── Stage 10: Facet — count + sort + paginate + project
            pipeline.push({
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: this.buildSortStage(filters.sort) },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                title: 1,
                                description: 1,
                                location: 1,
                                state: 1,
                                difficultyLevel: 1,
                                days: 1,
                                nights: 1,
                                usp: 1,
                                images: { $slice: ['$images', 1] },
                                category: { _id: 1, name: 1, slug: 1, icon: 1 },
                                vendor: { _id: 1, name: 1 },
                                startingFromPrice: 1,
                                earliestDate: 1,
                                earliestEndDate: 1,
                                earliestScheduleStatus: 1,
                                scheduleCount: 1,
                                isSoldOut: 1,
                                hasOffer: 1,
                                offerPercentage: 1,
                                averageRating: 1,
                                totalReviews: 1,
                            },
                        },
                    ],
                },
            });
            const [result] = yield this.model.aggregate(pipeline);
            const total = (_c = (_b = result.metadata[0]) === null || _b === void 0 ? void 0 : _b.total) !== null && _c !== void 0 ? _c : 0;
            const packages = (_d = result.data) !== null && _d !== void 0 ? _d : [];
            return { packages, total };
        });
    }
    findVendorPublicPackages(vendorId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const vendorObjectId = new mongoose_1.default.Types.ObjectId(vendorId);
            const pipeline = [
                {
                    $match: {
                        vendorId: vendorObjectId,
                        status: constants_1.PACKAGE_STATUS.PUBLISHED,
                        isActive: true,
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'categoryData',
                    },
                },
                {
                    $addFields: {
                        category: { $arrayElemAt: ['$categoryData', 0] },
                    },
                },
                //  Join active schedules
                {
                    $lookup: {
                        from: 'schedulepackages',
                        let: { pkgId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$packageId', '$$pkgId'] },
                                            { $in: ['$status', [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT]] },
                                        ],
                                    },
                                },
                            },
                            { $sort: { startDate: 1 } },
                            { $project: { pricing: 1, startDate: 1, endDate: 1, status: 1 } },
                        ],
                        as: 'activeSchedules',
                    },
                },
                //  Drop packages with no active schedules
                { $match: { 'activeSchedules.0': { $exists: true } } },
                {
                    $addFields: {
                        startingFromPrice: {
                            $min: {
                                $map: {
                                    input: '$activeSchedules',
                                    as: 'sc',
                                    in: {
                                        $let: {
                                            vars: {
                                                soloTier: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$$sc.pricing',
                                                                as: 'p',
                                                                cond: { $eq: ['$$p.type', 'SOLO'] },
                                                            },
                                                        },
                                                        0,
                                                    ],
                                                },
                                            },
                                            in: '$$soloTier.price',
                                        },
                                    },
                                },
                            },
                        },
                        earliestDate: { $min: '$activeSchedules.startDate' },
                        earliestEndDate: {
                            $let: {
                                vars: {
                                    earliestSchedule: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$activeSchedules',
                                                    as: 'sc',
                                                    cond: {
                                                        $eq: ['$$sc.startDate', { $min: '$activeSchedules.startDate' }],
                                                    },
                                                },
                                            },
                                            0,
                                        ],
                                    },
                                },
                                in: '$$earliestSchedule.endDate',
                            },
                        },
                        earliestScheduleStatus: {
                            $let: {
                                vars: {
                                    earliestSchedule: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$activeSchedules',
                                                    as: 'sc',
                                                    cond: {
                                                        $eq: ['$$sc.startDate', { $min: '$activeSchedules.startDate' }],
                                                    },
                                                },
                                            },
                                            0,
                                        ],
                                    },
                                },
                                in: '$$earliestSchedule.status',
                            },
                        },
                        scheduleCount: { $size: '$activeSchedules' },
                        isSoldOut: {
                            $eq: [
                                {
                                    $size: {
                                        $filter: {
                                            input: '$activeSchedules',
                                            as: 'sc',
                                            cond: { $eq: ['$$sc.status', constants_1.SCHEDULE_STATUS.SOLD_OUT] },
                                        },
                                    },
                                },
                                { $size: '$activeSchedules' },
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'vendorId',
                        foreignField: '_id',
                        as: 'vendorData',
                        pipeline: [{ $project: { name: 1 } }],
                    },
                },
                {
                    $addFields: {
                        vendor: { $arrayElemAt: ['$vendorData', 0] },
                    },
                },
                {
                    $facet: {
                        metadata: [{ $count: 'total' }],
                        data: [
                            { $sort: { createdAt: -1 } },
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $project: {
                                    title: 1,
                                    description: 1,
                                    location: 1,
                                    state: 1,
                                    difficultyLevel: 1,
                                    days: 1,
                                    nights: 1,
                                    usp: 1,
                                    images: { $slice: ['$images', 1] },
                                    category: { _id: 1, name: 1, slug: 1, icon: 1 },
                                    vendor: { _id: 1, name: 1 },
                                    startingFromPrice: 1,
                                    earliestDate: 1,
                                    earliestEndDate: 1,
                                    earliestScheduleStatus: 1,
                                    scheduleCount: 1,
                                    isSoldOut: 1,
                                    averageRating: 1,
                                    totalReviews: 1,
                                },
                            },
                        ],
                    },
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            const total = (_b = (_a = result.metadata[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0;
            const packages = (_c = result.data) !== null && _c !== void 0 ? _c : [];
            return { packages, total };
        });
    }
    softDelete(id, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findOneAndUpdate({
                _id: id,
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
            }, { isDeleted: true, status: constants_1.PACKAGE_STATUS.DELETED }, { new: true })
                .exec();
        });
    }
    restore(id, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(id), vendorId: (0, objectId_helper_1.toObjectId)(vendorId), isDeleted: true }, { isDeleted: false, deletedAt: null }, { new: true })
                .exec();
        });
    }
    getPackagesOversight(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const matchStage = {
                status: constants_1.PACKAGE_STATUS.PUBLISHED,
                isDeleted: false,
            };
            const searchMatchStage = (search === null || search === void 0 ? void 0 : search.trim())
                ? [
                    {
                        $match: {
                            $or: [
                                { title: { $regex: search.trim(), $options: 'i' } },
                                { location: { $regex: search.trim(), $options: 'i' } },
                                { state: { $regex: search.trim(), $options: 'i' } },
                                { 'vendor.name': { $regex: search.trim(), $options: 'i' } },
                            ],
                        },
                    },
                ]
                : [];
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
                ...searchMatchStage,
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'categoryData',
                        pipeline: [{ $project: { name: 1 } }],
                    },
                },
                { $addFields: { category: { $arrayElemAt: ['$categoryData', 0] } } },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: '_id',
                        foreignField: 'packageId',
                        as: 'schedules',
                        pipeline: [{ $project: { _id: 1 } }],
                    },
                },
                {
                    $facet: {
                        metadata: [{ $count: 'total' }],
                        data: [
                            { $sort: { createdAt: -1 } },
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 1,
                                    packageName: '$title',
                                    location: 1,
                                    state: 1,
                                    status: 1,
                                    totalDays: { $toInt: '$days' },
                                    difficultylevel: '$difficultyLevel',
                                    vendorName: '$vendor.name',
                                    categoryName: '$category.name',
                                    scheduleCount: { $size: '$schedules' },
                                },
                            },
                        ],
                    },
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            const total = (_b = (_a = result.metadata[0]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0;
            const packages = (_c = result.data) !== null && _c !== void 0 ? _c : [];
            return { packages, total };
        });
    }
    getPackageDetails(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                { $match: { _id: (0, objectId_helper_1.toObjectId)(packageId) } },
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
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'categoryData',
                        pipeline: [{ $project: { name: 1, isActive: 1 } }],
                    },
                },
                { $addFields: { category: { $arrayElemAt: ['$categoryData', 0] } } },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: '_id',
                        foreignField: 'packageId',
                        as: 'schedules',
                        pipeline: [
                            { $match: { status: { $in: [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT] } } },
                            { $project: { pricing: 1 } },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'cancellationpolicies',
                        localField: 'cancellationPolicy',
                        foreignField: '_id',
                        as: 'policyData',
                        pipeline: [{ $project: { label: 1 } }],
                    },
                },
                { $addFields: { policy: { $arrayElemAt: ['$policyData', 0] } } },
                {
                    $project: {
                        _id: 1,
                        packageName: '$title',
                        location: 1,
                        state: 1,
                        days: { $toInt: '$days' },
                        nights: { $toInt: '$nights' },
                        difficultylevel: '$difficultyLevel',
                        vendorName: '$vendor.name',
                        categoryName: '$category.name',
                        categoryIsActive: { $eq: ['$category.isActive', true] },
                        totalScedule: { $size: '$schedules' },
                        cancellationPolicyLabel: '$policy.label',
                        status: 1,
                        pricing: {
                            $map: {
                                input: { $ifNull: [{ $arrayElemAt: ['$schedules.pricing', 0] }, []] },
                                as: 'p',
                                in: {
                                    priceTier: '$$p.type',
                                    peopleCount: '$$p.peopleCount',
                                    price: '$$p.price',
                                },
                            },
                        },
                    },
                },
            ];
            const [result] = yield this.model.aggregate(pipeline);
            return result || null;
        });
    }
    findPackagesByVendorIdForOffer(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentDate = new Date();
            const pipeline = [
                {
                    $match: {
                        vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                        status: constants_1.PACKAGE_STATUS.PUBLISHED,
                        isActive: true,
                        isDeleted: false,
                    },
                },
                {
                    $lookup: {
                        from: 'offers',
                        localField: '_id',
                        foreignField: 'packageId',
                        pipeline: [
                            {
                                $match: {
                                    isActive: true,
                                    validUntil: { $gte: currentDate },
                                },
                            },
                        ],
                        as: 'activeOffers',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        hasOffer: { $gt: [{ $size: '$activeOffers' }, 0] },
                        offerValue: {
                            $cond: {
                                if: { $gt: [{ $size: '$activeOffers' }, 0] },
                                then: { $arrayElemAt: ['$activeOffers.discountValue', 0] },
                                else: 0,
                            },
                        },
                    },
                },
            ];
            return this.model.aggregate(pipeline);
        });
    }
    getCommissionOverviewByPackages(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchStage = {
                status: constants_1.PACKAGE_STATUS.PUBLISHED,
                isActive: true,
            };
            const pipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'vendorId',
                        foreignField: '_id',
                        as: 'vendor',
                    },
                },
                { $unwind: '$vendor' },
            ];
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                const regex = { $regex: search.trim(), $options: 'i' };
                pipeline.push({
                    $match: {
                        $or: [{ title: regex }, { 'vendor.name': regex }],
                    },
                });
            }
            pipeline.push({
                $lookup: {
                    from: 'schedulepackages',
                    let: { pkgId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$packageId', '$$pkgId'] },
                                status: constants_1.SCHEDULE_STATUS.COMPLETED,
                            },
                        },
                    ],
                    as: 'completedSchedules',
                },
            }, {
                $lookup: {
                    from: 'bookings',
                    let: { pkgId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$packageId', '$$pkgId'] },
                                bookingStatus: booking_1.BOOKING_STATUS.COMPLETED,
                            },
                        },
                    ],
                    as: 'completedBookings',
                },
            }, {
                $project: {
                    vendorName: '$vendor.name',
                    packageName: '$title',
                    totalScedule: { $size: '$completedSchedules' },
                    totalBookings: { $size: '$completedBookings' },
                    totalGrossAmount: { $sum: '$completedBookings.finalAmount' },
                    totalPlatformCommission: { $sum: '$completedBookings.platformCommission' },
                    totalVendorEarnings: { $sum: '$completedBookings.vendorEarning' },
                },
            });
            pipeline.push({
                $facet: {
                    metadata: [
                        {
                            $group: {
                                _id: null,
                                totalPackages: { $sum: 1 },
                                totalScedules: { $sum: '$totalScedule' },
                                totalBookings: { $sum: '$totalBookings' },
                                totalGrossAmount: { $sum: '$totalGrossAmount' },
                                totalPlatformCommission: { $sum: '$totalPlatformCommission' },
                                totalVendorEarnings: { $sum: '$totalVendorEarnings' },
                            },
                        },
                    ],
                    data: [
                        { $sort: { totalVendorEarnings: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                    ],
                },
            });
            const [result] = yield this.model.aggregate(pipeline);
            const metadata = result.metadata[0] || {
                totalPackages: 0,
                totalScedules: 0,
                totalBookings: 0,
                totalGrossAmount: 0,
                totalPlatformCommission: 0,
                totalVendorEarnings: 0,
            };
            return {
                data: result.data || [],
                page,
                limit,
                totalPages: Math.ceil(metadata.totalPackages / limit),
                totalDocs: metadata.totalPackages,
                totalBookings: metadata.totalBookings,
                totalScedules: metadata.totalScedules,
                totalPackages: metadata.totalPackages,
                totalVendorEarnings: metadata.totalVendorEarnings,
                totalPlatformCommission: metadata.totalPlatformCommission,
                totalGrossAmount: metadata.totalGrossAmount,
            };
        });
    }
    getPackagesEarningOverviewByVendor(vendorId, page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const pipeline = [
                {
                    $match: {
                        vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                        status: constants_1.PACKAGE_STATUS.PUBLISHED,
                    },
                },
            ];
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                pipeline.push({
                    $match: { title: { $regex: search.trim(), $options: 'i' } },
                });
            }
            pipeline.push({
                $lookup: {
                    from: 'schedulepackages',
                    let: { pkgId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$packageId', '$$pkgId'] },
                                status: constants_1.SCHEDULE_STATUS.COMPLETED,
                            },
                        },
                    ],
                    as: 'completedSchedules',
                },
            }, {
                $lookup: {
                    from: 'bookings',
                    let: { pkgId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$packageId', '$$pkgId'] },
                                bookingStatus: booking_1.BOOKING_STATUS.COMPLETED,
                            },
                        },
                    ],
                    as: 'completedBookings',
                },
            }, {
                $project: {
                    title: 1,
                    status: 1,
                    location: 1,
                    totalScheduled: { $size: '$completedSchedules' },
                    totalBookings: { $size: '$completedBookings' },
                    totalRevenue: { $sum: '$completedBookings.finalAmount' },
                    totalCommission: { $sum: '$completedBookings.platformCommission' },
                    netEarnings: { $sum: '$completedBookings.vendorEarning' },
                },
            }, {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $sort: { totalRevenue: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }],
                },
            });
            const [result] = yield this.model.aggregate(pipeline);
            return {
                data: (_a = result.data) !== null && _a !== void 0 ? _a : [],
                currentPage: page,
                totalPages: Math.ceil(((_c = (_b = result.metadata[0]) === null || _b === void 0 ? void 0 : _b.total) !== null && _c !== void 0 ? _c : 0) / limit),
                totalDocs: (_e = (_d = result.metadata[0]) === null || _d === void 0 ? void 0 : _d.total) !== null && _e !== void 0 ? _e : 0,
            };
        });
    }
    findPopularPackages() {
        return __awaiter(this, void 0, void 0, function* () {
            const packages = yield this.model.aggregate([
                {
                    $match: {
                        status: constants_1.PACKAGE_STATUS.PUBLISHED,
                        isActive: true,
                    },
                },
                // Step 1: Lookup active (upcoming / sold-out) schedules
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: '_id',
                        foreignField: 'packageId',
                        as: 'activeSchedules',
                        pipeline: [
                            {
                                $match: {
                                    status: { $in: [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT] },
                                },
                            },
                        ],
                    },
                },
                // Step 2: Only keep packages that have at least one active schedule
                {
                    $match: {
                        'activeSchedules.0': { $exists: true },
                    },
                },
                // Step 3: Extract soloPrice from active schedules & first image
                {
                    $addFields: {
                        soloPrice: {
                            $min: {
                                $map: {
                                    input: '$activeSchedules',
                                    as: 'sc',
                                    in: {
                                        $let: {
                                            vars: {
                                                soloTier: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$$sc.pricing',
                                                                as: 'p',
                                                                cond: { $eq: ['$$p.type', 'SOLO'] },
                                                            },
                                                        },
                                                        0,
                                                    ],
                                                },
                                            },
                                            in: '$$soloTier.price',
                                        },
                                    },
                                },
                            },
                        },
                        image: {
                            $let: {
                                vars: { firstImage: { $arrayElemAt: ['$images', 0] } },
                                in: { key: '$$firstImage.key', url: '$$firstImage.url' },
                            },
                        },
                    },
                },
                // Step 4: Count completed bookings to rank by popularity
                {
                    $lookup: {
                        from: 'bookings',
                        localField: '_id',
                        foreignField: 'packageId',
                        as: 'bookings',
                        pipeline: [
                            {
                                $match: {
                                    bookingStatus: booking_1.BOOKING_STATUS.COMPLETED,
                                },
                            },
                        ],
                    },
                },
                {
                    $unwind: '$bookings',
                },
                {
                    $group: {
                        _id: '$_id',
                        title: { $first: '$title' },
                        location: { $first: '$location' },
                        state: { $first: '$state' },
                        rating: { $first: { $ifNull: ['$averageRating', 0] } },
                        image: { $first: '$image' },
                        soloPrice: { $first: '$soloPrice' },
                        totalBookings: { $sum: 1 },
                    },
                },
                {
                    $sort: { totalBookings: -1 },
                },
                {
                    $limit: 4,
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        location: 1,
                        state: 1,
                        rating: 1,
                        image: 1,
                        soloPrice: { $ifNull: ['$soloPrice', 0] },
                        totalBookings: 1,
                    },
                },
            ]);
            return packages;
        });
    }
    topRatedPackages() {
        return __awaiter(this, void 0, void 0, function* () {
            const packages = yield this.model.aggregate([
                {
                    $match: {
                        status: constants_1.PACKAGE_STATUS.PUBLISHED,
                        isActive: true,
                        isDeleted: false,
                    },
                },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: '_id',
                        foreignField: 'packageId',
                        as: 'activeSchedules',
                        pipeline: [
                            {
                                $match: {
                                    status: { $in: [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT] },
                                },
                            },
                        ],
                    },
                },
                {
                    $match: {
                        'activeSchedules.0': { $exists: true },
                    },
                },
                {
                    $addFields: {
                        soloPrice: {
                            $min: {
                                $map: {
                                    input: '$activeSchedules',
                                    as: 'sc',
                                    in: {
                                        $let: {
                                            vars: {
                                                soloTier: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$$sc.pricing',
                                                                as: 'p',
                                                                cond: { $eq: ['$$p.type', 'SOLO'] },
                                                            },
                                                        },
                                                        0,
                                                    ],
                                                },
                                            },
                                            in: '$$soloTier.price',
                                        },
                                    },
                                },
                            },
                        },
                        image: {
                            $let: {
                                vars: { firstImage: { $arrayElemAt: ['$images', 0] } },
                                in: { key: '$$firstImage.key', url: '$$firstImage.url' },
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'categoryId',
                        pipeline: [{ $project: { name: 1 } }],
                    },
                },
                {
                    $unwind: {
                        path: '$categoryId',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: { averageRating: -1, totalReviews: -1 },
                },
                {
                    $limit: 4,
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        location: 1,
                        state: 1,
                        rating: { $ifNull: ['$averageRating', 0] },
                        image: 1,
                        soloPrice: { $ifNull: ['$soloPrice', 0] },
                        totalReviews: { $ifNull: ['$totalReviews', 0] },
                        category: { $ifNull: ['$categoryId.name', ''] },
                    },
                },
            ]);
            return packages;
        });
    }
    getPersonalizedPackagesByUserId(meta) {
        return __awaiter(this, void 0, void 0, function* () {
            const { states, locations, categoryIds, bookedPackageIds } = meta;
            const orConditions = [];
            if (states.length)
                orConditions.push({ state: { $in: states } });
            if (locations.length)
                orConditions.push({ location: { $in: locations } });
            if (categoryIds.length)
                orConditions.push({ categoryId: { $in: categoryIds } });
            const recommended = yield this.model.aggregate([
                {
                    $match: Object.assign({ _id: { $nin: bookedPackageIds }, isActive: true, isDeleted: false, status: constants_1.PACKAGE_STATUS.PUBLISHED }, (orConditions.length ? { $or: orConditions } : {})),
                },
                {
                    $lookup: {
                        from: 'schedulepackages',
                        localField: '_id',
                        foreignField: 'packageId',
                        as: 'activeSchedules',
                        pipeline: [
                            {
                                $match: {
                                    status: { $in: [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT] },
                                },
                            },
                        ],
                    },
                },
                {
                    $match: {
                        'activeSchedules.0': { $exists: true },
                    },
                },
                {
                    $addFields: {
                        soloPrice: {
                            $min: {
                                $map: {
                                    input: '$activeSchedules',
                                    as: 'sc',
                                    in: {
                                        $let: {
                                            vars: {
                                                soloTier: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$$sc.pricing',
                                                                as: 'p',
                                                                cond: { $eq: ['$$p.type', 'SOLO'] },
                                                            },
                                                        },
                                                        0,
                                                    ],
                                                },
                                            },
                                            in: '$$soloTier.price',
                                        },
                                    },
                                },
                            },
                        },
                        image: {
                            $let: {
                                vars: { firstImage: { $arrayElemAt: ['$images', 0] } },
                                in: { key: '$$firstImage.key', url: '$$firstImage.url' },
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'categoryId',
                        pipeline: [{ $project: { name: 1 } }],
                    },
                },
                {
                    $unwind: {
                        path: '$categoryId',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $sort: { averageRating: -1, totalReviews: -1 } },
                { $limit: 4 },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        location: 1,
                        state: 1,
                        rating: { $ifNull: ['$averageRating', 0] },
                        image: 1,
                        soloPrice: { $ifNull: ['$soloPrice', 0] },
                        totalReviews: { $ifNull: ['$totalReviews', 0] },
                        category: { $ifNull: ['$categoryId.name', ''] },
                    },
                },
            ]);
            return recommended;
        });
    }
};
exports.BasePackageRepository = BasePackageRepository;
exports.BasePackageRepository = BasePackageRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], BasePackageRepository);
