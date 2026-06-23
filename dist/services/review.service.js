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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.ReviewService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../errors/AppError");
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const booking_1 = require("../shared/constants/booking");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const review_mapper_1 = require("../shared/mappers/review.mapper");
let ReviewService = class ReviewService {
    constructor(_reviewRepository, _bookingRepository, _packageRepository, _vendorRepository) {
        this._reviewRepository = _reviewRepository;
        this._bookingRepository = _bookingRepository;
        this._packageRepository = _packageRepository;
        this._vendorRepository = _vendorRepository;
    }
    addReview(userId, reviewDto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const booking = yield this._bookingRepository.findOne({
                _id: (0, objectId_helper_1.toObjectId)(reviewDto.bookingId),
                userId: (0, objectId_helper_1.toObjectId)(userId),
            });
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (booking.bookingStatus !== booking_1.BOOKING_STATUS.COMPLETED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_MUST_BE_COMPLETED_TO_REVIEW, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (booking.hasReviewed) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.REVIEW_ALREADY_EXIST, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const hasReview = yield this._reviewRepository.findByPackageId(booking.packageId.toString(), userId);
            if (hasReview && !hasReview.isDeleted) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.REVIEW_ALREADY_EXISTS_THIS_PACKAGE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const packageId = (_c = (_b = (_a = booking.packageId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : booking.packageId.toString();
            const vendorId = (_f = (_e = (_d = booking.vendorId) === null || _d === void 0 ? void 0 : _d._id) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : booking.vendorId.toString();
            const reviewData = {
                bookingId: (0, objectId_helper_1.toObjectId)(reviewDto.bookingId),
                packageId: (0, objectId_helper_1.toObjectId)(packageId),
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                rating: reviewDto.rating,
                text: reviewDto.text,
                images: reviewDto.images,
                userId: (0, objectId_helper_1.toObjectId)(userId),
            };
            yield this._reviewRepository.create(reviewData);
            yield this._bookingRepository.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(reviewDto.bookingId) }, { hasReviewed: true });
            const stats = yield this._reviewRepository.getAverageRating(packageId);
            if (stats) {
                yield this._packageRepository.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(packageId) }, { averageRating: stats.average, totalReviews: stats.total });
            }
        });
    }
    deleteReview(reviewId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = yield this._reviewRepository.findOne({
                _id: (0, objectId_helper_1.toObjectId)(reviewId),
                userId: (0, objectId_helper_1.toObjectId)(userId),
            });
            if (!review) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.REVIEW_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (review.userId.toString() !== userId) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNAUTHORIZED_TO_DELETE_REVIEW, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
            if (review.isDeleted) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.REVIEW_ALREADY_DELETED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            yield this._reviewRepository.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(reviewId) }, { isDeleted: true });
            yield this._bookingRepository.findOneAndUpdate({ _id: review.bookingId }, { hasReviewed: false });
            const packageId = review.packageId.toString();
            const stats = yield this._reviewRepository.getAverageRating(packageId);
            if (stats) {
                yield this._packageRepository.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(packageId) }, { averageRating: stats.average, totalReviews: stats.total });
            }
        });
    }
    getPackagePublicReviews(packageId, page, limit, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageExists = yield this._packageRepository.findOne({ _id: (0, objectId_helper_1.toObjectId)(packageId) });
            if (!packageExists) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            let userReview = null;
            if (userId) {
                const userReviewed = yield this._reviewRepository.findOnePopulated({ packageId: (0, objectId_helper_1.toObjectId)(packageId), userId: (0, objectId_helper_1.toObjectId)(userId) }, { path: 'userId', select: 'name' });
                if (userReviewed && !userReviewed.isDeleted) {
                    userReview = userReviewed;
                }
            }
            const { reviews, total } = yield this._reviewRepository.findAllByPackageId({
                packageId,
                page,
                limit,
                userId,
            });
            return {
                data: review_mapper_1.ReviewMapper.toPublicPackageResponse(userReview ? [userReview, ...reviews] : reviews),
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalDocs: total,
            };
        });
    }
    getPackageReviewsStats(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageExists = yield this._packageRepository.findOne({ _id: (0, objectId_helper_1.toObjectId)(packageId) });
            if (!packageExists) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const statsData = yield this._reviewRepository.getRatingStats(packageId);
            return statsData;
        });
    }
    getVendorPackagesReviwes(vendorId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorExists = yield this._vendorRepository.findOne({ userId: (0, objectId_helper_1.toObjectId)(vendorId) });
            if (!vendorExists) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const { reviews, total } = yield this._reviewRepository.findAllByVendorId(vendorId, filters);
            return {
                data: review_mapper_1.ReviewMapper.toVendorPackageResponse(reviews),
                currentPage: filters.page,
                totalPages: Math.ceil(total / filters.limit),
                totalDocs: total,
                hasNextPage: filters.page * filters.limit < total,
            };
        });
    }
    getVendorPackagesReviwesStats(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorExists = yield this._vendorRepository.findOne({ userId: (0, objectId_helper_1.toObjectId)(vendorId) });
            if (!vendorExists) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const statsData = yield this._reviewRepository.getRatingStatsByVendorId(vendorId);
            return statsData;
        });
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IReviewRepository')),
    __param(1, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(2, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(3, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ReviewService);
