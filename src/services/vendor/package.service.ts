import { inject, injectable } from "tsyringe";
import { IPackageService } from "../../interfaces/service_interfaces/vendor/IPackageService";
import { IVendorInfoRepository } from "../../interfaces/repository_interfaces/IVendorInfoRepository";
import { IBasePackageRepository } from "../../interfaces/repository_interfaces/IBasePackageRepository";
import { IUserRepository } from "../../interfaces/repository_interfaces/IUserRepository";
import { CreateBasePackageDTO } from "../../types/dtos/vendor/base-Package/request.dtos";
import { VENDOR_VERIFICATION_STATUS } from "../../types/enum/vendor-verfication-status.enum";
import { AppError } from "../../errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/messages";
import { HTTP_STATUS } from "../../shared/constants/http_status_code";
import { Types } from "mongoose";

@injectable()
export class PackageService implements IPackageService {

    constructor(
        @inject('IBasePackageRepository')
        private _basePackageRepository: IBasePackageRepository,
        @inject('IVendorInfoRepository')
        private _vendorInfoRepository: IVendorInfoRepository,
        
    ){}
    async createPackage(vendorId: string, payload: CreateBasePackageDTO) {
       
        const vendor = await this._vendorInfoRepository.findVendorWithUserId(vendorId);
        if (!vendor || vendor.status !== VENDOR_VERIFICATION_STATUS.APPROVED) {
            throw new AppError(ERROR_MESSAGES.VENDOR_NOT_VERIFIED, HTTP_STATUS.BAD_REQUEST)
        }
        // Prevent duplicate packages per vendor
        const vendorObjectId = new Types.ObjectId(vendorId);

        const exists = await this._basePackageRepository.exists({
            vendorId,
            title: payload.title,
        });
        if (exists) {
            throw new AppError(ERROR_MESSAGES.PACKAGE_ALREADY_EXISTS,HTTP_STATUS.CONFLICT)
        }
        
        await this._basePackageRepository.create({...payload, vendorId:vendorObjectId})
    }
}