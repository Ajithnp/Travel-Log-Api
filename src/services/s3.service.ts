import { injectable } from 'tsyringe';
import { GetObjectAclCommand, PutObjectAclCommand } from '@aws-sdk/client-s3';
import { config } from 'config/env';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../config/s3.config';
import { IS3Service } from '../interfaces/service_interfaces/IS3Service';

@injectable()
export class S3Service implements IS3Service {
   
    async getObjectURL(key: string): Promise<string> {
        const command = new GetObjectAclCommand({
            Bucket: config.aws.AWS_BUCKET_NAME,
            Key: key
        });
        const url = await getSignedUrl(s3Client, command, {expiresIn: 20});
        return url;
    };

    async putObjectURL(filename: string, contentType: string) {
        const command = new PutObjectAclCommand({
            Bucket: config.aws.AWS_BUCKET_NAME,
            Key: `uploads/user-uploads/${filename}`,
            // ContentType: contentType
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        return url
    };

}
