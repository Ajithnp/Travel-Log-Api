import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5 MB file size
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Define allowed MIME types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf', // PDF MIME type
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!') as any, false);
    }
  },
});

export default upload;

import express, { Request, Response } from 'express';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});



