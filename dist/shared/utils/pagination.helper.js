"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationOptions = void 0;
const getPaginationOptions = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const selectedFilter = req.query.selectedFilter || '';
    return { page, limit, search, selectedFilter };
};
exports.getPaginationOptions = getPaginationOptions;
