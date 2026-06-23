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
var ContactService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const tsyringe_1 = require("tsyringe");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const constants_1 = require("../shared/constants/constants");
const AppError_1 = require("../errors/AppError");
const messages_1 = require("../shared/constants/messages");
const http_status_code_1 = require("../shared/constants/http_status_code");
let ContactService = ContactService_1 = class ContactService {
    constructor(_contactRepository) {
        this._contactRepository = _contactRepository;
    }
    static toContactResponseDTO(contact) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return {
            id: (_b = (_a = contact._id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
            name: (_c = contact.name) !== null && _c !== void 0 ? _c : '',
            email: (_d = contact.email) !== null && _d !== void 0 ? _d : '',
            phone: (_e = contact.phone) !== null && _e !== void 0 ? _e : '',
            subject: (_f = contact.subject) !== null && _f !== void 0 ? _f : '',
            message: (_g = contact.message) !== null && _g !== void 0 ? _g : '',
            isGuest: (_h = contact.isGuest) !== null && _h !== void 0 ? _h : false,
            status: (_j = contact.status) !== null && _j !== void 0 ? _j : constants_1.CONTACT_STATUS.PENDING,
            createdAt: (_k = contact.createdAt) !== null && _k !== void 0 ? _k : new Date(),
            updatedAt: (_l = contact.updatedAt) !== null && _l !== void 0 ? _l : new Date(),
        };
    }
    createContact(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._contactRepository.create(Object.assign(Object.assign({}, payload), { userId: payload.userId ? (0, objectId_helper_1.toObjectId)(payload.userId) : null }));
        });
    }
    contactEnquiries(page, limit, search, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const { enquiries, totalCount, pendingCount, resolvedCount } = yield this._contactRepository.findAllEnquiries(page, limit, search, status);
            return {
                data: enquiries.map((contact) => ContactService_1.toContactResponseDTO(contact)),
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalDocs: totalCount,
                pendingCount,
                resolvedCount,
            };
        });
    }
    updateEnquiry(enquiryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const enquiry = yield this._contactRepository.findById(enquiryId);
            if (!enquiry)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.ENQUIRY_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (enquiry.status === constants_1.CONTACT_STATUS.RESOLVED)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.ENQUIRY_ALREADY_RESOLVED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            const updatedEnquiry = yield this._contactRepository.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(enquiryId) }, { status: constants_1.CONTACT_STATUS.RESOLVED });
            if (!updatedEnquiry)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            return updatedEnquiry._id.toString();
        });
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = ContactService_1 = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IContactRepository')),
    __metadata("design:paramtypes", [Object])
], ContactService);
