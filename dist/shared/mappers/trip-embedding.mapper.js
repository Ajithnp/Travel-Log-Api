"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripEmbeddingMapper = void 0;
const constants_1 = require("../../shared/constants/constants");
const get_minimum_price_1 = require("../utils/booking/get-minimum-price");
class TripEmbeddingMapper {
    static toEntity(schedule, pkg, embedding, combinedText) {
        var _a, _b;
        const seatsAvailable = schedule.totalSeats - schedule.seatsBooked;
        return {
            scheduleId: schedule._id,
            packageId: pkg._id,
            combinedText,
            embedding,
            title: pkg.title,
            location: pkg.location,
            state: pkg.state,
            imageKey: ((_b = (_a = pkg.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.key) || null,
            minPrice: (0, get_minimum_price_1.getMinimumPrice)(schedule.pricing),
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            seatsAvailable,
            difficultyLevel: pkg.difficultyLevel,
            category: pkg.categoryId.name,
            days: pkg.days,
            nights: pkg.nights,
            packageAverageRating: Number(pkg.averageRating || 0),
            packageTotalReviews: Number(pkg.totalReviews || 0),
            isActive: schedule.status === constants_1.SCHEDULE_STATUS.UPCOMING && seatsAvailable > 0,
        };
    }
}
exports.TripEmbeddingMapper = TripEmbeddingMapper;
