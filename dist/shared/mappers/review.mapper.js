"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewMapper = void 0;
class ReviewMapper {
    static toPublicPackageResponse(reviews) {
        return reviews.map((review) => ({
            id: review._id.toString(),
            userId: review.userId._id.toString(),
            userName: review.userId.name,
            createdAt: review.createdAt,
            rating: review.rating,
            text: review.text,
            images: review.images || [],
        }));
    }
    static toVendorPackageResponse(reviews) {
        return reviews.map((review) => ({
            id: review._id.toString(),
            packageName: review.packageId.title,
            userName: review.userId.name,
            createdAt: review.createdAt,
            rating: review.rating,
            text: review.text,
            images: review.images || [],
        }));
    }
}
exports.ReviewMapper = ReviewMapper;
