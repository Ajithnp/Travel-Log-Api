"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancellationRejectSchema = exports.BlockOrUnblockUserSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const objectIdSchema = zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: 'Invalid user id',
});
exports.BlockOrUnblockUserSchema = zod_1.z
    .object({
    params: zod_1.z.object({
        userId: objectIdSchema,
    }),
    body: zod_1.z.object({
        blockUser: zod_1.z.boolean(),
        reason: zod_1.z.string().trim().min(1, 'Reason cannot be empty').optional(),
    }),
})
    .superRefine((data, ctx) => {
    if (data.body.blockUser && !data.body.reason) {
        ctx.addIssue({
            path: ['body', 'reason'],
            message: 'Reason is required when blocking a user',
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
exports.CancellationRejectSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string().trim().min(1, 'Reason is required to reject'),
    }),
});
