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
exports.OfferRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const offer_model_1 = require("../models/offer.model");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
let OfferRepository = class OfferRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(offer_model_1.OfferModel);
    }
    findVendorOffers(vendorId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const skip = (query.page - 1) * query.limit;
            const limit = query.limit;
            const pipeline = [
                {
                    $match: {
                        vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                    },
                },
            ];
            if (query.isActive !== undefined) {
                pipeline.push({
                    $match: {
                        isActive: query.isActive,
                    },
                });
            }
            pipeline.push({
                $lookup: {
                    from: 'packages',
                    localField: 'packageId',
                    foreignField: '_id',
                    as: 'package',
                },
            });
            pipeline.push({
                $unwind: {
                    path: '$package',
                    preserveNullAndEmptyArrays: true,
                },
            });
            if (query.search) {
                const searchRegex = new RegExp(query.search, 'i');
                pipeline.push({
                    $match: {
                        $or: [{ name: { $regex: searchRegex } }, { 'package.title': { $regex: searchRegex } }],
                    },
                });
            }
            pipeline.push({
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    vendorId: { $toString: '$vendorId' },
                    packageId: { $toString: '$packageId' },
                    packageTittle: { $ifNull: ['$package.title', ''] },
                    scheduleId: { $ifNull: [{ $toString: '$scheduleId' }, null] },
                    name: 1,
                    discountType: 1,
                    discountValue: 1,
                    maxDiscountCap: { $ifNull: ['$maxDiscountCap', null] },
                    minBookingAmount: { $ifNull: ['$minBookingAmount', null] },
                    usageLimit: { $ifNull: ['$usageLimit', null] },
                    usedCount: 1,
                    validFrom: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$validFrom' } },
                    validUntil: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$validUntil' } },
                    isActive: 1,
                    createdAt: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$createdAt' } },
                },
            });
            pipeline.push({
                $sort: { createdAt: -1 },
            });
            pipeline.push({
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $skip: skip }, { $limit: limit }],
                },
            });
            const result = yield this.model.aggregate(pipeline);
            const totalDocs = ((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.metadata[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
            const data = ((_c = result[0]) === null || _c === void 0 ? void 0 : _c.data) || [];
            return {
                data,
                totalDocs,
            };
        });
    }
    hasActiveOfferByPackage(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const offer = yield this.findOne({
                packageId: (0, objectId_helper_1.toObjectId)(packageId),
                isActive: true,
                validUntil: { $gte: new Date() },
            });
            return {
                hasOffer: !!offer,
                offerPercentage: (offer === null || offer === void 0 ? void 0 : offer.discountType) === 'percentage' ? offer === null || offer === void 0 ? void 0 : offer.discountValue : 0,
                offerId: ((_a = offer === null || offer === void 0 ? void 0 : offer._id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
            };
        });
    }
    updateUsageCount(offerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.updateOne({ _id: (0, objectId_helper_1.toObjectId)(offerId) }, { $inc: { usedCount: 1 } });
        });
    }
};
exports.OfferRepository = OfferRepository;
exports.OfferRepository = OfferRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], OfferRepository);
