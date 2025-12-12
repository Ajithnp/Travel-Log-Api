import { IGetUploadUrlResponse } from '../../types/dtos/common/response.dtos';
import { IGetUploadUrlPayload } from '../../types/dtos/common/request.dtos';

export interface IFileStorageService {
  generateUploadURLs(files: IGetUploadUrlPayload[]): Promise<IGetUploadUrlResponse[]>;
  generateUploadURL(file: IGetUploadUrlPayload): Promise<IGetUploadUrlResponse>;

  getObjectURL(key: string): Promise<string>;
  getObjectURLs(keys: string[]): Promise<string[]>;

  deleteFile(key: string): Promise<void>;
  deleteFiles(keys: string[]): Promise<void>;
}
