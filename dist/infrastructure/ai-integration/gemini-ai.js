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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const env_1 = require("../../config/env");
const tsyringe_1 = require("tsyringe");
const google_genai_1 = require("@langchain/google-genai");
const generative_ai_1 = require("@google/generative-ai");
let GeminiProvider = class GeminiProvider {
    constructor() {
        this.chatModel = new google_genai_1.ChatGoogleGenerativeAI({
            model: env_1.config.ai.CHAT_MODEL,
            apiKey: env_1.config.ai.GEMINI_API_KEY,
            temperature: 0.7,
        });
        this.embeddingModel = new google_genai_1.GoogleGenerativeAIEmbeddings({
            model: env_1.config.ai.EMBEDDING_MODEL,
            taskType: generative_ai_1.TaskType.RETRIEVAL_DOCUMENT,
            apiKey: env_1.config.ai.GEMINI_API_KEY,
        });
    }
    getChatModel() {
        return this.chatModel;
    }
    getEmbeddingModel() {
        return this.embeddingModel;
    }
};
exports.GeminiProvider = GeminiProvider;
exports.GeminiProvider = GeminiProvider = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], GeminiProvider);
