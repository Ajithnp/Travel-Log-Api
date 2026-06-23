"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentMapper = void 0;
class DocumentMapper {
    static toBookingTicket(booking) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        const pkg = booking.packageId;
        const sched = booking.scheduleId;
        const vendor = booking.vendorId;
        const formatDate = (d) => {
            if (!d)
                return '—';
            const date = new Date(d);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        };
        return {
            bookingId: booking._id.toString(),
            bookingCode: (_a = booking.bookingCode) !== null && _a !== void 0 ? _a : '',
            packageTitle: (_b = pkg === null || pkg === void 0 ? void 0 : pkg.title) !== null && _b !== void 0 ? _b : 'Trip',
            packageLocation: (_c = pkg === null || pkg === void 0 ? void 0 : pkg.location) !== null && _c !== void 0 ? _c : '',
            packageState: (_d = pkg === null || pkg === void 0 ? void 0 : pkg.state) !== null && _d !== void 0 ? _d : '',
            difficultyLevel: (_e = pkg === null || pkg === void 0 ? void 0 : pkg.difficultyLevel) !== null && _e !== void 0 ? _e : '',
            days: (_g = (_f = pkg === null || pkg === void 0 ? void 0 : pkg.days) === null || _f === void 0 ? void 0 : _f.toString()) !== null && _g !== void 0 ? _g : '',
            nights: (_j = (_h = pkg === null || pkg === void 0 ? void 0 : pkg.nights) === null || _h === void 0 ? void 0 : _h.toString()) !== null && _j !== void 0 ? _j : '',
            vendorName: (_k = vendor === null || vendor === void 0 ? void 0 : vendor.name) !== null && _k !== void 0 ? _k : '',
            startDate: formatDate(sched === null || sched === void 0 ? void 0 : sched.startDate),
            endDate: formatDate(sched === null || sched === void 0 ? void 0 : sched.endDate),
            reportingTime: (_l = sched === null || sched === void 0 ? void 0 : sched.reportingTime) !== null && _l !== void 0 ? _l : '',
            reportingLocation: (_m = sched === null || sched === void 0 ? void 0 : sched.reportingLocation) !== null && _m !== void 0 ? _m : '',
            groupType: (_o = booking.groupType) !== null && _o !== void 0 ? _o : '',
            travelerCount: (_p = booking.travelerCount) !== null && _p !== void 0 ? _p : 0,
            travelers: ((_q = booking.travelers) !== null && _q !== void 0 ? _q : []).map((t) => {
                var _a, _b, _c, _d;
                return ({
                    fullName: (_a = t.fullName) !== null && _a !== void 0 ? _a : '',
                    isLead: (_b = t.isLead) !== null && _b !== void 0 ? _b : false,
                    idType: (_c = t.idType) !== null && _c !== void 0 ? _c : '',
                    idNumber: (_d = t.idNumber) !== null && _d !== void 0 ? _d : '',
                });
            }),
            grossAmount: (_r = booking.grossAmount) !== null && _r !== void 0 ? _r : 0,
            finalAmount: (_s = booking.finalAmount) !== null && _s !== void 0 ? _s : 0,
            paymentMethod: (_t = booking.paymentMethod) !== null && _t !== void 0 ? _t : null,
            transactionId: (_u = booking.transactionId) !== null && _u !== void 0 ? _u : null,
            inclusions: (_v = pkg === null || pkg === void 0 ? void 0 : pkg.inclusions) !== null && _v !== void 0 ? _v : [],
            bookingDate: formatDate(booking.createdAt),
        };
    }
}
exports.DocumentMapper = DocumentMapper;
