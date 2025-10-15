import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// custom log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// daily rotate transport for all logs
const dailyRotateTransport = new DailyRotateFile({
  filename: 'logs/app-%DATE%.log', // filename pattern
  datePattern: 'YYYY-MM-DD', // rotate daily
  zippedArchive: true, // compress old logs (.gz)
  maxSize: '20m', // max size per file before rotation
  maxFiles: '14d', // retention period: keep 14 days
});

//  Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(winston.format.timestamp(), logFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    dailyRotateTransport,
  ],
});

export default logger;
