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
exports.ShedulePackageController = void 0;
const tsyringe_1 = require("tsyringe");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const pagination_helper_1 = require("../../shared/utils/pagination.helper");
let ShedulePackageController = class ShedulePackageController {
    constructor(_shedulePackageService) {
        this._shedulePackageService = _shedulePackageService;
        this.createSchedule = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const packageId = req.params.packageId;
            const payload = Object.assign(Object.assign({}, req.body), { packageId });
            yield this._shedulePackageService.createSchedule(vendorId, payload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.SCHEDULE_CREATED_SUCCESSFULLY,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        this.fetchSchedules = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const { page, limit, search, selectedFilter } = (0, pagination_helper_1.getPaginationOptions)(req);
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const filters = {
                selectedFilter,
                search,
                page,
                limit,
                startDate,
                endDate,
            };
            const result = yield this._shedulePackageService.fetchVendorSchedules(vendorId, filters);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.SCHEDULE_CREATED_SUCCESSFULLY,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getSchedule = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const scheduleId = req.params.scheduleId;
            const schedule = yield this._shedulePackageService.getSchedule(scheduleId, vendorId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: schedule,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getVendorScheduleBookingSummary = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const scheduleId = req.params.scheduleId;
            const summary = yield this._shedulePackageService.getVendorScheduleBookingSummary(scheduleId, vendorId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: summary,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getScheduleBookings = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const scheduleId = req.params.scheduleId;
            const { page, limit, search } = (0, pagination_helper_1.getPaginationOptions)(req);
            const filter = req.query.filter;
            const bookings = yield this._shedulePackageService.getScheduleBookings(scheduleId, vendorId, page, limit, search, filter);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: bookings,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getScheduleBookingDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const scheduleId = req.params.scheduleId;
            const bookingId = req.params.bookingId;
            const bookingDetails = yield this._shedulePackageService.getScheduleBookingDetails(scheduleId, bookingId, vendorId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: bookingDetails,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.updateScheduleStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const scheduleId = req.params.scheduleId;
            const { status } = req.body;
            const result = yield this._shedulePackageService.updateScheduleStatus(scheduleId, vendorId, status);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.SCHEDULE_STATUS_UPDATED_SUCCESSFULLY,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.ShedulePackageController = ShedulePackageController;
exports.ShedulePackageController = ShedulePackageController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ISchedulePackageService')),
    __metadata("design:paramtypes", [Object])
], ShedulePackageController);
