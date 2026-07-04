"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinimumPrice = void 0;
const getMinimumPrice = (pricing) => {
    if (!pricing || pricing.length == 0) {
        return 0;
    }
    return Math.min(...pricing.map((p) => p.price));
};
exports.getMinimumPrice = getMinimumPrice;
