"use strict";
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
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const gemini_ai_1 = require("./gemini-ai");
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        const gemini = new gemini_ai_1.GeminiProvider();
        const llm = gemini.getChatModel();
        const embeddings = gemini.getEmbeddingModel();
        console.log('Testing LLM...');
        const llmResponse = yield llm.invoke('Say hello in one sentence');
        console.log('LLM Response:', llmResponse.content);
        console.log('\nTesting Embeddings...');
        const vector = yield embeddings.embedQuery('Munnar weekend trip');
        console.log('Embedding vector length:', vector.length);
    });
}
test().catch(console.error);
