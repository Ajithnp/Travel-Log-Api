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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../errors/AppError");
const messages_1 = require("../shared/constants/messages");
const http_status_code_1 = require("../shared/constants/http_status_code");
let AuthService = class AuthService {
    constructor(_userRepository, _passwordBcrypt, _tokenService, _googleService, _otpService) {
        this._userRepository = _userRepository;
        this._passwordBcrypt = _passwordBcrypt;
        this._tokenService = _tokenService;
        this._googleService = _googleService;
        this._otpService = _otpService;
    }
    loginUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = payload;
            const user = yield this._userRepository.findOne({ email });
            if (!user) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (user.isBlocked) {
                throw new AppError_1.AppError(`${messages_1.ERROR_MESSAGES.ACCOUNT_BLOCKED} 
           Reason: ${user.blockedReason}`, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            }
            const isPasswordMatch = yield this._passwordBcrypt.comparePassword(password, user.password);
            if (!isPasswordMatch) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PASSWORD_DO_NOT_MATCH, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!user.isEmailVerified) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VERIFY_YOUR_EMAIL, http_status_code_1.HTTP_STATUS.BAD_REQUEST, 'EMAIL_NOT_VERIFIED');
            }
            //Genarate Tokens
            const accessToken = this._tokenService.generateAccessToken({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            });
            const refreshToken = this._tokenService.generateRefreshToken({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            });
            const response = {
                accessToken,
                refreshToken,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailverified: user.isEmailVerified,
                },
            };
            return response;
        });
    }
    //=============================================================================
    registerUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, phone, password, role } = payload;
            const isUserExisting = yield this._userRepository.findOne({ email });
            if (isUserExisting) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const hashedPassword = yield this._passwordBcrypt.hashPassword(password);
            const newUser = yield this._userRepository.create({
                name,
                email,
                phone,
                password: hashedPassword,
                role,
            });
            const { otpExpiresIn, serverTime } = yield this._otpService.sendOtp(email);
            const response = {
                email: newUser.email,
                role: newUser.role,
                otpExpiresIn,
                serverTime,
            };
            return response;
        });
    }
    //===================================================================================
    emailVerify(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = payload;
            const userDoc = yield this._userRepository.findOne({ email });
            if (!userDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OTP_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (userDoc.isEmailVerified) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED, http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            console.log('service layer', payload);
            yield this._otpService.verifyOtp(payload);
            const newUserDoc = yield this._userRepository.findOneAndUpdate({ email }, { isEmailVerified: true });
            if (!newUserDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            // generate Tokens
            const accessToken = this._tokenService.generateAccessToken({
                id: userDoc._id.toString(),
                email: email,
                name: userDoc.name,
                role: userDoc.role,
            });
            const refreshToken = this._tokenService.generateRefreshToken({
                id: userDoc._id.toString(),
                email: email,
                name: userDoc.name,
                role: userDoc.role,
            });
            const response = {
                accessToken,
                refreshToken,
                user: {
                    name: userDoc.name,
                    email: userDoc.email,
                    role: userDoc.role,
                },
            };
            return response;
        });
    }
    //===================================================================================
    googleAuthentication(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, clientId } = payload;
            let isNewUser = false;
            const userData = yield this._googleService.getUserInfoFromAccessToken(token, clientId);
            // Check if the user already exists in the database
            let user = yield this._userRepository.findOne({ email: userData.email });
            if (!user) {
                isNewUser = true;
                user = yield this._userRepository.create({
                    name: userData.name,
                    email: userData.email,
                    googleId: userData.googleId,
                    isEmailVerified: true,
                    authProvider: 'google',
                });
            }
            if (user.isBlocked) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.ACCOUNT_BLOCKED, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            }
            // token generation
            const accessToken = this._tokenService.generateAccessToken({
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            });
            const refreshToken = this._tokenService.generateRefreshToken({
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            });
            const response = {
                accessToken,
                refreshToken,
                isNewUser,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            };
            return response;
        });
    }
    //===================================================================================
    forgotPassword(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = payload;
            const isUserEmailExist = yield this._userRepository.findOne({ email });
            if (!isUserEmailExist) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!isUserEmailExist.isEmailVerified) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNVALIDATED_EMAIL, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            }
            if (isUserEmailExist.isBlocked) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.ACCOUNT_BLOCKED, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            }
            if (isUserEmailExist.authProvider === 'google') {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.GOOGLE_AUTH_FORGOT_PASSWORD, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const { otpExpiresIn, serverTime } = yield this._otpService.sendOtp(email);
            const response = {
                email: isUserEmailExist.email,
                role: isUserEmailExist.role,
                otpExpiresIn,
                serverTime,
            };
            return response;
        });
    }
    //=======================================================================================
    changePassword(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = payload;
            const userDoc = yield this._userRepository.findOne({ email });
            if (!userDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!userDoc.isEmailVerified) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNVALIDATED_EMAIL, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (userDoc.isBlocked) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.ACCOUNT_BLOCKED, http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            const newHashedPassword = yield this._passwordBcrypt.hashPassword(password);
            const userDocUpdated = yield this._userRepository.findOneAndUpdate({ email }, { password: newHashedPassword });
            if (!userDocUpdated) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    //=======================================================================================
    refreshAccessToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = payload;
            const decoded = this._tokenService.verifyRefreshToken(refreshToken);
            if (!decoded) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.AUTH_INVALID_TOKEN, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
            const accessToken = this._tokenService.generateAccessToken({
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
            });
            const response = {
                accessToken,
            };
            return response;
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('IBcryptUtils')),
    __param(2, (0, tsyringe_1.inject)('ITokenService')),
    __param(3, (0, tsyringe_1.inject)('IGoogleService')),
    __param(4, (0, tsyringe_1.inject)('IOtpService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AuthService);
//=================================================================================
