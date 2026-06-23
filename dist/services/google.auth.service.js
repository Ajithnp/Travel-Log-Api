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
exports.GoogleService = void 0;
const tsyringe_1 = require("tsyringe");
const google_auth_library_1 = require("google-auth-library");
const AppError_1 = require("../errors/AppError");
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
let GoogleService = class GoogleService {
    constructor() {
        this._client = new google_auth_library_1.OAuth2Client();
    }
    getUserInfoFromAccessToken(accessToken, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ticket = yield this._client.verifyIdToken({
                    idToken: accessToken,
                    audience: clientId,
                });
                const payload = ticket.getPayload();
                if (!payload || !payload.sub || !payload.email) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.INVALID_TOKEN, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const response = {
                    googleId: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                };
                return response;
            }
            catch (_a) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FAILED_TO_VERIFY_TOKEN, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
        });
    }
};
exports.GoogleService = GoogleService;
exports.GoogleService = GoogleService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], GoogleService);
