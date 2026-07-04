"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPreferenceProfile = buildPreferenceProfile;
function buildPreferenceProfile(bookings, wishlist) {
    const bookedPackageIds = bookings
        .map((b) => { var _a, _b; return (_b = (_a = b.packageId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(); })
        .filter(Boolean);
    const amounts = bookings.map((b) => b.finalAmount).filter(Boolean);
    const avgBudget = amounts.length
        ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length)
        : null;
    const groupTypes = bookings.map((b) => b.groupType).filter(Boolean);
    const travelStyle = groupTypes.length
        ? groupTypes
            .sort((a, b) => groupTypes.filter((v) => v === b).length - groupTypes.filter((v) => v === a).length)
            .at(0) || null
        : null;
    const bookedLocations = bookings.map((b) => { var _a; return (_a = b.packageId) === null || _a === void 0 ? void 0 : _a.location; }).filter(Boolean);
    const bookedStates = bookings.map((b) => { var _a; return (_a = b.packageId) === null || _a === void 0 ? void 0 : _a.state; }).filter(Boolean);
    const difficulties = bookings
        .map((b) => { var _a; return (_a = b.packageId) === null || _a === void 0 ? void 0 : _a.difficultyLevel; })
        .filter(Boolean);
    const wishlistPackages = wishlist || [];
    const wishlistLocations = wishlistPackages.map((p) => p.location).filter(Boolean);
    const wishlistStates = wishlistPackages.map((p) => p.state).filter(Boolean);
    return {
        bookedPackageIds,
        bookedLocations: [...new Set(bookedLocations)],
        bookedStates: [...new Set(bookedStates)],
        wishlistLocations: [...new Set(wishlistLocations)],
        wishlistStates: [...new Set(wishlistStates)],
        difficulties: [...new Set(difficulties)],
        travelStyle,
        avgBudget,
        hasHistory: bookings.length > 0,
        hasWishlist: wishlistPackages.length > 0,
    };
}
