"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObjectId = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = require("../../../errors/AppError");
const http_status_code_1 = require("../../../shared/constants/http_status_code");
const toObjectId = (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new AppError_1.AppError('Invalid ObjectId format', http_status_code_1.HTTP_STATUS.BAD_REQUEST);
    }
    return new mongoose_1.Types.ObjectId(id);
};
exports.toObjectId = toObjectId;
