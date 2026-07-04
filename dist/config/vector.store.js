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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVectorStore = getVectorStore;
exports.getRetriever = getRetriever;
const env_1 = require("./env");
const mongodb_1 = require("mongodb");
const mongodb_2 = require("@langchain/mongodb");
let nativeClient = null;
function getNativeClient() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!nativeClient) {
            nativeClient = new mongodb_1.MongoClient(env_1.config.database.DB_URL);
            yield nativeClient.connect();
        }
        return nativeClient;
    });
}
function getVectorStore(embeddings) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield getNativeClient();
        const collection = client
            .db(env_1.config.database.DB_NAME)
            .collection(env_1.config.database.VECTOR_COLLECTION_NAME);
        return new mongodb_2.MongoDBAtlasVectorSearch(embeddings, {
            collection,
            indexName: env_1.config.database.VECTOR_INDEX,
            textKey: 'combinedText',
            embeddingKey: 'embedding',
        });
    });
}
// Retriever — top 5 matching trips (active, future, seats available)
function getRetriever(embeddings) {
    return __awaiter(this, void 0, void 0, function* () {
        const vectorStore = yield getVectorStore(embeddings);
        return vectorStore.asRetriever({
            k: 5, // top 5 results
            filter: {
                preFilter: {
                    isActive: { $eq: true },
                    // startDate: { $gte: new Date() },
                    seatsAvailable: { $gt: 0 },
                },
            },
        });
    });
}
