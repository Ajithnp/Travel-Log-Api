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
exports.WishlistRepository = void 0;
const wishlist_model_1 = require("../models/wishlist.model");
const base_repository_1 = require("./base.repository");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const mongoose_1 = require("mongoose");
const constants_1 = require("../shared/constants/constants");
const schedule_model_1 = __importDefault(require("../models/schedule.model"));
class WishlistRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(wishlist_model_1.WishlistModel);
    }
    addPackage(userId, packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield wishlist_model_1.WishlistModel.findOneAndUpdate({ userId: (0, objectId_helper_1.toObjectId)(userId) }, { $addToSet: { packages: (0, objectId_helper_1.toObjectId)(packageId) } }, {
                new: true,
                upsert: true,
            }).lean();
            return updated;
        });
    }
    isPackageWishlisted(userId, packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.exists({
                userId: new mongoose_1.Types.ObjectId(userId),
                packages: new mongoose_1.Types.ObjectId(packageId),
            });
            return doc !== null;
        });
    }
    removePackage(userId, packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, { $pull: { packages: new mongoose_1.Types.ObjectId(packageId) } }, { new: true })
                .lean();
        });
    }
    findWishlistedIds(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model
                .findOne({ userId: new mongoose_1.Types.ObjectId(userId) }, { packages: 1, _id: 0 })
                .lean();
            return doc;
        });
    }
    findWithPopulatedPackages(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const wishlistDoc = yield this.model
                .findOne({ userId: new mongoose_1.Types.ObjectId(userId) }, { packages: 1 })
                .lean();
            if (!wishlistDoc)
                return null;
            const allPackageIds = wishlistDoc.packages;
            const totalCount = allPackageIds.length;
            if (totalCount === 0) {
                return {
                    _id: wishlistDoc._id,
                    userId: wishlistDoc.userId,
                    packages: [],
                    totalCount: 0,
                    hasNextPage: false,
                };
            }
            const skip = (page - 1) * limit;
            const pageIds = allPackageIds.slice(skip, skip + limit);
            if (pageIds.length === 0) {
                return {
                    _id: wishlistDoc._id,
                    userId: wishlistDoc.userId,
                    packages: [],
                    totalCount,
                    hasNextPage: false,
                };
            }
            const doc = yield this.model
                .findOne({ userId: new mongoose_1.Types.ObjectId(userId) })
                .populate({
                path: 'packages',
                match: {
                    isActive: true,
                    status: constants_1.PACKAGE_STATUS.PUBLISHED,
                },
                select: 'title location state categoryId difficultyLevel days nights basePrice images isActive status averageRating totalReviews',
                populate: {
                    path: 'categoryId',
                    select: 'name',
                },
            })
                .lean();
            if (!doc)
                return null;
            const validPackages = doc.packages.filter((pkg) => pkg !== null);
            if (validPackages.length === 0) {
                return Object.assign(Object.assign({}, doc), { packages: [] });
            }
            const packageIds = validPackages.map((pkg) => pkg._id);
            const upcomingSchedules = yield schedule_model_1.default.find({
                packageId: { $in: packageIds },
                status: constants_1.SCHEDULE_STATUS.UPCOMING,
            }, { packageId: 1, _id: 0 }).lean();
            const packageIdsWithSchedules = new Set(upcomingSchedules.map((s) => s.packageId.toString()));
            const packages = validPackages.map((pkg) => (Object.assign(Object.assign({}, pkg), { hasUpcomingSchedule: packageIdsWithSchedules.has(pkg._id.toString()) })));
            return {
                _id: doc._id,
                userId: doc.userId,
                packages,
                totalCount,
                hasNextPage: skip + limit < totalCount,
            };
        });
    }
    countPackages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const doc = yield this.model
                .findOne({ userId: new mongoose_1.Types.ObjectId(userId) }, { packages: 1, _id: 0 })
                .lean();
            if (!doc)
                return 0;
            return ((_a = doc.packages) !== null && _a !== void 0 ? _a : []).length;
        });
    }
}
exports.WishlistRepository = WishlistRepository;
