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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOfferService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const di_tokens_1 = require("../../shared/constants/di.tokens");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const messages_1 = require("../../shared/constants/messages");
let VendorOfferService = class VendorOfferService {
    constructor(_offerRepository, _packageRepository) {
        this._offerRepository = _offerRepository;
        this._packageRepository = _packageRepository;
    }
    createOffer(vendorId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const pkg = yield this._packageRepository.findById(payload.packageId);
            if (!pkg) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!pkg.isActive || pkg.isDeleted) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_ABLE_TO_ADD_OFFER, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (pkg.vendorId.toString() !== vendorId) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            }
            const alreadyHaveActiveOffer = yield this._offerRepository.findOne({
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                packageId: (0, objectId_helper_1.toObjectId)(payload.packageId),
                isActive: true,
            });
            if (alreadyHaveActiveOffer && alreadyHaveActiveOffer.validUntil > new Date()) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.ALREADY_HAVE_ACTIVE_OFFER, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const validUntil = new Date(payload.validUntil);
            yield this._offerRepository.create({
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                packageId: (0, objectId_helper_1.toObjectId)(payload.packageId),
                scheduleId: payload.scheduleId ? (0, objectId_helper_1.toObjectId)(payload.scheduleId) : null,
                name: payload.name,
                discountType: 'percentage',
                discountValue: payload.discountValue,
                usageLimit: payload.usageLimit || undefined,
                validUntil,
                isActive: true,
                usedCount: 0,
            });
        });
    }
    getVendorOffers(vendorId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalActiveOffers, totalInactiveOffers] = yield Promise.all([
                this._offerRepository.countDocuments({ vendorId: (0, objectId_helper_1.toObjectId)(vendorId), isActive: true }),
                this._offerRepository.countDocuments({ vendorId: (0, objectId_helper_1.toObjectId)(vendorId), isActive: false }),
            ]);
            const result = yield this._offerRepository.findVendorOffers(vendorId, query);
            return {
                data: result.data,
                totalDocs: result.totalDocs,
                currentPage: query.page,
                totalPages: Math.ceil(result.totalDocs / query.limit),
                activeCount: totalActiveOffers,
                inactiveCount: totalInactiveOffers,
            };
        });
    }
    deactivateOffer(vendorId, offerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const offer = yield this._offerRepository.findById(offerId);
            if (!offer) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OFFER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (offer.vendorId.toString() !== vendorId) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            }
            if (!offer.isActive) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OFFER_ALREADY_DEACTIVATED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            yield this._offerRepository.findOneAndUpdate({ _id: offer._id }, { isActive: false });
        });
    }
};
exports.VendorOfferService = VendorOfferService;
exports.VendorOfferService = VendorOfferService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(di_tokens_1.REPOSITORY_TOKENS.OFFER_REPOSITORY)),
    __param(1, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __metadata("design:paramtypes", [Object, Object])
], VendorOfferService);
