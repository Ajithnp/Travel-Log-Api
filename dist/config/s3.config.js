"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("./env");
const s3Client = new client_s3_1.S3Client({
    region: env_1.config.aws.AWS_REGION,
    credentials: {
        accessKeyId: env_1.config.aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.config.aws.AWS_SECRET_ACCESS_KEY,
    },
});
exports.default = s3Client;
