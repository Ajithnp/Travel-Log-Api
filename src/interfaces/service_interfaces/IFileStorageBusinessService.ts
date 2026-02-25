import { IGetUploadUrlPayload } from 'types/dtos/common/request.dtos';
import { IGetUploadUrlResponse } from 'types/dtos/common/response.dtos';
import { SignedUrlViewResponse } from 'types/dtos/common/response.dtos';
export interface IFileStorageHandlerService {
  getUploadUrls(files: IGetUploadUrlPayload[]): Promise<IGetUploadUrlResponse[]>;

  getViewUrls(userId: string, keys: string[]): Promise<SignedUrlViewResponse[]>;

  deleteFile(key: string): Promise<void>;

  deleteFiles(keys: string[]): Promise<void>;
}
