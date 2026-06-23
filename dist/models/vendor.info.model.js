"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorInformationModel = void 0;
const mongoose_1 = require("mongoose");
const filesSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    fieldName: { type: String, required: true },
}, { _id: false });
const businessInfoSchema = new mongoose_1.Schema({
    contactPersonName: { type: String, default: null },
    businessAddress: { type: String, default: null },
    GSTIN: { type: String, default: null },
    bio: { type: String, default: null },
}, { _id: false });
const documentsSchema = new mongoose_1.Schema({
    businessLicence: { type: filesSchema, default: null },
    profileLogo: { type: filesSchema, default: null },
    businessPan: { type: filesSchema, default: null },
    ownerIdentity: { type: filesSchema, default: null },
}, { _id: false });
const bankDetailsSchema = new mongoose_1.Schema({
    accountNumber: { type: String, default: null },
    ifsc: { type: String, default: null },
    accountHolderName: { type: String, default: null },
    bankName: { type: String, default: null },
    branch: { type: String, default: null },
}, { _id: false });
const stripeConnectSchema = new mongoose_1.Schema({
    accountId: { type: String, default: null },
    onboardingComplete: { type: Boolean, default: false },
    chargesEnabled: { type: Boolean, default: false },
    payoutsEnabled: { type: Boolean, default: false },
}, { _id: false });
const vendorInfoSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    businessInfo: { type: businessInfoSchema, default: () => ({}) },
    documents: { type: documentsSchema, default: () => ({}) },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },
    transactionConnect: { type: stripeConnectSchema, default: () => ({}) },
    status: {
        type: String,
        enum: ['Pending', 'UnderReview', 'Approved', 'Rejected', 'Suspended'],
        default: 'Pending',
    },
    reasonForReject: { type: String, default: null },
    isProfileVerified: { type: Boolean, default: false },
}, { timestamps: true });
exports.VendorInformationModel = (0, mongoose_1.model)('VendorInfo', vendorInfoSchema);
