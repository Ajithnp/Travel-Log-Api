"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistMapper = void 0;
const constants_1 = require("../../shared/constants/constants");
class WishlistMapper {
    static toWishlistItem(pkg) {
        var _a, _b, _c, _d;
        return {
            packageId: pkg._id.toString(),
            title: pkg.title,
            location: pkg.location,
            state: pkg.state,
            category: (_b = (_a = pkg.categoryId) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Uncategorized',
            difficultyLevel: pkg.difficultyLevel,
            hasUpcomingSchedule: pkg.hasUpcomingSchedule,
            days: pkg.days,
            nights: pkg.nights,
            basePrice: pkg.basePrice,
            averageRating: (_c = pkg.averageRating) !== null && _c !== void 0 ? _c : 0,
            totalReviews: (_d = pkg.totalReviews) !== null && _d !== void 0 ? _d : 0,
            images: pkg.images.length > 0 ? [{ key: pkg.images[0].key }] : [],
        };
    }
    static toWishlistResponse(packages, page, totalPages, totalCount, hasNextPage) {
        const data = packages
            .filter((pkg) => pkg !== null && pkg.isActive && pkg.status === constants_1.PACKAGE_STATUS.PUBLISHED)
            .map(WishlistMapper.toWishlistItem);
        return { data, page, totalPages, totalCount, hasNextPage, hasPreviousPage: page > 1 };
    }
}
exports.WishlistMapper = WishlistMapper;
