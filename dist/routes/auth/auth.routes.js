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
exports.AuthRoutes = void 0;
const tsyringe_1 = require("tsyringe");
const base_route_1 = __importDefault(require("../base.route"));
const validate_dto_middleware_1 = require("../../middlewares/validate.dto.middleware");
const request_dtos_1 = require("../../types/dtos/auth/request.dtos");
let AuthRoutes = class AuthRoutes extends base_route_1.default {
    constructor(_authController) {
        super();
        this._authController = _authController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this._router.post('/login', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.LoginRequestSchema), this._authController.loginUser.bind(this._authController));
        this._router.post('/signup', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.SignupRequestSchema), this._authController.registerUser.bind(this._authController));
        this._router.post('/verify-email', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.VerifyEmailRequestSchema), this._authController.verifyEmail.bind(this._authController));
        this._router.post('/resend-otp', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.ResendOtpSchema), this._authController.resendOtp.bind(this._authController));
        this._router.post('/google/callback', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.GoogleAuthRequestSchema), this._authController.googleAuthCallback.bind(this._authController));
        this._router.post('/forgot-password', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.ForgotPasswordSchema), this._authController.forgotPassword.bind(this._authController));
        this._router.post('/otp-verify', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.VerifyOtpSchema), this._authController.verifyOtp.bind(this._authController));
        this._router.post('/change-password', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.ChangePasswordRequestSchema), this._authController.changePassword.bind(this._authController));
        this._router.post('/refresh-token', this._authController.refreshAccessToken.bind(this._authController));
        this._router.post('/logout', this._authController.logout.bind(this._authController));
    }
};
exports.AuthRoutes = AuthRoutes;
exports.AuthRoutes = AuthRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAuthController')),
    __metadata("design:paramtypes", [Object])
], AuthRoutes);
