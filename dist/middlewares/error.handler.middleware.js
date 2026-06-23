"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const AppError_1 = require("../errors/AppError");
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const isMongoError_1 = require("../errors/gurdes/isMongoError");
const MongoError_1 = require("../errors/MongoError");
const errorMiddleware = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    var _a, _b;
    let statusCode = http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR;
    let errorCode;
    if (err instanceof AppError_1.AppError) {
        statusCode = err.status_code;
        message = err.message;
        errorCode = err.error_code;
    }
    else if ((0, isMongoError_1.isMongoServerError)(err)) {
        const { message: mongoMessage, errorCode: mongoErrorCode } = (0, MongoError_1.handleMongoDuplicateError)(err);
        statusCode = http_status_code_1.HTTP_STATUS.CONFLICT;
        message = mongoMessage;
        errorCode = mongoErrorCode;
    }
    else if ((0, isMongoError_1.isSyntaxError)(err)) {
        statusCode = http_status_code_1.HTTP_STATUS.BAD_REQUEST;
        message = messages_1.ERROR_MESSAGES.INVALID_JSON_PAYLOAD;
    }
    else {
        const errorObj = err;
        statusCode = (_a = errorObj === null || errorObj === void 0 ? void 0 : errorObj.status_code) !== null && _a !== void 0 ? _a : http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
        message = (_b = errorObj === null || errorObj === void 0 ? void 0 : errorObj.message) !== null && _b !== void 0 ? _b : messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR;
        errorCode = errorObj === null || errorObj === void 0 ? void 0 : errorObj.error_code;
    }
    const response = {
        success: http_status_code_1.SUCCESS_STATUS.FAILURE,
        message,
        error: errorCode
            ? {
                code: errorCode,
            }
            : {
                code: 'UNKNOWN_ERROR',
            },
    };
    res.status(statusCode).json(response);
};
exports.errorMiddleware = errorMiddleware;
