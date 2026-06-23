"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageMapper = void 0;
class PackageMapper {
    static toOfferResponse(pkg) {
        var _a, _b;
        return {
            id: pkg._id.toString(),
            title: (_a = pkg.title) !== null && _a !== void 0 ? _a : '',
            hasOffer: (_b = pkg.hasOffer) !== null && _b !== void 0 ? _b : false,
            offerValue: pkg.offerValue,
        };
    }
    static toResponse(pkg) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return {
            id: pkg._id.toString(),
            title: (_a = pkg.title) !== null && _a !== void 0 ? _a : '',
            location: (_b = pkg.location) !== null && _b !== void 0 ? _b : '',
            state: (_c = pkg.state) !== null && _c !== void 0 ? _c : '',
            durationDays: Number(pkg.days) || 0,
            durationNights: Number(pkg.nights) || 0,
            imageUrl: (_e = (_d = pkg.images) === null || _d === void 0 ? void 0 : _d.map((image) => ({ key: image.key }))) !== null && _e !== void 0 ? _e : [],
            status: pkg.status,
            category: (_g = (_f = pkg.categoryId) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : '',
            difficultyLevel: (_h = pkg.difficultyLevel) !== null && _h !== void 0 ? _h : '',
            basePrice: Number(pkg.basePrice) || 0,
            hasOffer: pkg.hasOffer,
            offerPercentage: pkg.offerPercentage,
            scheduleCount: pkg.scheduleCount,
        };
    }
    static toDetailResponse(pkg) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        return {
            packageId: pkg._id.toString(),
            vendorId: pkg.vendorId.toString(),
            title: (_a = pkg.title) !== null && _a !== void 0 ? _a : '',
            location: (_b = pkg.location) !== null && _b !== void 0 ? _b : '',
            state: (_c = pkg.state) !== null && _c !== void 0 ? _c : '',
            usp: (_d = pkg.usp) !== null && _d !== void 0 ? _d : '',
            category: (_f = (_e = pkg.categoryId) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : null,
            difficultyLevel: (_g = pkg.difficultyLevel) !== null && _g !== void 0 ? _g : undefined,
            description: (_h = pkg.description) !== null && _h !== void 0 ? _h : '',
            days: (_j = pkg.days) !== null && _j !== void 0 ? _j : '',
            nights: (_k = pkg.nights) !== null && _k !== void 0 ? _k : '',
            basePrice: (_l = pkg.basePrice) !== null && _l !== void 0 ? _l : '',
            images: (_o = (_m = pkg.images) === null || _m === void 0 ? void 0 : _m.map((image) => ({ key: image.key }))) !== null && _o !== void 0 ? _o : [],
            itinerary: (_q = (_p = pkg.itinerary) === null || _p === void 0 ? void 0 : _p.map((day) => {
                var _a, _b, _c, _d;
                return ({
                    dayNumber: (_a = day.dayNumber) !== null && _a !== void 0 ? _a : 0,
                    title: (_b = day.title) !== null && _b !== void 0 ? _b : '',
                    activities: (_d = (_c = day.activities) === null || _c === void 0 ? void 0 : _c.map((activity) => {
                        var _a, _b, _c, _d, _e, _f, _g;
                        return ({
                            startTime: (_a = activity.startTime) !== null && _a !== void 0 ? _a : '',
                            endTime: (_b = activity.endTime) !== null && _b !== void 0 ? _b : '',
                            title: (_c = activity.title) !== null && _c !== void 0 ? _c : '',
                            description: (_d = activity.description) !== null && _d !== void 0 ? _d : '',
                            location: (_e = activity.location) !== null && _e !== void 0 ? _e : '',
                            specials: (_f = activity.specials) !== null && _f !== void 0 ? _f : [],
                            included: (_g = activity.included) !== null && _g !== void 0 ? _g : false,
                        });
                    })) !== null && _d !== void 0 ? _d : [],
                });
            })) !== null && _q !== void 0 ? _q : [],
            inclusions: (_r = pkg.inclusions) !== null && _r !== void 0 ? _r : [],
            exclusions: (_s = pkg.exclusions) !== null && _s !== void 0 ? _s : [],
            packingList: (_t = pkg.packingList) !== null && _t !== void 0 ? _t : [],
            cancellationPolicy: pkg.cancellationPolicy
                ? {
                    _id: pkg.cancellationPolicy._id.toString(),
                    label: (_u = pkg.cancellationPolicy.label) !== null && _u !== void 0 ? _u : '',
                    key: (_v = pkg.cancellationPolicy.key) !== null && _v !== void 0 ? _v : '',
                }
                : null,
            status: pkg.status,
            isActive: pkg.isActive,
            createdAt: pkg.createdAt,
            updatedAt: pkg.updatedAt,
        };
    }
    static toScheduleContext(pkg) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return {
            PackageId: pkg._id.toString(),
            title: (_a = pkg.title) !== null && _a !== void 0 ? _a : '',
            location: (_b = pkg.location) !== null && _b !== void 0 ? _b : '',
            state: (_c = pkg.state) !== null && _c !== void 0 ? _c : '',
            category: (_e = (_d = pkg.categoryId) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : null,
            difficultyLevel: (_f = pkg.difficultyLevel) !== null && _f !== void 0 ? _f : '',
            status: pkg.status,
            days: Number((_g = pkg.days) !== null && _g !== void 0 ? _g : 0),
            nights: Number((_h = pkg.nights) !== null && _h !== void 0 ? _h : 0),
        };
    }
    static toPublicListing(p) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        return {
            _id: p._id.toString(),
            title: p.title,
            description: p.description ? p.description.substring(0, 200) + '…' : '',
            location: (_a = p.location) !== null && _a !== void 0 ? _a : '',
            state: (_b = p.state) !== null && _b !== void 0 ? _b : '',
            difficultyLevel: p.difficultyLevel,
            days: (_c = p.days) !== null && _c !== void 0 ? _c : 0,
            nights: (_d = p.nights) !== null && _d !== void 0 ? _d : 0,
            usp: (_e = p.usp) !== null && _e !== void 0 ? _e : '',
            images: (_f = p.images) !== null && _f !== void 0 ? _f : [],
            category: p.category
                ? {
                    _id: p.category._id.toString(),
                    name: p.category.name,
                    slug: p.category.slug,
                }
                : null,
            vendor: {
                _id: (_j = (_h = (_g = p.vendor) === null || _g === void 0 ? void 0 : _g._id) === null || _h === void 0 ? void 0 : _h.toString()) !== null && _j !== void 0 ? _j : '',
                name: (_l = (_k = p.vendor) === null || _k === void 0 ? void 0 : _k.name) !== null && _l !== void 0 ? _l : '',
            },
            startingFromPrice: (_m = p.startingFromPrice) !== null && _m !== void 0 ? _m : 0,
            earliestDate: p.earliestDate,
            earliestEndDate: p.earliestEndDate,
            earliestScheduleStatus: p.earliestScheduleStatus,
            scheduleCount: (_o = p.scheduleCount) !== null && _o !== void 0 ? _o : 0,
            isSoldOut: (_p = p.isSoldOut) !== null && _p !== void 0 ? _p : false,
            hasOffer: (_q = p.hasOffer) !== null && _q !== void 0 ? _q : false,
            offerPercentage: (_r = p.offerPercentage) !== null && _r !== void 0 ? _r : 0,
            averageRating: (_s = p.averageRating) !== null && _s !== void 0 ? _s : 0,
            totalReviews: (_t = p.totalReviews) !== null && _t !== void 0 ? _t : 0,
        };
    }
    static toPublicDetailResponse(pkg) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
        return {
            packageId: pkg._id.toString(),
            vendor: {
                id: pkg.vendorId._id.toString(),
                name: (_a = pkg.vendorId.name) !== null && _a !== void 0 ? _a : '',
            },
            title: (_b = pkg.title) !== null && _b !== void 0 ? _b : '',
            location: (_c = pkg.location) !== null && _c !== void 0 ? _c : '',
            state: (_d = pkg.state) !== null && _d !== void 0 ? _d : '',
            usp: (_e = pkg.usp) !== null && _e !== void 0 ? _e : '',
            category: (_g = (_f = pkg.categoryId) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : null,
            difficultyLevel: (_h = pkg.difficultyLevel) !== null && _h !== void 0 ? _h : undefined,
            description: (_j = pkg.description) !== null && _j !== void 0 ? _j : '',
            days: (_k = pkg.days) !== null && _k !== void 0 ? _k : '',
            nights: (_l = pkg.nights) !== null && _l !== void 0 ? _l : '',
            basePrice: (_m = pkg.basePrice) !== null && _m !== void 0 ? _m : '',
            images: (_p = (_o = pkg.images) === null || _o === void 0 ? void 0 : _o.map((image) => ({ key: image.key }))) !== null && _p !== void 0 ? _p : [],
            itinerary: (_r = (_q = pkg.itinerary) === null || _q === void 0 ? void 0 : _q.map((day) => {
                var _a, _b, _c, _d;
                return ({
                    dayNumber: (_a = day.dayNumber) !== null && _a !== void 0 ? _a : 0,
                    title: (_b = day.title) !== null && _b !== void 0 ? _b : '',
                    activities: (_d = (_c = day.activities) === null || _c === void 0 ? void 0 : _c.map((activity) => {
                        var _a, _b, _c, _d, _e, _f, _g;
                        return ({
                            startTime: (_a = activity.startTime) !== null && _a !== void 0 ? _a : '',
                            endTime: (_b = activity.endTime) !== null && _b !== void 0 ? _b : '',
                            title: (_c = activity.title) !== null && _c !== void 0 ? _c : '',
                            description: (_d = activity.description) !== null && _d !== void 0 ? _d : '',
                            location: (_e = activity.location) !== null && _e !== void 0 ? _e : '',
                            specials: (_f = activity.specials) !== null && _f !== void 0 ? _f : [],
                            included: (_g = activity.included) !== null && _g !== void 0 ? _g : false,
                        });
                    })) !== null && _d !== void 0 ? _d : [],
                });
            })) !== null && _r !== void 0 ? _r : [],
            inclusions: (_s = pkg.inclusions) !== null && _s !== void 0 ? _s : [],
            exclusions: (_t = pkg.exclusions) !== null && _t !== void 0 ? _t : [],
            packingList: (_u = pkg.packingList) !== null && _u !== void 0 ? _u : [],
            cancellationPolicy: pkg.cancellationPolicy
                ? {
                    _id: pkg.cancellationPolicy._id.toString(),
                    label: (_v = pkg.cancellationPolicy.label) !== null && _v !== void 0 ? _v : '',
                    key: (_w = pkg.cancellationPolicy.key) !== null && _w !== void 0 ? _w : '',
                    description: pkg.cancellationPolicy.description,
                    rules: (_y = (_x = pkg.cancellationPolicy.rules) === null || _x === void 0 ? void 0 : _x.map((rule) => ({
                        daysBeforeTrip: rule.daysBeforeTrip,
                        refundPercent: rule.refundPercent,
                    }))) !== null && _y !== void 0 ? _y : [],
                }
                : null,
            status: pkg.status,
            isActive: pkg.isActive,
        };
    }
}
exports.PackageMapper = PackageMapper;
