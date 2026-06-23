"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
// custom log format
const logFormat = winston_1.default.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});
// daily rotate transport for all logs
const dailyRotateTransport = new winston_daily_rotate_file_1.default({
    filename: 'logs/app-%DATE%.log', // filename pattern
    datePattern: 'YYYY-MM-DD', // rotate daily
    zippedArchive: true, // compress old logs (.gz)
    maxSize: '20m', // max size per file before rotation
    maxFiles: '14d', // retention period: keep 14 days
});
//  Winston logger
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), logFormat),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
        dailyRotateTransport,
    ],
});
exports.default = logger;
