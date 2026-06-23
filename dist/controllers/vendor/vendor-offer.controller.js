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
exports.VendorOfferController = void 0;
const tsyringe_1 = require("tsyringe");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const di_tokens_1 = require("../../shared/constants/di.tokens");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const pagination_helper_1 = require("../../shared/utils/pagination.helper");
let VendorOfferController = class VendorOfferController {
    constructor(_offerService) {
        this._offerService = _offerService;
        this.createOffer = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            yield this._offerService.createOffer(vendorId, req.body);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OFFER_CREATED_SUCCESSFULLY,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        this.getOffers = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { page, limit, search } = (0, pagination_helper_1.getPaginationOptions)(req);
            const activeFilter = req.query.isActive;
            const isActive = activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined;
            const result = yield this._offerService.getVendorOffers(vendorId, {
                page,
                limit,
                search,
                isActive,
            });
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.deactivateOffer = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const offerId = req.params.offerId;
            yield this._offerService.deactivateOffer(vendorId, offerId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: 'Offer deactivated successfully',
                data: null,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.VendorOfferController = VendorOfferController;
exports.VendorOfferController = VendorOfferController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(di_tokens_1.SERVICE_TOKENS.VENDOR_OFFER_SERVICE)),
    __metadata("design:paramtypes", [Object])
], VendorOfferController);
