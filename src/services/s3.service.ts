import { injectable } from 'tsyringe';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/env';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../config/s3.config';
import { IGetUploadUrlPayload } from '../types/dtos/common/request.dtos';
import { IGetUploadUrlResponse } from '../types/dtos/common/response.dtos';
import { IFileStorageService } from 'interfaces/service_interfaces/IStorageService';
@injectable()
export class S3Service implements IFileStorageService {
  private readonly _s3Client = s3Client;
  private readonly _bucketName = config.aws.AWS_BUCKET_NAME;

  async getObjectURL(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this._bucketName,
      Key: key,
    });
    const url = await getSignedUrl(this._s3Client, command, { expiresIn: 300 });
    return url;
  }

  async getObjectURLs(keys: string[]): Promise<string[]> {
    return Promise.all(keys.map((key) => this.getObjectURL(key)));
  }

  async generateUploadURLs(files: IGetUploadUrlPayload[]): Promise<IGetUploadUrlResponse[]> {
    const uploadUrls = await Promise.all(
      files.map(async (file) => {
        const key = `uploads/${file.fieldName}/${Date.now()}-${file.fileName}`;

        const command = new PutObjectCommand({
          Bucket: this._bucketName,
          Key: key,
          ContentType: file.contentType,
        });

        const url = await getSignedUrl(this._s3Client, command, { expiresIn: 120 });

        return { url, key, fieldName: file.fieldName, name: file.fileName };
      }),
    );
    return uploadUrls;
  }

  async generateUploadURL(file: IGetUploadUrlPayload): Promise<IGetUploadUrlResponse> {
    const [result] = await this.generateUploadURLs([file]);

    return result;
  }

  async deleteFile(key: string): Promise<void> {
    await this._s3Client.send(
      new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      }),
    );
  }

  async deleteFiles(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteFile(key)));
  }
}
