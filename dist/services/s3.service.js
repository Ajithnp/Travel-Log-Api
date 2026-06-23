"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.S3Service = void 0;
const tsyringe_1 = require("tsyringe");
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../config/env");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_config_1 = __importDefault(require("../config/s3.config"));
let S3Service = class S3Service {
    constructor() {
        this._s3Client = s3_config_1.default;
        this._bucketName = env_1.config.aws.AWS_BUCKET_NAME;
    }
    getObjectURL(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this._bucketName,
                Key: key,
            });
            const url = yield (0, s3_request_presigner_1.getSignedUrl)(this._s3Client, command, { expiresIn: 900 });
            return url;
        });
    }
    getObjectURLs(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all(keys.map((key) => __awaiter(this, void 0, void 0, function* () {
                const url = yield this.getObjectURL(key);
                return {
                    key,
                    url,
                };
            })));
            return results;
        });
    }
    generateUploadURLs(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadUrls = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const key = `uploads/${file.fieldName}/${Date.now()}-${file.fileName}`;
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: this._bucketName,
                    Key: key,
                    ContentType: file.contentType,
                });
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(this._s3Client, command, { expiresIn: 120 });
                return { url, key, fieldName: file.fieldName, name: file.fileName };
            })));
            return uploadUrls;
        });
    }
    generateUploadURL(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const [result] = yield this.generateUploadURLs([file]);
            return result;
        });
    }
    deleteFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this._bucketName,
                Key: key,
            }));
        });
    }
    deleteFiles(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(keys.map((key) => this.deleteFile(key)));
        });
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, tsyringe_1.injectable)()
], S3Service);
