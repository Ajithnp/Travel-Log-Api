"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorVerificationService = void 0;
const tsyringe_1 = require("tsyringe");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const vendor_verfication_status_enum_1 = require("../../types/enum/vendor-verfication-status.enum");
const AppError_1 = require("../../errors/AppError");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const vendor_verification_mapper_1 = require("../../shared/mappers/vendor-verification.mapper");
const logger_1 = __importDefault(require("../../config/logger"));
const roles_1 = require("../../shared/constants/roles");
const constants_1 = require("../../shared/constants/constants");
const notification_emitter_1 = require("../../infrastructure/socket/namespaces/notification-emitter");
let VendorVerificationService = class VendorVerificationService {
    constructor(_vendorInfoRepository, _userRepository) {
        this._vendorInfoRepository = _vendorInfoRepository;
        this._userRepository = _userRepository;
    }
    vendorVerificationSubmit(vendorId, verificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingDoc = yield this._vendorInfoRepository.findOne({
                userId: (0, objectId_helper_1.toObjectId)(vendorId),
            });
            if ((existingDoc === null || existingDoc === void 0 ? void 0 : existingDoc.status) === vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.APPROVED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_VERIFICARION_STATUS_APPROVED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if ((existingDoc === null || existingDoc === void 0 ? void 0 : existingDoc.status) === vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.PENDING) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_VERIFICATION_STATUS_PENDING, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const documents = this._mapFilesToDocuments(verificationData.files);
            const payload = {
                userId: (0, objectId_helper_1.toObjectId)(vendorId),
                businessInfo: {
                    GSTIN: verificationData.gstin,
                    businessAddress: verificationData.businessAddress,
                    contactPersonName: verificationData.ownerName,
                    bio: verificationData.bio,
                },
                bankDetails: {
                    accountHolderName: verificationData.accountHolderName,
                    accountNumber: verificationData.accountNumber,
                    bankName: verificationData.bankName,
                    branch: verificationData.branch,
                    ifsc: verificationData.ifsc,
                },
                documents: Object.assign({}, documents),
                status: vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.UNDER_REVIEW,
            };
            const vendorDoc = yield this._vendorInfoRepository.create(payload);
            const admin = yield this._userRepository.findOne({ role: roles_1.USER_ROLES.ADMIN });
            if (!admin) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            yield this._userRepository.findByIdAndAddUnreadTabs(admin._id.toString(), constants_1.ADMIN_TABS.VENDOR_VERIFICATION);
            try {
                notification_emitter_1.notificationEmitter.setUnreadTabs(admin._id.toString(), constants_1.ADMIN_TABS.VENDOR_VERIFICATION);
            }
            catch (error) {
                logger_1.default.error('[VendorVerificationService] Error notifying admin:', error);
            }
            return {
                isProfileVerified: vendorDoc.isProfileVerified,
            };
        });
    }
    getRejectedVendor(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield this._vendorInfoRepository.findOne({
                userId: (0, objectId_helper_1.toObjectId)(vendorId),
                status: vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.REJECTED,
            });
            if (!vendor) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            return vendor_verification_mapper_1.VendorverificationMapper.toVendorRejectedResponse(vendor);
        });
    }
    vendorVerificationReapply(vendorId, vendorInfoId, verificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingDoc = yield this._vendorInfoRepository.findOne({
                _id: (0, objectId_helper_1.toObjectId)(vendorInfoId),
                userId: (0, objectId_helper_1.toObjectId)(vendorId),
            });
            if (!existingDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (existingDoc.status !== vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.REJECTED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_REAPPLY_NOT_ALLOWED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const replacedDocuments = this._mapFilesToDocuments(verificationData.files);
            const mergedDocuments = Object.assign(Object.assign({}, existingDoc.documents), replacedDocuments);
            existingDoc.set({
                businessInfo: {
                    GSTIN: verificationData.gstin,
                    businessAddress: verificationData.businessAddress,
                    contactPersonName: verificationData.ownerName,
                    bio: verificationData.bio,
                },
                bankDetails: {
                    accountHolderName: verificationData.accountHolderName,
                    accountNumber: verificationData.accountNumber,
                    bankName: verificationData.bankName,
                    branch: verificationData.branch,
                    ifsc: verificationData.ifsc,
                },
                documents: mergedDocuments,
                status: vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.UNDER_REVIEW,
                reasonForReject: '',
            });
            yield existingDoc.save();
            return { isProfileVerified: existingDoc.isProfileVerified };
        });
    }
    _mapFilesToDocuments(files) {
        const fieldMap = {
            businessLicence: 'businessLicence',
            businessPan: 'businessPan',
            companyLogo: 'profileLogo',
            ownerIdentityProof: 'ownerIdentity',
        };
        const documents = {};
        for (const file of files) {
            const docField = fieldMap[file.fieldName];
            if (docField) {
                documents[docField] = { key: file.key, fieldName: file.fieldName };
            }
        }
        return documents;
    }
};
exports.VendorVerificationService = VendorVerificationService;
exports.VendorVerificationService = VendorVerificationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(1, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object])
], VendorVerificationService);
