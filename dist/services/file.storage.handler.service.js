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
exports.FileStorageHandlerService = void 0;
const tsyringe_1 = require("tsyringe");
const small_hasher_helper_1 = require("../shared/utils/small.hasher.helper");
let FileStorageHandlerService = class FileStorageHandlerService {
    constructor(_fileStorageService, _cacheService) {
        this._fileStorageService = _fileStorageService;
        this._cacheService = _cacheService;
    }
    getViewUrls(userId, keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = (0, small_hasher_helper_1.smallHasher)(JSON.stringify(keys));
            const cacheKey = `s3:view:${userId}:${hash}`;
            const cached = yield this._cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
            let responses;
            responses = yield this._fileStorageService.getObjectURLs(keys);
            yield this._cacheService.set(cacheKey, responses, 300);
            return responses;
        });
    }
    getUploadUrls(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (files.length === 1) {
                const singleUrl = yield this._fileStorageService.generateUploadURL(files[0]);
                return [singleUrl];
            }
            return yield this._fileStorageService.generateUploadURLs(files);
        });
    }
    deleteFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._fileStorageService.deleteFile(key);
        });
    }
    deleteFiles(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._fileStorageService.deleteFiles(keys);
        });
    }
};
exports.FileStorageHandlerService = FileStorageHandlerService;
exports.FileStorageHandlerService = FileStorageHandlerService = __decorate([
    (0, tsyringe_1.injectable)()
    ///Orchestrstion,
    ,
    __param(0, (0, tsyringe_1.inject)('IFileStorageService')),
    __param(1, (0, tsyringe_1.inject)('ICacheService')),
    __metadata("design:paramtypes", [Object, Object])
], FileStorageHandlerService);
