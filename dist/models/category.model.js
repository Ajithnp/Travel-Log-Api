"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../shared/constants/constants");
const slug_generator_helper_1 = require("../shared/utils/slug.generator.helper");
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
        default: null,
    },
    icon: {
        key: {
            type: String,
            trim: true,
        },
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: Object.values(constants_1.CATEGORY_STATUS),
        required: true,
        default: constants_1.CATEGORY_STATUS.PENDING,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    requestedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    rejectionReason: {
        type: String,
        trim: true,
        default: null,
    },
    vendorNote: {
        type: String,
        trim: true,
        default: null,
    },
    adminNote: {
        type: String,
        trim: true,
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ status: 1, isActive: 1 });
CategorySchema.index({ requestedBy: 1, status: 1 });
CategorySchema.pre('save', function (next) {
    if (this.isNew || this.isModified('name')) {
        this.slug = (0, slug_generator_helper_1.generateSlug)(this.name);
    }
    next();
});
exports.CategoryModel = mongoose_1.default.model('Category', CategorySchema);
