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
di_1.DependencyInjection.registerDependencies();
const embeddingService = tsyringe_1.container.resolve('IEmbeddingService');
function seedEmbeddings() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Connecting to MongoDB...');
            yield mongoose_1.default.connect(process.env.DB_URL);
            console.log('✅ MongoDB Connected');
            const schedules = yield schedule_model_1.default.find({
                status: constants_1.SCHEDULE_STATUS.UPCOMING,
                // startDate:{$gte:new Date().toISOString()}
            }).select('_id packageId');
            console.log(`Found ${schedules.length} upcoming schedules to embed`);
            if (schedules.length === 0) {
                console.log('⚠️ No upcoming schedules found. Add schedules first!');
                return;
            }
            let success = 0;
            let failed = 0;
            for (const schedule of schedules) {
                try {
                    yield embeddingService.generateAndSaveEmbedding(schedule._id.toString(), schedule.packageId.toString());
                    success++;
                    // 1 second delay between each embedding call
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                }
                catch (err) {
                    console.error(`❌ Failed for schedule ${schedule._id}:`, err);
                    failed++;
                }
            }
            // 4. Summary
            console.log('\n─────────────────────────');
            console.log('✅ Seeding Complete!');
            console.log(`   Success : ${success}`);
            console.log(`   Failed  : ${failed}`);
            console.log(`   Total   : ${schedules.length}`);
            console.log('─────────────────────────');
        }
        catch (error) {
            console.error('❌ Seed script error:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('MongoDB Disconnected');
            process.exit(0);
        }
    });
}
seedEmbeddings();
