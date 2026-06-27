"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ChatMemberSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { _id: false });
const ChatSchema = new mongoose_1.default.Schema({
    scheduleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'SchedulePackage',
        required: true,
        unique: true,
        index: true,
    },
    chatName: {
        type: String,
        required: true,
        trim: true,
    },
    packageId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
    },
    vendorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    vendorLastReadAt: {
        type: Date,
        default: null,
    },
    members: {
        type: [ChatMemberSchema],
        required: true,
        default: [],
    },
    pinnedMessage: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active',
        required: true,
    },
    archivedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
ChatSchema.index({ vendorId: 1 });
ChatSchema.index({ packageId: 1 });
ChatSchema.index({ 'members.userId': 1 });
exports.ChatModel = mongoose_1.default.model('Chat', ChatSchema);
