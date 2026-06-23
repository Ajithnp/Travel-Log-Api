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
exports.BookingController = void 0;
const tsyringe_1 = require("tsyringe");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const pagination_helper_1 = require("../../shared/utils/pagination.helper");
let BookingController = class BookingController {
    constructor(_bookingService) {
        this._bookingService = _bookingService;
        this.initiateBooking = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { packageId, scheduleId, tierType, seatsCount, travelers, useWallet, amountInPaise, offerId, offerDiscount, } = req.body;
            const payload = {
                userId,
                packageId,
                scheduleId,
                tierType,
                seatsCount,
                useWallet,
                travelers,
                amountInPaise,
                offerId,
                offerDiscount,
            };
            const result = yield this._bookingService.initiateBooking(payload);
            const response = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.SEATS_HELD_SUCCESS,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(response);
        }));
        this.confirmBookingWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { bookingId } = req.params;
            const payload = {
                userId,
                bookingId,
            };
            const result = yield this._bookingService.confirmBooking(payload);
            const response = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.BOOKING_CONFIRMED,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(response);
        }));
        this.verifyPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { session_id } = req.query;
            const result = yield this._bookingService.verifyPayment(session_id);
            const response = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: result.status === 'success'
                    ? messages_1.SUCCESS_MESSAGES.PAYMENT_VERIFIED
                    : messages_1.SUCCESS_MESSAGES.PAYMENT_VERIFICATION_FAILED,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(response);
        }));
        this.retryBookingPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { bookingId } = req.params;
            const payload = {
                userId,
                bookingId,
            };
            const result = yield this._bookingService.retryBookingPayment(payload);
            const response = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.BOOKING_CONFIRMED,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(response);
        }));
        this.getBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            const { search, page, limit, selectedFilter } = (0, pagination_helper_1.getPaginationOptions)(req);
            const payload = {
                search,
                page,
                limit,
                bookingStatus: selectedFilter,
            };
            const result = yield this._bookingService.getBookings(userId, payload);
            const response = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(response);
        }));
        this.getBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const userId = req.user.id;
            const result = yield this._bookingService.getBookingDetails(userId, bookingId);
            const response = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(response);
        }));
        this.cancelBookingRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const userId = req.user.id;
            const { reason, details } = req.body;
            const payload = {
                userId,
                bookingId,
                reason,
                details,
            };
            const result = yield this._bookingService.cancelBookingRequest(payload);
            const response = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.BOOKING_CANCELLED,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(response);
        }));
    }
};
exports.BookingController = BookingController;
exports.BookingController = BookingController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBookingService')),
    __metadata("design:paramtypes", [Object])
], BookingController);
