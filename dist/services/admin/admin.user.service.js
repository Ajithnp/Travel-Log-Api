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
exports.AdminUserService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const mongoose_1 = __importDefault(require("mongoose"));
const policy_refund_calculator_1 = require("../../shared/utils/cancellation-policy/policy-refund-calculator");
const booking_mapper_1 = require("../../shared/mappers/booking.mapper");
const booking_1 = require("../../shared/constants/booking");
const roles_1 = require("../../shared/constants/roles");
const notification_entity_1 = require("../../types/entities/notification.entity");
const logger_1 = __importDefault(require("../../config/logger"));
const wallet_1 = require("../../shared/constants/wallet");
const chat_emitter_1 = require("../../infrastructure/socket/namespaces/chat-emitter");
let AdminUserService = class AdminUserService {
    constructor(_userRepository, _tokenService, _bookingRepository, _notificationService, _walletRepository, _walletTransactionRepository, _schedulePackageRepository, _chatRepository) {
        this._userRepository = _userRepository;
        this._tokenService = _tokenService;
        this._bookingRepository = _bookingRepository;
        this._notificationService = _notificationService;
        this._walletRepository = _walletRepository;
        this._walletTransactionRepository = _walletTransactionRepository;
        this._schedulePackageRepository = _schedulePackageRepository;
        this._chatRepository = _chatRepository;
    }
    fetchUsers(page, limit, role, search, selectedFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const query = { role };
            if (search && search.trim() !== '') {
                query.name = { $regex: search, $options: 'i' };
            }
            if (selectedFilter === 'active')
                query.isBlocked = false;
            if (selectedFilter === 'blocked')
                query.isBlocked = true;
            const [usersDoc, totalDocs] = yield Promise.all([
                this._userRepository.findAll(query, { skip, limit, sort: { createdAt: -1 } }),
                this._userRepository.countDocuments(query),
            ]);
            const userData = usersDoc.map((user) => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt.toDateString(),
            }));
            return {
                data: userData,
                currentPage: page,
                totalPages: Math.ceil(totalDocs / limit),
                totalDocs,
            };
        });
    }
    updateUserAccess(id, block, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDoc = yield this._userRepository.findById(id);
            if (!userDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const userUpdatedDoc = yield this._userRepository.findByIdAndUpdate(id, {
                isBlocked: block,
                blockedReason: block === true ? reason : '',
            });
            if (!userUpdatedDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            // if (block && accessToken) {
            //   blacklistToken(accessToken);
            // }
        });
    }
    getCancellationRequests(page, limit, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._bookingRepository.getCancellationRequests(page, limit, status);
            return {
                data: result.requests.map((request) => (Object.assign(Object.assign({}, request), { _id: request._id.toString() }))),
                currentPage: page,
                totalPages: Math.ceil(result.total / limit),
                totalDocs: result.total,
            };
        });
    }
    getCancellationRequestDetails(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepository.getCancellationRequestById(bookingId);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_REQUEST_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const mapped = booking_mapper_1.BookingMapper.toCancellationRequestDetails(booking);
            let calculation = null;
            const policy = mapped.cancellationPolicy;
            if (policy && mapped.startDate && mapped.finalAmount) {
                calculation = (0, policy_refund_calculator_1.computeRefundBreakdown)(mapped.finalAmount, policy, new Date(mapped.startDate), mapped.cancelledAt || new Date());
            }
            return {
                bookingId: mapped.bookingId,
                bookingCode: mapped.bookingCode,
                userName: mapped.userName,
                email: mapped.email,
                phoneNo: mapped.phoneNo,
                vendorName: mapped.vendorName,
                startDate: mapped.startDate,
                packageName: mapped.packageName,
                cancellationPolicyLabel: (policy === null || policy === void 0 ? void 0 : policy.label) || '',
                rules: (policy === null || policy === void 0 ? void 0 : policy.rules) || [],
                travelersCount: mapped.travelersCount,
                groupType: mapped.groupType,
                cancellationReason: mapped.cancellationReason,
                cancellationStatus: booking.cancellationStatus || booking_1.CANCELATION_STATUS.PENDING,
                cancellationRejectedReason: mapped.cancellationRejectedReason,
                updatedAt: mapped.updatedAt,
                finalAmount: mapped.finalAmount,
                cancellationRefundAmount: mapped.cancellationRefundAmount,
                calculation,
            };
        });
    }
    rejectCancellationRequest(bookingId, userId, rejectedReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepository.getCancellationRequestById(bookingId);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_REQUEST_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (booking.cancellationStatus !== booking_1.CANCELATION_STATUS.PENDING) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_REQUEST_ALREADY_PROCESSED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const updatedBooking = yield this._bookingRepository.findOneAndUpdateReject(bookingId, rejectedReason);
            if (!updatedBooking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            try {
                yield Promise.all([
                    this._notificationService.createNotification({
                        recipientId: booking.userId._id.toString(),
                        recipientRole: roles_1.USER_ROLES.USER,
                        senderId: userId.toString(),
                        notificationType: notification_entity_1.AdminNotificationType.RejectedCancellation,
                        title: messages_1.NOTIFICATION_TITLES.CANCELLATION_REJECETD,
                        message: messages_1.NOTIFICATION_MESSAGES.CANCELLATION_REJECTED(booking.packageId.title, rejectedReason),
                        data: {
                            bookingUId: booking._id.toString(),
                            bookingId: booking.bookingCode,
                            packageName: booking.packageId.title,
                        },
                        redirectUrl: messages_1.REDIRECT_URL.USER_BOOKING_DETAILS(booking._id.toString()),
                    }),
                    this._notificationService.createNotification({
                        recipientId: booking.vendorId._id.toString(),
                        recipientRole: roles_1.USER_ROLES.VENDOR,
                        senderId: userId.toString(),
                        notificationType: notification_entity_1.AdminNotificationType.RejectedCancellation,
                        title: messages_1.NOTIFICATION_TITLES.USER_CANCELLELATION_REJECETED,
                        message: messages_1.NOTIFICATION_MESSAGES.USER_CANCELLATION_REJECTED(booking.packageId.title, rejectedReason),
                        data: {
                            bookingUId: booking._id.toString(),
                            bookingId: booking.bookingCode,
                            scheduleId: booking.scheduleId._id.toString(),
                            packageName: booking.packageId.title,
                        },
                        redirectUrl: messages_1.REDIRECT_URL.USER_BOOKING_DETAILS(booking._id.toString()),
                    }),
                ]);
            }
            catch (error) {
                logger_1.default.error({
                    error,
                });
            }
        });
    }
    approveCancellationRequest(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            let chatRoom = null;
            try {
                const booking = yield this._bookingRepository.findBookingWithSession(bookingId, session);
                if (!booking) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_REQUEST_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
                }
                if (booking.cancellationStatus !== booking_1.CANCELATION_STATUS.PENDING &&
                    booking.bookingStatus !== booking_1.BOOKING_STATUS.CONFIRMED) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_REQUEST_ALREADY_PROCESSED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updated = yield this._bookingRepository.updateBookingWithSession(bookingId, {
                    cancellationStatus: booking_1.CANCELATION_STATUS.APPROVED,
                    bookingStatus: booking_1.BOOKING_STATUS.CANCELLED_BY_USER,
                }, session);
                if (!updated) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                const refundAmount = booking.cancelationRefundAmount || 0;
                if (refundAmount > 0) {
                    let wallet = yield this._walletRepository.findWalletByUserId(booking.userId.toString(), session);
                    if (!wallet) {
                        wallet = yield this._walletRepository.createWallet(booking.userId.toString(), session);
                    }
                    yield this._walletRepository.incrementBalance(booking.userId.toString(), refundAmount, session);
                    const transactionData = {
                        walletId: wallet._id,
                        userId: booking.userId,
                        bookingId: booking._id,
                        type: wallet_1.TRANSACTION_TYPE.CREDIT,
                        amount: refundAmount,
                        status: wallet_1.TRANSACTION_STATUS.SUCCESS,
                        description: `Refund for cancelled booking ${booking.bookingCode}`,
                    };
                    yield this._walletTransactionRepository.createTransaction(transactionData, session);
                }
                yield this._schedulePackageRepository.cancelSeats(booking.scheduleId.toString(), booking.travelerCount, session);
                chatRoom = yield this._chatRepository.findChatRoomByScheduleId(booking.scheduleId, session);
                if (chatRoom) {
                    yield this._chatRepository.deactivateMember(chatRoom._id.toString(), booking.userId.toString(), session);
                }
                yield session.commitTransaction();
                session.endSession();
                if (chatRoom) {
                    try {
                        chat_emitter_1.chatEmitter.sendRoomUpdated(chatRoom._id.toString(), {
                            chatId: chatRoom._id.toString(),
                            blockedUserId: booking.userId.toString(),
                        });
                    }
                    catch (emitError) {
                        logger_1.default.error({ error: emitError });
                    }
                }
                try {
                    yield this._notificationService.createNotification({
                        recipientId: booking.userId.toString(),
                        recipientRole: roles_1.USER_ROLES.USER,
                        senderId: null,
                        notificationType: notification_entity_1.UserNotificationType.RefundProcessed,
                        title: messages_1.NOTIFICATION_TITLES.CANCELLATION_REQUEST_APPROVED,
                        message: messages_1.NOTIFICATION_MESSAGES.CANCELLATION_REQUEST_APPROVED(booking.packageId.title, refundAmount),
                        data: {
                            bookingUId: booking._id.toString(),
                            bookingId: booking.bookingCode,
                            packageName: booking.packageId.title,
                            refundAmount: String(refundAmount),
                        },
                        redirectUrl: messages_1.REDIRECT_URL.USER_BOOKING_DETAILS(booking._id.toString()),
                    });
                }
                catch (notificationError) {
                    logger_1.default.error({ error: notificationError });
                }
            }
            catch (error) {
                logger_1.default.error({ error });
                yield session.abortTransaction();
                session.endSession();
                if (error instanceof AppError_1.AppError) {
                    throw error;
                }
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.AdminUserService = AdminUserService;
exports.AdminUserService = AdminUserService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('ITokenService')),
    __param(2, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(3, (0, tsyringe_1.inject)('INotificationService')),
    __param(4, (0, tsyringe_1.inject)('IWalletRepository')),
    __param(5, (0, tsyringe_1.inject)('IWalletTransactionRepository')),
    __param(6, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(7, (0, tsyringe_1.inject)('IChatRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], AdminUserService);
