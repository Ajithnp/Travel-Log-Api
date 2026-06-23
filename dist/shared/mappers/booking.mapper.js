"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingMapper = void 0;
class BookingMapper {
    static toCancellationRequestDetails(booking) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        const pkg = booking.packageId;
        const rawPolicy = pkg === null || pkg === void 0 ? void 0 : pkg.cancellationPolicy;
        const cancellationPolicy = rawPolicy !== null && rawPolicy !== undefined
            ? {
                id: (_b = (_a = rawPolicy._id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                key: (_c = rawPolicy.key) !== null && _c !== void 0 ? _c : '',
                label: (_d = rawPolicy.label) !== null && _d !== void 0 ? _d : '',
                rules: ((_e = rawPolicy.rules) !== null && _e !== void 0 ? _e : []).map((rule) => {
                    var _a, _b;
                    return ({
                        daysBeforeTrip: (_a = rule.daysBeforeTrip) !== null && _a !== void 0 ? _a : 0,
                        refundPercent: (_b = rule.refundPercent) !== null && _b !== void 0 ? _b : 0,
                    });
                }),
                isActive: (_f = rawPolicy.isActive) !== null && _f !== void 0 ? _f : false,
            }
            : null;
        return {
            bookingId: (_h = (_g = booking._id) === null || _g === void 0 ? void 0 : _g.toString()) !== null && _h !== void 0 ? _h : '',
            bookingCode: booking.bookingCode || '',
            userName: ((_j = booking.userId) === null || _j === void 0 ? void 0 : _j.name) || '',
            email: ((_k = booking.userId) === null || _k === void 0 ? void 0 : _k.email) || '',
            phoneNo: ((_l = booking.userId) === null || _l === void 0 ? void 0 : _l.phone) || '',
            vendorName: ((_m = booking.vendorId) === null || _m === void 0 ? void 0 : _m.name) || '',
            startDate: (_o = booking.scheduleId) === null || _o === void 0 ? void 0 : _o.startDate,
            packageName: (_p = pkg === null || pkg === void 0 ? void 0 : pkg.title) !== null && _p !== void 0 ? _p : '',
            cancellationPolicy,
            travelersCount: (_q = booking.travelerCount) !== null && _q !== void 0 ? _q : 0,
            groupType: (_r = booking.groupType) !== null && _r !== void 0 ? _r : 'SOLO',
            cancellationReason: (_s = booking.cancellationReason) !== null && _s !== void 0 ? _s : null,
            updatedAt: booking.updatedAt,
            finalAmount: (_t = booking.finalAmount) !== null && _t !== void 0 ? _t : 0,
            cancellationRefundAmount: (_u = booking.cancelationRefundAmount) !== null && _u !== void 0 ? _u : null,
            cancellationRejectedReason: (_v = booking.cancellationRejectedReason) !== null && _v !== void 0 ? _v : null,
            cancelledAt: (_w = booking.cancelledAt) !== null && _w !== void 0 ? _w : null,
        };
    }
    static toDetailedResponse(booking) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45;
        const pkg = booking.packageId;
        const itinerary = ((_a = pkg === null || pkg === void 0 ? void 0 : pkg.itinerary) !== null && _a !== void 0 ? _a : [])
            .slice()
            .sort((a, b) => { var _a, _b; return ((_a = a.dayNumber) !== null && _a !== void 0 ? _a : 0) - ((_b = b.dayNumber) !== null && _b !== void 0 ? _b : 0); })
            .map((day) => {
            var _a, _b, _c;
            return ({
                dayNumber: (_a = day.dayNumber) !== null && _a !== void 0 ? _a : 0,
                title: (_b = day.title) !== null && _b !== void 0 ? _b : null,
                activities: ((_c = day.activities) !== null && _c !== void 0 ? _c : []).map((act) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    return ({
                        startTime: (_a = act.startTime) !== null && _a !== void 0 ? _a : null,
                        endTime: (_b = act.endTime) !== null && _b !== void 0 ? _b : null,
                        title: (_c = act.title) !== null && _c !== void 0 ? _c : null,
                        description: (_d = act.description) !== null && _d !== void 0 ? _d : null,
                        location: (_e = act.location) !== null && _e !== void 0 ? _e : null,
                        specials: (_f = act.specials) !== null && _f !== void 0 ? _f : [],
                        included: (_g = act.included) !== null && _g !== void 0 ? _g : false,
                    });
                }),
            });
        });
        const rawCategory = pkg === null || pkg === void 0 ? void 0 : pkg.categoryId;
        const category = rawCategory !== null &&
            rawCategory !== undefined &&
            typeof rawCategory === 'object' &&
            '_id' in rawCategory &&
            'name' in rawCategory
            ? {
                id: (_c = (_b = rawCategory._id) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '',
                name: (_d = rawCategory.name) !== null && _d !== void 0 ? _d : '',
            }
            : null;
        const rawPolicy = pkg === null || pkg === void 0 ? void 0 : pkg.cancellationPolicy;
        const cancellationPolicy = rawPolicy !== null &&
            rawPolicy !== undefined &&
            typeof rawPolicy === 'object' &&
            '_id' in rawPolicy &&
            'key' in rawPolicy
            ? {
                id: (_f = (_e = rawPolicy._id) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : '',
                key: (_g = rawPolicy.key) !== null && _g !== void 0 ? _g : '',
                label: (_h = rawPolicy.label) !== null && _h !== void 0 ? _h : '',
                rules: ((_j = rawPolicy.rules) !== null && _j !== void 0 ? _j : []).map((rule) => {
                    var _a, _b;
                    return ({
                        daysBeforeTrip: (_a = rule.daysBeforeTrip) !== null && _a !== void 0 ? _a : 0,
                        refundPercent: (_b = rule.refundPercent) !== null && _b !== void 0 ? _b : 0,
                    });
                }),
                isActive: (_k = rawPolicy.isActive) !== null && _k !== void 0 ? _k : false,
            }
            : null;
        const mappedPackage = {
            id: (_m = (_l = pkg === null || pkg === void 0 ? void 0 : pkg._id) === null || _l === void 0 ? void 0 : _l.toString()) !== null && _m !== void 0 ? _m : '',
            title: (_o = pkg === null || pkg === void 0 ? void 0 : pkg.title) !== null && _o !== void 0 ? _o : '',
            location: (_p = pkg === null || pkg === void 0 ? void 0 : pkg.location) !== null && _p !== void 0 ? _p : '',
            state: (_q = pkg === null || pkg === void 0 ? void 0 : pkg.state) !== null && _q !== void 0 ? _q : '',
            usp: (_r = pkg === null || pkg === void 0 ? void 0 : pkg.usp) !== null && _r !== void 0 ? _r : '',
            days: (_s = pkg === null || pkg === void 0 ? void 0 : pkg.days) !== null && _s !== void 0 ? _s : '',
            nights: (_t = pkg === null || pkg === void 0 ? void 0 : pkg.nights) !== null && _t !== void 0 ? _t : '',
            difficultyLevel: (_u = pkg === null || pkg === void 0 ? void 0 : pkg.difficultyLevel) !== null && _u !== void 0 ? _u : '',
            cancellationPolicy,
            inclusions: (_v = pkg === null || pkg === void 0 ? void 0 : pkg.inclusions) !== null && _v !== void 0 ? _v : [],
            exclusions: (_w = pkg === null || pkg === void 0 ? void 0 : pkg.exclusions) !== null && _w !== void 0 ? _w : [],
            packingList: (_x = pkg === null || pkg === void 0 ? void 0 : pkg.packingList) !== null && _x !== void 0 ? _x : [],
            itinerary,
            category,
            averageRating: (_y = pkg === null || pkg === void 0 ? void 0 : pkg.averageRating) !== null && _y !== void 0 ? _y : 0,
            totalReviews: (_z = pkg === null || pkg === void 0 ? void 0 : pkg.totalReviews) !== null && _z !== void 0 ? _z : 0,
        };
        const sched = booking.scheduleId;
        const mappedSchedule = {
            id: (_1 = (_0 = sched === null || sched === void 0 ? void 0 : sched._id) === null || _0 === void 0 ? void 0 : _0.toString()) !== null && _1 !== void 0 ? _1 : '',
            startDate: (_2 = sched === null || sched === void 0 ? void 0 : sched.startDate) !== null && _2 !== void 0 ? _2 : '',
            endDate: (_3 = sched === null || sched === void 0 ? void 0 : sched.endDate) !== null && _3 !== void 0 ? _3 : '',
            reportingTime: (_4 = sched === null || sched === void 0 ? void 0 : sched.reportingTime) !== null && _4 !== void 0 ? _4 : '',
            reportingLocation: (_5 = sched === null || sched === void 0 ? void 0 : sched.reportingLocation) !== null && _5 !== void 0 ? _5 : '',
            notes: (_6 = sched === null || sched === void 0 ? void 0 : sched.notes) !== null && _6 !== void 0 ? _6 : null,
        };
        const vendor = booking.vendorId;
        const mappedVendor = {
            id: (_8 = (_7 = vendor === null || vendor === void 0 ? void 0 : vendor._id) === null || _7 === void 0 ? void 0 : _7.toString()) !== null && _8 !== void 0 ? _8 : '',
            name: (_9 = vendor === null || vendor === void 0 ? void 0 : vendor.name) !== null && _9 !== void 0 ? _9 : '',
        };
        // ── Travelers ───
        const travelers = ((_10 = booking.travelers) !== null && _10 !== void 0 ? _10 : [])
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
        // ── Financials ──────────
        const financials = {
            grossAmount: (_11 = booking.grossAmount) !== null && _11 !== void 0 ? _11 : 0,
            discountAmount: (_12 = booking.discountAmount) !== null && _12 !== void 0 ? _12 : 0,
            walletAmountUsed: (_13 = booking.walletAmountUsed) !== null && _13 !== void 0 ? _13 : 0,
            finalAmount: (_14 = booking.finalAmount) !== null && _14 !== void 0 ? _14 : 0,
        };
        return {
            id: (_16 = (_15 = booking._id) === null || _15 === void 0 ? void 0 : _15.toString()) !== null && _16 !== void 0 ? _16 : '',
            bookingCode: (_17 = booking.bookingCode) !== null && _17 !== void 0 ? _17 : '',
            userId: (_19 = (_18 = booking.userId) === null || _18 === void 0 ? void 0 : _18.toString()) !== null && _19 !== void 0 ? _19 : '',
            package: mappedPackage,
            schedule: mappedSchedule,
            vendor: mappedVendor,
            groupType: (_20 = booking.groupType) !== null && _20 !== void 0 ? _20 : 'SOLO',
            travelerCount: (_21 = booking.travelerCount) !== null && _21 !== void 0 ? _21 : 0,
            travelers,
            financials,
            cancellationPolicy,
            paymentStatus: (_22 = booking.paymentStatus) !== null && _22 !== void 0 ? _22 : '',
            paymentMethod: (_23 = booking.paymentMethod) !== null && _23 !== void 0 ? _23 : null,
            transactionId: (_24 = booking.transactionId) !== null && _24 !== void 0 ? _24 : null,
            bookingStatus: (_25 = booking.bookingStatus) !== null && _25 !== void 0 ? _25 : '',
            cancellationReason: (_26 = booking.cancellationReason) !== null && _26 !== void 0 ? _26 : null,
            cancelledAt: (_29 = (_28 = (_27 = booking.cancelledAt) === null || _27 === void 0 ? void 0 : _27.toISOString) === null || _28 === void 0 ? void 0 : _28.call(_27)) !== null && _29 !== void 0 ? _29 : null,
            cancelledBy: (_30 = booking.cancelledBy) !== null && _30 !== void 0 ? _30 : null,
            cancellationStatus: (_31 = booking.cancellationStatus) !== null && _31 !== void 0 ? _31 : null,
            isAttended: (_32 = booking.isAttended) !== null && _32 !== void 0 ? _32 : false,
            attendedAt: (_35 = (_34 = (_33 = booking.attendedAt) === null || _33 === void 0 ? void 0 : _33.toISOString) === null || _34 === void 0 ? void 0 : _34.call(_33)) !== null && _35 !== void 0 ? _35 : null,
            hasReviewed: (_36 = booking.hasReviewed) !== null && _36 !== void 0 ? _36 : false,
            ticketUrl: (_37 = booking.ticketUrl) !== null && _37 !== void 0 ? _37 : null,
            averageRating: (_38 = booking.averageRating) !== null && _38 !== void 0 ? _38 : 0,
            totalReviews: (_39 = booking.totalReviews) !== null && _39 !== void 0 ? _39 : 0,
            chatId: null,
            createdAt: (_42 = (_41 = (_40 = booking.createdAt) === null || _40 === void 0 ? void 0 : _40.toISOString) === null || _41 === void 0 ? void 0 : _41.call(_40)) !== null && _42 !== void 0 ? _42 : '',
            updatedAt: (_45 = (_44 = (_43 = booking.updatedAt) === null || _43 === void 0 ? void 0 : _43.toISOString) === null || _44 === void 0 ? void 0 : _44.call(_43)) !== null && _45 !== void 0 ? _45 : '',
        };
    }
}
exports.BookingMapper = BookingMapper;
