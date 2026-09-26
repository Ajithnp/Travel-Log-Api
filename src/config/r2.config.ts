import { config } from './env';
import { S3Client } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: config.r2.R2_ENDPOINT,
  credentials: {
    accessKeyId: config.r2.R2_ACCESS_KEY_ID,
    secretAccessKey: config.r2.R2_SECRET_ACCESS_KEY,
  },
});

export default r2Client;
