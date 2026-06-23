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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRepository = void 0;
const contact_model_1 = __importDefault(require("../models/contact.model"));
const base_repository_1 = require("./base.repository");
const tsyringe_1 = require("tsyringe");
let ContactRepository = class ContactRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(contact_model_1.default);
    }
    findAllEnquiries(page, limit, search, status) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const skip = (page - 1) * limit;
            const filter = {};
            if (status)
                filter.status = status;
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { subject: { $regex: search, $options: 'i' } },
                    { message: { $regex: search, $options: 'i' } },
                ];
            }
            const [result] = yield this.model.aggregate([
                { $match: filter },
                {
                    $facet: {
                        enquiries: [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    name: 1,
                                    email: 1,
                                    phone: 1,
                                    subject: 1,
                                    message: 1,
                                    isGuest: 1,
                                    status: 1,
                                    createdAt: 1,
                                    updatedAt: 1,
                                },
                            },
                        ],
                        totalCount: [{ $count: 'count' }],
                        pendingCount: [{ $match: { status: 'pending' } }, { $count: 'count' }],
                        resolvedCount: [{ $match: { status: 'resolved' } }, { $count: 'count' }],
                    },
                },
            ]);
            const totalCount = ((_a = result.totalCount[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
            const pending = ((_b = result.pendingCount[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
            const resolved = ((_c = result.resolvedCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0;
            return {
                enquiries: result.enquiries,
                totalCount,
                pendingCount: pending,
                resolvedCount: resolved,
            };
        });
    }
};
exports.ContactRepository = ContactRepository;
exports.ContactRepository = ContactRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ContactRepository);
