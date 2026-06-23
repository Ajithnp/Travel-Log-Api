"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryMapper = void 0;
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
});
class CategoryMapper {
    static toResponse(cat) {
        var _a, _b, _c, _d, _e, _f, _g;
        return {
            id: cat._id.toString(),
            name: cat.name,
            slug: cat.slug,
            description: (_a = cat.description) !== null && _a !== void 0 ? _a : null,
            icon: (_b = cat.icon) !== null && _b !== void 0 ? _b : null,
            isActive: cat.isActive,
            status: cat.status,
            createdBy: (_d = (_c = cat.createdBy) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : null,
            requestedBy: (_f = (_e = cat.requestedBy) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : null,
            rejectionReason: (_g = cat.rejectionReason) !== null && _g !== void 0 ? _g : null,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
        };
    }
    static toRequestResponse(cat) {
        var _a;
        return {
            id: cat._id.toString(),
            name: cat.name,
            requested: cat.requestedBy
                ? { name: cat.requestedBy.name, email: cat.requestedBy.email }
                : null,
            vendorNote: (_a = cat.vendorNote) !== null && _a !== void 0 ? _a : null,
            date: DATE_FORMAT.format(cat.createdAt),
            status: cat.status,
        };
    }
    static toReviewedResponse(cat) {
        var _a;
        return {
            id: cat._id.toString(),
            name: cat.name,
            requested: cat.requestedBy
                ? { name: cat.requestedBy.name, email: cat.requestedBy.email }
                : null,
            adminNote: (_a = cat.adminNote) !== null && _a !== void 0 ? _a : null,
            updatedDate: DATE_FORMAT.format(cat.updatedAt),
            status: cat.status,
        };
    }
    static toVendorRequestResponse(cat) {
        var _a, _b;
        return {
            id: cat._id.toString(),
            name: cat.name,
            adminNote: (_a = cat.rejectionReason) !== null && _a !== void 0 ? _a : null,
            note: (_b = cat.vendorNote) !== null && _b !== void 0 ? _b : null,
            createdAt: DATE_FORMAT.format(cat.updatedAt),
            status: cat.status,
        };
    }
    static toActiveCategoriesResponse(cat) {
        return {
            id: cat._id.toString(),
            name: cat.name,
        };
    }
}
exports.CategoryMapper = CategoryMapper;
