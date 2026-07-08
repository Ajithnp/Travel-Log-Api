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
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const schedule_model_1 = __importDefault(require("../../models/schedule.model"));
const di_1 = require("../../di");
const constants_1 = require("../../shared/constants/constants");
const logger_1 = __importDefault(require("config/logger"));
di_1.DependencyInjection.registerDependencies();
const embeddingService = tsyringe_1.container.resolve('IEmbeddingService');
function seedEmbeddings() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.DB_URL);
            const schedules = yield schedule_model_1.default.find({
                status: constants_1.SCHEDULE_STATUS.UPCOMING,
                // startDate:{$gte:new Date().toISOString()}
            }).select('_id packageId');
            if (schedules.length === 0) {
                return;
            }
            let success = 0;
            let failed = 0;
            for (const schedule of schedules) {
                try {
                    yield embeddingService.generateAndSaveEmbedding(schedule._id.toString(), schedule.packageId.toString());
                    success++;
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                }
                catch (err) {
                    logger_1.default.error(`Failed for schedule ${schedule._id}:`, err);
                    failed++;
                }
            }
            // 4. Summary
            logger_1.default.info('\n─────────────────────────');
            logger_1.default.info('✅ Seeding Complete!');
            logger_1.default.info(`   Success : ${success}`);
            logger_1.default.info(`   Failed  : ${failed}`);
            logger_1.default.info(`   Total   : ${schedules.length}`);
            logger_1.default.info('─────────────────────────');
        }
        catch (error) {
            logger_1.default.error('❌ Seed script error:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            logger_1.default.info('MongoDB Disconnected');
            process.exit(0);
        }
    });
}
seedEmbeddings();
