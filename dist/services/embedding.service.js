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
exports.EmbeddingService = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const constants_1 = require("../shared/constants/constants");
const build_combined_text_1 = require("../shared/utils/embedding/build-combined-text");
const trip_embedding_mapper_1 = require("../shared/mappers/trip-embedding.mapper");
let EmbeddingService = class EmbeddingService {
    constructor(_aiProvider, _tripEmbeddingRepository, _scheduleRepository, _packageRepository) {
        this._aiProvider = _aiProvider;
        this._tripEmbeddingRepository = _tripEmbeddingRepository;
        this._scheduleRepository = _scheduleRepository;
        this._packageRepository = _packageRepository;
    }
    // -Single Schedule Embedding Generate + Save
    generateAndSaveEmbedding(scheduleId, packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [schedule, pkg] = yield Promise.all([
                this._scheduleRepository.findById(scheduleId),
                this._packageRepository.findByIdWithCategory(packageId),
            ]);
            if (!schedule || !pkg) {
                return;
            }
            if (schedule.status !== constants_1.SCHEDULE_STATUS.UPCOMING) {
                yield this._tripEmbeddingRepository.deleteByScheduleId(scheduleId);
                return;
            }
            if (!pkg.isActive || pkg.isDeleted) {
                return;
            }
            const combinedText = (0, build_combined_text_1.buildCombinedText)(pkg, schedule);
            // Gemini Embedding API call
            const embeddingVector = yield this._aiProvider.getEmbeddingModel().embedQuery(combinedText);
            const embeddingData = trip_embedding_mapper_1.TripEmbeddingMapper.toEntity(schedule, pkg, embeddingVector, combinedText);
            yield this._tripEmbeddingRepository.findOneAndUpdate({ scheduleId: schedule._id }, embeddingData, { upsert: true, new: true });
        });
    }
    updateSeatsInEmbedding(scheduleId, seatsBooked, totalSeats) {
        return __awaiter(this, void 0, void 0, function* () {
            const seatsAvailable = totalSeats - seatsBooked;
            yield this._tripEmbeddingRepository.findOneAndUpdate({ scheduleId: new mongoose_1.Types.ObjectId(scheduleId) }, {
                seatsAvailable,
                isActive: seatsAvailable > 0,
            });
        });
    }
    deleteEmbedding(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._tripEmbeddingRepository.deleteByScheduleId(scheduleId);
        });
    }
};
exports.EmbeddingService = EmbeddingService;
exports.EmbeddingService = EmbeddingService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAIProvider')),
    __param(1, (0, tsyringe_1.inject)('ITripEmbeddingRepository')),
    __param(2, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(3, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], EmbeddingService);
