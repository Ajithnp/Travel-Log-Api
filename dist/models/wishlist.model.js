"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistModel = void 0;
const mongoose_1 = require("mongoose");
const wishlistSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    packages: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Package',
        },
    ],
}, { timestamps: true });
exports.WishlistModel = (0, mongoose_1.model)('Wishlist', wishlistSchema);
