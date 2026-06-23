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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const tsyringe_1 = require("tsyringe");
const jwt_token_1 = require("../shared/constants/jwt.token");
let TokenService = class TokenService {
    constructor() {
        this._accessSecret = env_1.config.jwt.ACCESS_TOKEN_SECRET;
        this._refreshSecret = env_1.config.jwt.REFRESH_TOKEN_SECRET;
    }
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this._accessSecret, { expiresIn: jwt_token_1.JWT_TOKEN.ACCESS_TOKEN_EXPIRY });
    }
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this._refreshSecret, { expiresIn: jwt_token_1.JWT_TOKEN.REFRESH_TOKEN_EXPIRY });
    }
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this._accessSecret);
            if (!decoded || typeof decoded === 'string')
                return null;
            return decoded;
        }
        catch (_a) {
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this._refreshSecret);
            if (!decoded || typeof decoded === 'string')
                return null;
            return decoded;
        }
        catch (_a) {
            return null;
        }
    }
    decodeToken(token) {
        try {
            const decodedToken = jsonwebtoken_1.default.decode(token);
            if (!decodedToken || typeof decodedToken === 'string')
                return null;
            return decodedToken;
        }
        catch (_a) {
            return null;
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], TokenService);
