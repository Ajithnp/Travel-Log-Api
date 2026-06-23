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
exports.StripeRoutes = void 0;
const tsyringe_1 = require("tsyringe");
const base_route_1 = __importDefault(require("../../routes/base.route"));
const tsyringe_2 = require("tsyringe");
const di_tokens_1 = require("../../shared/constants/di.tokens");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roles_1 = require("../../shared/constants/roles");
const aurhorization_middleware_1 = require("../../middlewares/aurhorization.middleware");
let StripeRoutes = class StripeRoutes extends base_route_1.default {
    constructor(_stripeController) {
        super();
        this._stripeController = _stripeController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this._router.post('/onboard', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._stripeController.initiateStripeOnboarding.bind(this._stripeController));
        this._router.get('/onboard/status', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._stripeController.getStripeOnboardingStatus.bind(this._stripeController));
    }
};
exports.StripeRoutes = StripeRoutes;
exports.StripeRoutes = StripeRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_2.inject)(di_tokens_1.CONTROLLER_TOKENS.STRIPE_CONTROLLER)),
    __metadata("design:paramtypes", [Object])
], StripeRoutes);
