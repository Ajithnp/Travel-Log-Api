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
exports.RagService = void 0;
const tsyringe_1 = require("tsyringe");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
const format_ai_chat_history_1 = require("../shared/utils/format-ai-chat-history");
const vector_store_1 = require("../config/vector.store");
const prompt_templates_1 = require("../shared/templates/prompt_templates");
const messages_1 = require("../shared/constants/messages");
let RagService = class RagService {
    constructor(_aiProvider) {
        this._aiProvider = _aiProvider;
    }
    formatDocuments(docs) {
        if (docs.length === 0) {
            return messages_1.ERROR_MESSAGES.NO_TRIPS_FOUND;
        }
        return docs
            .map((doc, index) => {
            return `--- Trip Option ${index + 1} --- ${doc.pageContent}`.trim();
        })
            .join('\n\n');
    }
    askChatbot(userMessage_1) {
        return __awaiter(this, arguments, void 0, function* (userMessage, chatHistory = []) {
            // Retriever — top 5 matching trips (active, future, seats available)
            const retriever = yield (0, vector_store_1.getRetriever)(this._aiProvider.getEmbeddingModel());
            // Prompt Template build
            const prompt = prompts_1.ChatPromptTemplate.fromMessages([
                ['system', prompt_templates_1.SYSTEM_PROMPT],
                ['human', `Chat History:\n${chatHistory}\n\nUser Question: ${userMessage}`],
            ]);
            // RAG Chain
            // Question → Retrieve → Prompt → LLM → String Output
            const ragChain = runnables_1.RunnableSequence.from([
                {
                    //prepare context and question in Parallel
                    context: (input) => __awaiter(this, void 0, void 0, function* () {
                        const docs = yield retriever.invoke(input.question);
                        return this.formatDocuments(docs);
                    }),
                    question: (input) => input.question,
                    chatHistory: (input) => input.chatHistory,
                },
                prompt,
                this._aiProvider.getChatModel(),
                new output_parsers_1.StringOutputParser(), // AI response → plain string
            ]);
            // Chain invoke
            const response = yield ragChain.invoke({
                question: userMessage,
                chatHistory: (0, format_ai_chat_history_1.formatChatHistory)(chatHistory),
            });
            return response;
        });
    }
};
exports.RagService = RagService;
exports.RagService = RagService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAIProvider')),
    __metadata("design:paramtypes", [Object])
], RagService);
