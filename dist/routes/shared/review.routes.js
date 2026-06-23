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
exports.ReviewRoutes = void 0;
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const base_route_1 = __importDefault(require("../base.route"));
const tsyringe_1 = require("tsyringe");
const aurhorization_middleware_1 = require("../../middlewares/aurhorization.middleware");
const roles_1 = require("../../shared/constants/roles");
const validate_dto_middleware_1 = require("../../middlewares/validate.dto.middleware");
const review_validation_schema_1 = require("../../validators/review.validation.schema");
let ReviewRoutes = class ReviewRoutes extends base_route_1.default {
    constructor(_reviewController) {
        super();
        this._reviewController = _reviewController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this._router.post('/', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), (0, validate_dto_middleware_1.validateDTO)(review_validation_schema_1.createReviewSchema), this._reviewController.addReview.bind(this._reviewController));
        this._router.delete('/:reviewId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._reviewController.deleteReview.bind(this._reviewController));
        this._router.get('/public/:packageId', auth_middleware_1.optionalAuth, this._reviewController.getPackagePublicReviews.bind(this._reviewController));
        this._router.get('/stats/:packageId', this._reviewController.getPackageReviewsStats.bind(this._reviewController));
    }
};
exports.ReviewRoutes = ReviewRoutes;
exports.ReviewRoutes = ReviewRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IReviewController')),
    __metadata("design:paramtypes", [Object])
], ReviewRoutes);
