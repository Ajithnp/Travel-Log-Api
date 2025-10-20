import { S3Client } from '@aws-sdk/client-s3';
import { config } from './env';

const s3Client = new S3Client({
    region: config.aws.AWS_REGION,
    credentials: {
        accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.aws.AWS_SECRET_ACCESS_KEY
    }
});

export default s3Client;