"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSyntaxError = exports.isExpressError = exports.isMongoServerError = void 0;
const isMongoServerError = (err) => {
    return (typeof err === 'object' &&
        err !== null &&
        'name' in err &&
        err.name === 'MongoServerError' &&
        'code' in err &&
        err.code === 11000);
};
exports.isMongoServerError = isMongoServerError;
const isExpressError = (err) => {
    return typeof err === 'object' && err !== null && 'status_code' in err;
};
exports.isExpressError = isExpressError;
const isSyntaxError = (err) => {
    return err instanceof SyntaxError && 'body' in err;
};
exports.isSyntaxError = isSyntaxError;
