import { inject, injectable } from 'tsyringe';
import { IFileStorageService } from '../interfaces/service_interfaces/IStorageService';
import { ICacheService } from '../interfaces/service_interfaces/ICacheService';
import { IFileStorageHandlerService } from '../interfaces/service_interfaces/IFileStorageBusinessService';
import { IGetUploadUrlPayload } from 'types/dtos/common/request.dtos';
import { IGetUploadUrlResponse } from 'types/dtos/common/response.dtos';
import { smallHasher } from '../shared/utils/small.hasher.helper';
import { SignedUrlViewResponse } from 'types/dtos/common/response.dtos';
@injectable()
///Orchestrstion,
export class FileStorageHandlerService implements IFileStorageHandlerService {
  constructor(
    @inject('IFileStorageService')
    private _fileStorageService: IFileStorageService,

    @inject('ICacheService')
    private _cacheService: ICacheService,
  ) {}

  async getViewUrls(userId: string, keys: string[]): Promise<SignedUrlViewResponse[]> {
    const hash = smallHasher(JSON.stringify(keys));
    const cacheKey = `s3:view:${userId}:${hash}`;

    const cached = await this._cacheService.get<SignedUrlViewResponse[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let responses: SignedUrlViewResponse[];

    responses = await this._fileStorageService.getObjectURLs(keys);

    await this._cacheService.set(cacheKey, responses, 300);

    return responses;
  }

  async getUploadUrls(files: IGetUploadUrlPayload[]): Promise<IGetUploadUrlResponse[]> {
    if (files.length === 1) {
      const singleUrl = await this._fileStorageService.generateUploadURL(files[0]);
      return [singleUrl];
    }
    return await this._fileStorageService.generateUploadURLs(files);
  }

  async deleteFile(key: string) {
    await this._fileStorageService.deleteFile(key);
  }

  async deleteFiles(keys: string[]) {
    await this._fileStorageService.deleteFiles(keys);
  }

  //        * delete cached URLs when files are updated or removed.
  //    */
  //   async invalidateViewUrls(userId: string, keys: string[]): Promise<void> {
  //     const cacheKeys = keys.map((key) => `s3:view:${userId}:${key}`);
  //     await this._cacheService.delMany(cacheKeys);
  //   }
}
