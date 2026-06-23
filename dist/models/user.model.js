"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        unique: true,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
    },
    profile: {
        type: String,
        default: '',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'vendor'],
        default: 'user',
    },
    unreadTabs: {
        type: [String],
        default: [],
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    blockedReason: {
        type: String,
    },
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
