"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleMapper = void 0;
const constants_1 = require("../../shared/constants/constants");
class ScheduleMapper {
    static toListItem(schedule) {
        var _a, _b, _c, _d, _e, _f;
        const soloPricing = (_b = (_a = schedule.pricing.find((p) => p.type === 'SOLO')) === null || _a === void 0 ? void 0 : _a.price) !== null && _b !== void 0 ? _b : null;
        return {
            scheduleId: schedule._id.toString(),
            packageId: schedule.packageId._id.toString(),
            packageTitle: (_c = schedule.packageId.title) !== null && _c !== void 0 ? _c : '',
            packageDays: (_d = schedule.packageId.days) !== null && _d !== void 0 ? _d : '',
            difficultyLevel: (_e = schedule.packageId.difficultyLevel) !== null && _e !== void 0 ? _e : '',
            startDate: schedule.startDate.toISOString(),
            endDate: schedule.endDate.toISOString(),
            reportingTime: schedule.reportingTime,
            reportingLocation: schedule.reportingLocation,
            pricing: schedule.pricing.map(ScheduleMapper.mapPricing),
            soloPricing, // convenience for UI
            totalSeats: schedule.totalSeats,
            seatsBooked: schedule.seatsBooked,
            seatsRemaining: schedule.totalSeats - schedule.seatsBooked,
            status: schedule.status,
            notes: (_f = schedule.notes) !== null && _f !== void 0 ? _f : null,
        };
    }
    static toListResponse(schedules, total, page, limit, statusCounts) {
        var _a, _b, _c, _d, _e;
        return {
            data: schedules.map(ScheduleMapper.toListItem),
            totalDocs: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            statusCounts: {
                upcoming: (_a = statusCounts[constants_1.SCHEDULE_STATUS.UPCOMING]) !== null && _a !== void 0 ? _a : 0,
                ongoing: (_b = statusCounts[constants_1.SCHEDULE_STATUS.ONGOING]) !== null && _b !== void 0 ? _b : 0,
                completed: (_c = statusCounts[constants_1.SCHEDULE_STATUS.COMPLETED]) !== null && _c !== void 0 ? _c : 0,
                cancelled: (_d = statusCounts[constants_1.SCHEDULE_STATUS.CANCELLED]) !== null && _d !== void 0 ? _d : 0,
                soldOut: (_e = statusCounts[constants_1.SCHEDULE_STATUS.SOLD_OUT]) !== null && _e !== void 0 ? _e : 0,
            },
        };
    }
    static toResponse(schedule) {
        var _a, _b, _c, _d, _e;
        return {
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            reportingTime: schedule.reportingTime,
            reportingLocation: schedule.reportingLocation,
            pricing: schedule.pricing.map(ScheduleMapper.mapPricing),
            totalSeats: schedule.totalSeats,
            seatsBooked: schedule.seatsBooked,
            seatsRemaining: schedule.totalSeats - schedule.seatsBooked,
            notes: (_a = schedule.notes) !== null && _a !== void 0 ? _a : null,
            status: schedule.status,
            cancellationReason: (_b = schedule.cancellationReason) !== null && _b !== void 0 ? _b : null,
            cancelledAt: (_c = schedule.cancelledAt) !== null && _c !== void 0 ? _c : null,
            cancelledBookings: (_d = schedule.cancelledBookings) !== null && _d !== void 0 ? _d : null,
            totalRefunded: (_e = schedule.totalRefunded) !== null && _e !== void 0 ? _e : null,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt,
        };
    }
    static toPublicSchedule(schedule) {
        return {
            scheduleId: schedule._id.toString(),
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            status: schedule.status,
            seatsRemaining: schedule.totalSeats - schedule.seatsBooked,
            pricing: schedule.pricing.map((tier) => ({
                type: tier.type,
                peopleCount: tier.peopleCount,
                price: tier.price,
            })),
            reportingLocation: schedule.reportingLocation,
            reportingTime: schedule.reportingTime,
        };
    }
    static toBookingSummaryResponse(schedule, stats) {
        return {
            scheduleId: schedule._id.toString(),
            packageTitle: schedule.packageId.title,
            packageLocation: schedule.packageId.location,
            packageState: schedule.packageId.state,
            basePrice: schedule.packageId.basePrice,
            startDate: schedule.startDate.toISOString(),
            endDate: schedule.endDate.toISOString(),
            reportingTime: schedule.reportingTime,
            reportingLocation: schedule.reportingLocation,
            totalSeats: schedule.totalSeats,
            scheduleStatus: schedule.status,
            totalConfirmedBookings: stats.totalConfirmedBookings,
            totalCancelledBookings: stats.totalCancelledBookings,
            totalConfirmedAmount: stats.totalConfirmedAmount,
            totalCancelledAmount: stats.totalCancelledAmount,
            totalVendorEarning: stats.totalVendorEarning,
            totalPlatformCommission: stats.totalPlatformCommission,
        };
    }
    static toScheduleBookingDetail(booking) {
        var _a, _b;
        return {
            id: booking._id.toString(),
            username: (_b = (_a = booking.userId) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '',
            bookingCode: booking.bookingCode,
            groupType: booking.groupType,
            travallersCount: booking.travelerCount,
            finalAmount: booking.finalAmount,
            paymentStatus: booking.paymentStatus,
            bookingStatus: booking.bookingStatus,
            bookedOn: booking.createdAt.toISOString(),
        };
    }
    static toScheduleBookingListResponse(result, page, limit) {
        return {
            data: result.bookings.map(ScheduleMapper.toScheduleBookingDetail),
            totalDocs: result.total,
            currentPage: page,
            totalPages: Math.ceil(result.total / limit),
        };
    }
    static toScheduleBookingSingleDetail(booking) {
        var _a, _b, _c, _d, _e, _f, _g;
        const travelers = ((_a = booking.travelers) !== null && _a !== void 0 ? _a : [])
            .slice()
            .sort((a, b) => (b.isLead ? 1 : 0) - (a.isLead ? 1 : 0))
            .map((t) => {
            var _a, _b, _c, _d;
            return ({
                fullName: (_a = t.fullName) !== null && _a !== void 0 ? _a : '',
                idType: (_b = t.idType) !== null && _b !== void 0 ? _b : '',
                idNumber: (_c = t.idNumber) !== null && _c !== void 0 ? _c : '',
                isLead: (_d = t.isLead) !== null && _d !== void 0 ? _d : false,
                phoneNumber: t.phoneNumber || null,
                emailAddress: t.emailAddress || null,
                emergencyContact: t.emergencyContact || null,
                relation: t.relation || null,
            });
        });
        return {
            id: booking._id.toString(),
            username: (_c = (_b = booking.userId) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '',
            bookingCode: booking.bookingCode,
            groupType: booking.groupType,
            paymentMethod: (_d = booking.paymentMethod) !== null && _d !== void 0 ? _d : null,
            bookedOn: (_g = (_f = (_e = booking.createdAt) === null || _e === void 0 ? void 0 : _e.toISOString) === null || _f === void 0 ? void 0 : _f.call(_e)) !== null && _g !== void 0 ? _g : String(booking.createdAt),
            finalAmount: booking.finalAmount,
            paymentStatus: booking.paymentStatus,
            bookingStatus: booking.bookingStatus,
            travelers,
        };
    }
}
exports.ScheduleMapper = ScheduleMapper;
ScheduleMapper.mapPricing = (tier) => ({
    type: tier.type,
    peopleCount: tier.peopleCount,
    price: tier.price,
});
