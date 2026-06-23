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
exports.NotificationRoutes = void 0;
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const base_route_1 = __importDefault(require("../base.route"));
const tsyringe_1 = require("tsyringe");
const aurhorization_middleware_1 = require("../../middlewares/aurhorization.middleware");
const roles_1 = require("../../shared/constants/roles");
let NotificationRoutes = class NotificationRoutes extends base_route_1.default {
    constructor(_notificationController) {
        super();
        this._notificationController = _notificationController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this._router.get('/', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR, roles_1.USER_ROLES.USER, roles_1.USER_ROLES.ADMIN]), this._notificationController.getUserNotifications.bind(this._notificationController));
        this._router.get('/unread-count', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR, roles_1.USER_ROLES.USER, roles_1.USER_ROLES.ADMIN]), this._notificationController.getUnreadCount.bind(this._notificationController));
        this._router.patch('/mark-all-read', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR, roles_1.USER_ROLES.USER, roles_1.USER_ROLES.ADMIN]), this._notificationController.markAllRead.bind(this._notificationController));
        this._router.patch('/:notificationId/mark-read', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR, roles_1.USER_ROLES.USER, roles_1.USER_ROLES.ADMIN]), this._notificationController.markAsRead.bind(this._notificationController));
        this._router.delete('/:notificationId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR, roles_1.USER_ROLES.USER, roles_1.USER_ROLES.ADMIN]), this._notificationController.deleteNotification.bind(this._notificationController));
        this._router.patch('/mark-tabs-read', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR, roles_1.USER_ROLES.ADMIN]), this._notificationController.markTabsAsRead.bind(this._notificationController));
    }
};
exports.NotificationRoutes = NotificationRoutes;
exports.NotificationRoutes = NotificationRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('INotificationController')),
    __metadata("design:paramtypes", [Object])
], NotificationRoutes);
