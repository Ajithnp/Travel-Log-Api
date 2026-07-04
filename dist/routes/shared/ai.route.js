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
exports.AIRoutes = void 0;
const tsyringe_1 = require("tsyringe");
const aurhorization_middleware_1 = require("../../middlewares/aurhorization.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_dto_middleware_1 = require("../../middlewares/validate.dto.middleware");
const base_route_1 = __importDefault(require("../base.route"));
const roles_1 = require("../../shared/constants/roles");
const chatbot_query_validation_1 = require("../../validators/chatbot-query.validation");
let AIRoutes = class AIRoutes extends base_route_1.default {
    constructor(_aiController) {
        super();
        this._aiController = _aiController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this._router.post('/ask', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), (0, validate_dto_middleware_1.validateDTO)(chatbot_query_validation_1.chatbotQueryRequestSchema), this._aiController.askChatbot.bind(this._aiController));
        this._router.get('/packages/recommendations', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._aiController.getRecommendedPackages.bind(this._aiController));
    }
};
exports.AIRoutes = AIRoutes;
exports.AIRoutes = AIRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAIController')),
    __metadata("design:paramtypes", [Object])
], AIRoutes);
