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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const base_route_1 = __importDefault(require("../../routes/base.route"));
const tsyringe_1 = require("tsyringe");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_1 = require("../../shared/constants/roles");
const aurhorization_middleware_1 = require("../../middlewares/aurhorization.middleware");
const validate_dto_middleware_1 = require("../../middlewares/validate.dto.middleware");
const booking_validation_1 = require("../../validators/user/booking.validation");
let BookingRoutes = class BookingRoutes extends base_route_1.default {
    constructor(_bookingController, _documentController) {
        super();
        this._bookingController = _bookingController;
        this._documentController = _documentController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this._router.post('/initiate', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), (0, validate_dto_middleware_1.validateDTO)(booking_validation_1.InitiateBookingRequestSchema), this._bookingController.initiateBooking.bind(this._bookingController));
        this._router.post('/:bookingId/confirm-wallet', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._bookingController.confirmBookingWallet.bind(this._bookingController));
        this._router.post('/:bookingId/retry', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._bookingController.retryBookingPayment.bind(this._bookingController));
        this._router.get('/verify-payment', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._bookingController.verifyPayment.bind(this._bookingController));
        this._router.get('/', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._bookingController.getBookings.bind(this._bookingController));
        this._router.get('/:bookingId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._bookingController.getBookingDetails.bind(this._bookingController));
        this._router.patch('/:bookingId/cancel', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), (0, validate_dto_middleware_1.validateDTO)(booking_validation_1.CancelBookingRequestSchema), this._bookingController.cancelBookingRequest.bind(this._bookingController));
        this._router.get('/:bookingId/ticket', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._documentController.getBookingTicket.bind(this._documentController));
    }
};
exports.BookingRoutes = BookingRoutes;
exports.BookingRoutes = BookingRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBookingController')),
    __param(1, (0, tsyringe_1.inject)('IDocumentController')),
    __metadata("design:paramtypes", [Object, Object])
], BookingRoutes);
