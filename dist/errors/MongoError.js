"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMongoDuplicateError = void 0;
const FIELD_LABELS = {
    phone: 'Phone number',
    email: 'Email address',
    username: 'Username',
};
const handleMongoDuplicateError = (err) => {
    var _a, _b;
    const duplicatedField = (_a = Object.keys(err.keyPattern)[0]) !== null && _a !== void 0 ? _a : 'Field';
    const label = (_b = FIELD_LABELS[duplicatedField]) !== null && _b !== void 0 ? _b : 'This value';
    return {
        message: `${label} is already registered.`,
        errorCode: 'DUPLICATE_FIELD',
    };
};
exports.handleMongoDuplicateError = handleMongoDuplicateError;
