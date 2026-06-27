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
exports.BookingService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const constants_1 = require("../../shared/constants/constants");
const messages_1 = require("../../shared/constants/messages");
const schedule_status_1 = require("../../shared/constants/schedule-status");
const platform_1 = require("../../shared/constants/platform");
const mongoose_1 = __importDefault(require("mongoose"));
const booking_1 = require("../../shared/constants/booking");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const generate_booking_code_helper_1 = require("../../shared/utils/generate-booking-code.helper");
const booking_mapper_1 = require("../../shared/mappers/booking.mapper");
const notification_entity_1 = require("../../types/entities/notification.entity");
const roles_1 = require("../../shared/constants/roles");
const chat_name_builder_1 = require("../../shared/utils/chat-name-builder");
const policy_refund_calculator_1 = require("../../shared/utils/cancellation-policy/policy-refund-calculator");
const get_days_left_1 = require("../../shared/utils/cancellation-policy/get-days-left");
const payment_split_calculator_1 = require("../../shared/utils/booking/payment-split-calculator");
const validate_booking_date_1 = require("../../shared/utils/booking/validate-booking-date");
const logger_1 = __importDefault(require("../../config/logger"));
const retry_payment_validate_1 = require("../../shared/utils/booking/retry-payment-validate");
let BookingService = class BookingService {
    constructor(_notificationService, _schedulePackageRepo, _packageRepo, _bookingRepo, paymentGateway, _chatService, _chatRepo, _walletService, _cancellationPolicyRepo, _userRepository, _offerRepository, _vendorInfoRepository) {
        this._notificationService = _notificationService;
        this._schedulePackageRepo = _schedulePackageRepo;
        this._packageRepo = _packageRepo;
        this._bookingRepo = _bookingRepo;
        this.paymentGateway = paymentGateway;
        this._chatService = _chatService;
        this._chatRepo = _chatRepo;
        this._walletService = _walletService;
        this._cancellationPolicyRepo = _cancellationPolicyRepo;
        this._userRepository = _userRepository;
        this._offerRepository = _offerRepository;
        this._vendorInfoRepository = _vendorInfoRepository;
    }
    initiateBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            let session = null;
            try {
                const sheduleId = (0, objectId_helper_1.toObjectId)(payload.scheduleId);
                const schedule = yield this._schedulePackageRepo.findOne({ _id: sheduleId });
                if (!schedule) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
                }
                let offer = { hasOffer: false, offerId: '', offerPercentage: 0 };
                if (payload.offerId && payload.offerDiscount) {
                    const offerEntity = yield this._offerRepository.findById(payload.offerId);
                    validate_booking_date_1.BookingValidator.validateBookingOffer(offerEntity, payload.packageId);
                    offer = {
                        hasOffer: true,
                        offerId: offerEntity._id.toString(),
                        offerPercentage: offerEntity.discountType === 'percentage' ? offerEntity.discountValue : 0,
                    };
                }
                validate_booking_date_1.BookingValidator.validateTripBookingDate(schedule.startDate);
                if (schedule.status !== constants_1.SCHEDULE_STATUS.UPCOMING) {
                    throw new AppError_1.AppError((_a = schedule_status_1.statusMessages[schedule.status]) !== null && _a !== void 0 ? _a : messages_1.ERROR_MESSAGES.SCHEDULE_NOT_AVAILABLE_FOR_BOOKING, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const seatsAvailability = schedule.totalSeats - schedule.seatsBooked;
                if (seatsAvailability < payload.seatsCount) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SEATS_NOT_AVAILABLE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const pkg = yield this._packageRepo.findOne({ _id: schedule.packageId });
                if (!pkg) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
                }
                if (pkg.status !== constants_1.PACKAGE_STATUS.PUBLISHED || !pkg.isActive) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_AVAILABLE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const priceTier = schedule.pricing.find((tier) => tier.type === payload.tierType);
                if (!priceTier) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.INVALID_TIER_TYPE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (priceTier.peopleCount !== payload.seatsCount) {
                    throw new AppError_1.AppError(`Selected tier is for ${priceTier.peopleCount} people, but ${payload.seatsCount} seats were requested.`, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!priceTier.price || priceTier.price <= 0) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.INVALID_GROUP_TYPE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!payload.travelers || payload.travelers.length !== payload.seatsCount) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const leads = payload.travelers.filter((traveler) => traveler.isLead);
                if (leads.length !== 1) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const leadTraveler = leads[0];
                if (!((_b = leadTraveler.phoneNumber) === null || _b === void 0 ? void 0 : _b.trim())) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const existingBooking = yield this._bookingRepo.findActiveBookingByUserAndSchedule(payload.userId, payload.scheduleId);
                if ((existingBooking === null || existingBooking === void 0 ? void 0 : existingBooking.bookingStatus) === booking_1.BOOKING_STATUS.CONFIRMED) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.ALREADY_HAVE_ACTIVE_BOOKING, http_status_code_1.HTTP_STATUS.CONFLICT);
                }
                //  Financial calculation
                const discountAmount = Math.round((priceTier.price * offer.offerPercentage) / 100);
                const walletBalance = payload.useWallet
                    ? (yield this._walletService.getWalletBalance(payload.userId)).balance
                    : 0;
                const split = (0, payment_split_calculator_1.calculatePaymentSplit)(priceTier.price, walletBalance, payload.useWallet);
                const finalAmount = priceTier.price - discountAmount;
                const platformCommission = Math.round(finalAmount * platform_1.PLATFORM_COMMISSION_RATE * 100) / 100;
                const vendorEarning = Math.round((finalAmount - platformCommission) * 100) / 100;
                session = yield mongoose_1.default.startSession();
                session.startTransaction();
                const booking = yield this._bookingRepo.createBooking({
                    userId: new mongoose_1.default.Types.ObjectId(payload.userId),
                    packageId: new mongoose_1.default.Types.ObjectId(payload.packageId),
                    scheduleId: new mongoose_1.default.Types.ObjectId(payload.scheduleId),
                    vendorId: schedule.vendorId,
                    bookingCode: (0, generate_booking_code_helper_1.generateBookingCode)(),
                    groupType: payload.tierType,
                    travelerCount: payload.seatsCount,
                    travelers: payload.travelers.map((traveler) => (Object.assign({}, traveler))),
                    grossAmount: priceTier.price,
                    discountAmount,
                    walletAmountUsed: split.walletAmount,
                    finalAmount,
                    offerId: offer.offerId ? (0, objectId_helper_1.toObjectId)(offer.offerId) : null,
                    platformCommission: Math.round(platformCommission),
                    vendorEarning: Math.round(vendorEarning),
                    paymentMethod: split.method,
                    paymentStatus: booking_1.PAYMENT_STATUS.PENDING,
                    bookingStatus: booking_1.BOOKING_STATUS.PENDING,
                }, session);
                yield session.commitTransaction();
                yield session.endSession();
                session = null;
                //  Create payment intent
                if (split.method === booking_1.PAYMENT_METHOD.WALLET) {
                    return {
                        bookingId: booking._id.toString(),
                        paymentMethod: booking_1.PAYMENT_METHOD.WALLET,
                        walletAmountUsed: split.walletAmount,
                        stripeAmount: 0,
                    };
                }
                try {
                    const payment = yield this.paymentGateway.createPaymentIntent({
                        amount: split.walletAmount ? split.stripeAmount : finalAmount,
                        currency: 'inr',
                        bookingId: booking._id.toString(),
                        bookingCode: booking.bookingCode,
                        metadata: {
                            userId: payload.userId,
                            scheduleId: payload.scheduleId,
                            tierType: payload.tierType,
                            walletAmountUsed: String(split.walletAmount),
                            seatsCount: String(payload.seatsCount),
                            startDate: (_d = (_c = schedule.startDate) === null || _c === void 0 ? void 0 : _c.toISOString().split('T')[0]) !== null && _d !== void 0 ? _d : '',
                            endDate: (_f = (_e = schedule.endDate) === null || _e === void 0 ? void 0 : _e.toISOString().split('T')[0]) !== null && _f !== void 0 ? _f : '',
                            packageName: (_g = pkg.title) !== null && _g !== void 0 ? _g : '',
                        },
                    });
                    yield this._bookingRepo.attachPaymentIntent(booking._id.toString(), payment.gatewayPaymentId);
                    return {
                        clientSecret: payment.clientSecret,
                        bookingId: booking._id.toString(),
                        paymentMethod: split.method,
                        walletAmountUsed: split.walletAmount,
                        stripeAmount: split.stripeAmount,
                        checkoutUrl: payment.url || undefined,
                    };
                }
                catch (_h) {
                    yield this._bookingRepo.markFailedPayment(booking._id.toString());
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PAYMENT_CONFIRMATION_FAILED, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
            }
            catch (error) {
                if (session) {
                    try {
                        yield session.abortTransaction();
                    }
                    catch (error) {
                        logger_1.default.error('rolling back transaction in booking.service.ts', error);
                    }
                    yield session.endSession();
                }
                throw error;
            }
        });
    }
    confirmBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const booking = yield this._bookingRepo.findByIdAndUserLean(payload.bookingId, payload.userId);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (booking.bookingStatus === booking_1.BOOKING_STATUS.CONFIRMED) {
                return {
                    bookingId: booking._id.toString(),
                    amount: booking.finalAmount,
                    bookingCode: booking.bookingCode,
                    message: messages_1.SUCCESS_MESSAGES.BOOKING_ALREADY_CONFIRMED,
                };
            }
            const schedule = yield this._schedulePackageRepo.findById(booking.scheduleId.toString());
            if (!schedule) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const seatsAvailability = schedule.totalSeats - schedule.seatsBooked;
            if (seatsAvailability < booking.travelerCount) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SEATS_NOT_AVAILABLE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                if (booking.walletAmountUsed > 0) {
                    yield this._walletService.deductBalance(payload.userId, booking.walletAmountUsed, `Wallet used for booking #${booking.bookingCode}`, session, booking._id.toString());
                }
                const updatedBooking = yield this._bookingRepo.confirmBooking(payload.userId.toString(), payload.bookingId.toString(), payload.stripePaymentIntentId, session);
                const updatedSchedule = yield this._schedulePackageRepo.confirmSeats(booking.scheduleId.toString(), booking.travelerCount, session);
                if (!updatedSchedule) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
                }
                if (updatedSchedule.totalSeats - updatedSchedule.seatsBooked === 0) {
                    yield this._schedulePackageRepo.updateScheduleStatus(updatedSchedule._id.toString(), constants_1.SCHEDULE_STATUS.SOLD_OUT, session);
                }
                yield session.commitTransaction();
                session.endSession();
                const schedule = yield this._schedulePackageRepo.findById(booking.scheduleId.toString());
                if (!schedule) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
                }
                if (booking.offerId) {
                    yield this._offerRepository.updateUsageCount(booking.offerId.toString());
                }
                yield Promise.all([
                    this._notificationService.createNotification({
                        recipientId: booking.userId.toString(),
                        recipientRole: roles_1.USER_ROLES.USER,
                        senderId: booking.vendorId.toString(),
                        notificationType: notification_entity_1.UserNotificationType.BookingConfirmed,
                        title: 'Booking Confirmed',
                        message: `Your booking for "${(_a = booking.packageId) === null || _a === void 0 ? void 0 : _a.title}" has been confirmed.`,
                        data: {
                            bookingUId: booking._id.toString(),
                            bookingId: booking.bookingCode,
                            packageName: booking.packageId.title,
                        },
                        redirectUrl: `/user/bookings/${booking._id.toString()}`,
                    }),
                    this._notificationService.createNotification({
                        recipientId: booking.vendorId.toString(),
                        recipientRole: roles_1.USER_ROLES.VENDOR,
                        senderId: booking.userId.toString(),
                        notificationType: notification_entity_1.VendorNotificationType.NewBooking,
                        title: 'New Booking',
                        message: `You have a new booking for "${(_b = booking.packageId) === null || _b === void 0 ? void 0 : _b.title}".`,
                        data: {
                            bookingId: booking._id.toString(),
                            bookingCode: booking.bookingCode,
                            scheduleId: booking.scheduleId.toString(),
                            packageId: booking.packageId._id.toString(),
                            packageName: booking.packageId.title,
                        },
                        redirectUrl: `/bookings/${booking._id.toString()}`,
                    }),
                ]);
                // ── 4. Create chat room
                yield this._chatService.ensureRoomExists((0, chat_name_builder_1.generateChatName)(booking.packageId.title, schedule.startDate.toISOString()), (0, objectId_helper_1.toObjectId)(booking.scheduleId.toString()), (0, objectId_helper_1.toObjectId)(booking.packageId._id.toString()), (0, objectId_helper_1.toObjectId)(booking.vendorId.toString()), (0, objectId_helper_1.toObjectId)(booking.userId.toString()));
                return {
                    bookingId: updatedBooking._id.toString(),
                    bookingCode: booking.bookingCode,
                    amount: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.finalAmount) || 0,
                    message: messages_1.SUCCESS_MESSAGES.BOOKING_CONFIRMED,
                };
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
                throw error;
            }
        });
    }
    failedBooking(bookingId, userId, paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepo.findOne({
                _id: (0, objectId_helper_1.toObjectId)(bookingId),
                userId: (0, objectId_helper_1.toObjectId)(userId),
            });
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (booking.paymentStatus === booking_1.PAYMENT_STATUS.PENDING) {
                yield this._bookingRepo.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(bookingId), userId: (0, objectId_helper_1.toObjectId)(userId) }, {
                    paymentStatus: booking_1.PAYMENT_STATUS.FAILED,
                    bookingStatus: booking_1.BOOKING_STATUS.PAYMENT_FAILED,
                    transactionId: paymentIntentId,
                });
            }
        });
    }
    retryBookingPayment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const booking = yield this._bookingRepo.findOnePopulatedMany({ _id: (0, objectId_helper_1.toObjectId)(payload.bookingId), userId: (0, objectId_helper_1.toObjectId)(payload.userId) }, [
                { path: 'scheduleId', select: 'startDate totalSeats seatsBooked' },
                { path: 'packageId', select: 'title' },
            ]);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (booking.paymentStatus !== booking_1.PAYMENT_STATUS.PENDING ||
                booking.bookingStatus !== booking_1.BOOKING_STATUS.PENDING) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_ELGIBLE_FOR_RETRY, http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            //retry deadline check
            const scheduleStartDate = booking.scheduleId.startDate;
            if (!(0, retry_payment_validate_1.isRetryWindowOpen)(booking.createdAt, scheduleStartDate)) {
                yield this._bookingRepo.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(payload.bookingId), userId: (0, objectId_helper_1.toObjectId)(payload.userId) }, {
                    bookingStatus: booking_1.BOOKING_STATUS.PAYMENT_FAILED,
                    paymentStatus: booking_1.PAYMENT_STATUS.FAILED,
                });
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.RETRY_WINDOW_EXPIRED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const scheduleAvailableSeats = booking.scheduleId.totalSeats - booking.scheduleId.seatsBooked;
            if (scheduleAvailableSeats < booking.travelerCount) {
                yield this._bookingRepo.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(payload.bookingId), userId: (0, objectId_helper_1.toObjectId)(payload.userId) }, {
                    bookingStatus: booking_1.BOOKING_STATUS.PAYMENT_FAILED,
                    paymentStatus: booking_1.PAYMENT_STATUS.FAILED,
                });
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SEATS_NOT_AVAILABLE_FOR_RETRY, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Retrieve existing PaymentIntent from Stripe
            const existingSession = this.paymentGateway.retrieveSession(booking.transactionId);
            if ((yield existingSession).payment_status === 'paid') {
                // webhook might have been delayed
                yield this._bookingRepo.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(payload.bookingId), userId: (0, objectId_helper_1.toObjectId)(payload.userId) }, {
                    bookingStatus: booking_1.BOOKING_STATUS.CONFIRMED,
                    paymentStatus: booking_1.PAYMENT_STATUS.PAID,
                });
                throw new AppError_1.AppError('Payment already completed.Please check your bookings', http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            //  Create a new checkout session
            const newSession = yield this.paymentGateway.createPaymentIntent({
                amount: booking.finalAmount,
                currency: 'inr',
                bookingId: booking._id.toString(),
                bookingCode: booking.bookingCode,
                metadata: {
                    userId: booking.userId.toString(),
                    scheduleId: booking.scheduleId._id.toString(),
                    tierType: booking.groupType,
                    walletAmountUsed: String(booking.walletAmountUsed),
                    seatsCount: String(booking.travelerCount),
                    startDate: (_b = (_a = booking.scheduleId.startDate) === null || _a === void 0 ? void 0 : _a.toISOString().split('T')[0]) !== null && _b !== void 0 ? _b : '',
                    endDate: (_d = (_c = booking.scheduleId.endDate) === null || _c === void 0 ? void 0 : _c.toISOString().split('T')[0]) !== null && _d !== void 0 ? _d : '',
                    packageName: booking.packageId.title,
                },
            });
            yield this._bookingRepo.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(payload.bookingId), userId: (0, objectId_helper_1.toObjectId)(payload.userId) }, {
                transactionId: newSession.gatewayPaymentId,
            });
            return {
                clientSecret: newSession.clientSecret,
                bookingId: booking._id.toString(),
                paymentMethod: booking.paymentMethod,
                walletAmountUsed: booking.walletAmountUsed,
                stripeAmount: booking.walletAmountUsed > 0
                    ? booking.finalAmount - booking.walletAmountUsed
                    : booking.finalAmount,
                checkoutUrl: newSession.url || undefined,
            };
        });
    }
    verifyPayment(stripeSessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const session = yield this.paymentGateway.verifyStripeSession(stripeSessionId);
            const bookingId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.bookingId;
            const bookingCode = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.bookingCode;
            if (!bookingId) {
                return {
                    status: booking_1.VERIFY_PAYMENT_STATUS.FAILURE,
                    bookingCode: bookingCode,
                    bookingId: bookingId,
                    amount: Number(session.metadata),
                };
            }
            if (session.payment_status !== booking_1.PAYMENT_STATUS.PAID) {
                return {
                    status: booking_1.VERIFY_PAYMENT_STATUS.FAILURE,
                    bookingCode: bookingCode,
                    bookingId: bookingId,
                    amount: Number(session.metadata),
                };
            }
            const booking = yield this._bookingRepo.findById(bookingId);
            if (!booking) {
                return {
                    status: booking_1.VERIFY_PAYMENT_STATUS.FAILURE,
                    bookingCode: bookingCode,
                    bookingId: bookingId,
                    amount: Number(session.metadata),
                };
            }
            yield this.confirmBooking({
                bookingId: bookingId,
                userId: booking.userId.toString(),
                stripePaymentIntentId: session.payment_intent,
            });
            const updatedBooking = yield this._bookingRepo.findById(bookingId);
            return {
                status: booking_1.VERIFY_PAYMENT_STATUS.SUCCESS,
                bookingCode: updatedBooking.bookingCode,
                bookingId: bookingId,
                amount: updatedBooking.finalAmount,
            };
        });
    }
    getBookings(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookings, total } = yield this._bookingRepo.findBookings({
                userId,
                bookingStatus: filters.bookingStatus,
                search: filters.search,
                page: filters.page,
                limit: filters.limit,
            });
            return {
                bookings,
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit),
            };
        });
    }
    getBookingDetails(userId, bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const booking = yield this._bookingRepo.findByIdAndUser(bookingId, userId);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const bookingDetail = booking_mapper_1.BookingMapper.toDetailedResponse(booking);
            const isCancelled = booking.bookingStatus === booking_1.BOOKING_STATUS.CANCELLED_BY_USER;
            let chatId = null;
            if (!isCancelled) {
                const chatRoom = yield this._chatRepo.findChatRoomByScheduleId(booking.scheduleId);
                chatId = (_a = chatRoom === null || chatRoom === void 0 ? void 0 : chatRoom._id.toString()) !== null && _a !== void 0 ? _a : null;
            }
            return Object.assign(Object.assign({}, bookingDetail), { chatId });
        });
    }
    cancelBookingRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepo.findByIdAndUser(payload.bookingId, payload.userId);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (booking.bookingStatus !== booking_1.BOOKING_STATUS.CONFIRMED || booking.cancellationStatus) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_CANNOT_BE_CANCELLED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const schedule = yield this._schedulePackageRepo.findById(booking.scheduleId._id.toString());
            if (!schedule) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const pkg = yield this._packageRepo.findOne({ _id: booking.packageId._id });
            if (!pkg) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!pkg.cancellationPolicy) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_POLICY_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const policy = yield this._cancellationPolicyRepo.findById(pkg.cancellationPolicy.toString());
            if (!policy) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_POLICY_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const { isWindowApplicable } = (0, get_days_left_1.getApplicableCancellationWindow)(policy.rules, schedule.startDate.toString());
            if (!isWindowApplicable) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_POLICY_NOT_APPLICABLE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const policyDTO = {
                id: policy._id.toString(),
                key: policy.key,
                label: policy.label,
                rules: policy.rules.map((r) => ({
                    daysBeforeTrip: r.daysBeforeTrip,
                    refundPercent: r.refundPercent,
                })),
                isActive: policy.isActive,
            };
            const refundBreakdown = (0, policy_refund_calculator_1.computeRefundBreakdown)(booking.finalAmount, policyDTO, schedule.startDate);
            const cancellationReason = payload.details
                ? `${payload.reason} — ${payload.details}`
                : payload.reason;
            const updatedBooking = yield this._bookingRepo.cancelBooking(payload.bookingId, payload.userId, {
                cancellationReason,
                cancellationStatus: booking_1.CANCELATION_STATUS.PENDING,
                cancelledAt: new Date(),
                cancelationRefundAmount: Math.floor(refundBreakdown.refundAmount),
            });
            if (!updatedBooking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_CANCELLATION_FAILED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const admin = yield this._userRepository.findOne({ role: roles_1.USER_ROLES.ADMIN });
            if (!admin) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            yield this._userRepository.findByIdAndAddUnreadTabs(admin._id.toString(), constants_1.ADMIN_TABS.CANCEL_BOOKINGS);
            this._notificationService.createNotification({
                recipientId: booking.vendorId._id.toString(),
                recipientRole: roles_1.USER_ROLES.VENDOR,
                senderId: booking.userId.toString(),
                notificationType: notification_entity_1.UserNotificationType.BookingCancelRequest,
                title: 'Booking Cancellation Requested',
                message: `Cancellation request for "${pkg.title}" is pending review. Estimated refund: ₹${refundBreakdown.refundAmount} (${refundBreakdown.refundPercent}%).`,
                data: {
                    packageId: pkg._id.toString(),
                    bookingCode: booking.bookingCode,
                    refundAmount: refundBreakdown.refundAmount,
                    refundPercent: refundBreakdown.refundPercent,
                },
                redirectUrl: ``,
            });
            return {
                refundAmount: refundBreakdown.refundAmount,
                refundPercent: refundBreakdown.refundPercent,
            };
        });
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('INotificationService')),
    __param(1, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(2, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(3, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(4, (0, tsyringe_1.inject)('IPaymentGateway')),
    __param(5, (0, tsyringe_1.inject)('IChatService')),
    __param(6, (0, tsyringe_1.inject)('IChatRepository')),
    __param(7, (0, tsyringe_1.inject)('IWalletService')),
    __param(8, (0, tsyringe_1.inject)('ICancellationPolicyRepository')),
    __param(9, (0, tsyringe_1.inject)('IUserRepository')),
    __param(10, (0, tsyringe_1.inject)('IOfferRepository')),
    __param(11, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], BookingService);
