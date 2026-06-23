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
exports.CancellationPolicyService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const canellation_policy_mapper_1 = require("../../shared/mappers/canellation-policy.mapper");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const messages_1 = require("../../shared/constants/messages");
let CancellationPolicyService = class CancellationPolicyService {
    constructor(_policyRepository) {
        this._policyRepository = _policyRepository;
    }
    createPolicy(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this._policyRepository.findByKey(payload.key);
            if (existing) {
                throw new AppError_1.AppError(`A policy with key "${payload.key}" already exists`, http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            const policy = yield this._policyRepository.create(payload);
            return canellation_policy_mapper_1.CancellationPolicyMapper.toResponseDto(policy);
        });
    }
    getPolicies() {
        return __awaiter(this, arguments, void 0, function* (includeInactive = false) {
            const policies = yield this._policyRepository.findAll(includeInactive ? {} : { isActive: true });
            return policies.map(canellation_policy_mapper_1.CancellationPolicyMapper.toResponseDto);
        });
    }
    togglePolicyActiveStatus(id, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            const policyObjectId = (0, objectId_helper_1.toObjectId)(id);
            const policy = yield this._policyRepository.findOne({ _id: policyObjectId });
            if (!policy) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANCELLATION_POLICY_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (policy.isActive === isActive) {
                return canellation_policy_mapper_1.CancellationPolicyMapper.toResponseDto(policy);
            }
            const updatedPolicy = yield this._policyRepository.toggleActive(id, isActive);
            if (!updatedPolicy) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FAILED_TO_UPDATE_CANCELLATION_POLICY_STATUS, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return canellation_policy_mapper_1.CancellationPolicyMapper.toResponseDto(updatedPolicy);
        });
    }
};
exports.CancellationPolicyService = CancellationPolicyService;
exports.CancellationPolicyService = CancellationPolicyService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICancellationPolicyRepository')),
    __metadata("design:paramtypes", [Object])
], CancellationPolicyService);
