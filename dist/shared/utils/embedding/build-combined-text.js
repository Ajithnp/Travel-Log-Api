"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCombinedText = buildCombinedText;
//Package + Schedule data → human readable text
function buildCombinedText(pkg, schedule) {
    var _a, _b, _c, _d;
    const seatsAvailable = schedule.totalSeats - schedule.seatsBooked;
    const pricingText = schedule.pricing
        .map((p) => `${p.type} ₹${p.price} for ${p.peopleCount} person(s)`)
        .join(', ');
    const startDate = new Date(schedule.startDate).toDateString();
    const endDate = new Date(schedule.endDate).toDateString();
    return `
    Trip Title: ${pkg.title}
    Location: ${pkg.location}, ${pkg.state}
    Category : ${((_a = pkg === null || pkg === void 0 ? void 0 : pkg.categoryId) === null || _a === void 0 ? void 0 : _a.name) || ' '}
    Difficulty Level: ${pkg.difficultyLevel}
    Duration: ${pkg.days} days and ${pkg.nights} nights
    Description: ${pkg.description}
    Unique Selling Point: ${pkg.usp || ''}
    Inclusions: ${((_b = pkg === null || pkg === void 0 ? void 0 : pkg.inclusions) === null || _b === void 0 ? void 0 : _b.join(', ')) || ' '}
    Exclusions: ${((_c = pkg === null || pkg === void 0 ? void 0 : pkg.exclusions) === null || _c === void 0 ? void 0 : _c.join(', ')) || ' '}
    Packing List: ${((_d = pkg === null || pkg === void 0 ? void 0 : pkg.packingList) === null || _d === void 0 ? void 0 : _d.join(', ')) || ' '}
    Average Rating: ${pkg === null || pkg === void 0 ? void 0 : pkg.averageRating} (${pkg === null || pkg === void 0 ? void 0 : pkg.totalReviews} reviews)

    Schedule Start Date: ${startDate}
    Schedule End Date: ${endDate}
    Reporting Time: ${schedule.reportingTime}
    Reporting Location: ${schedule.reportingLocation}
    Pricing Options: ${pricingText}
    Total Seats: ${schedule.totalSeats}
    Seats Available: ${seatsAvailable}
    Schedule Notes: ${schedule.notes || 'None'}
  `.trim();
}
