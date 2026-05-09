import { injectable , inject} from "tsyringe";
import { IVendorVerificationResponse, IVendorVerificationService } from "../../interfaces/service_interfaces/vendor/IvendorVerificationService";
import { IVendorInfoRepository } from "../../interfaces/repository_interfaces/IVendorInfoRepository";
import { toObjectId } from "../../shared/utils/database/objectId.helper";
import { VENDOR_VERIFICATION_STATUS } from "../../types/enum/vendor-verfication-status.enum";
import { AppError } from "../../errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/messages";
import { HTTP_STATUS } from "../../shared/constants/http_status_code";
import { VendorverificationMapper } from "../../shared/mappers/vendor-verification.mapper";
import { IVendorVerificationResponseDTO } from "../../types/dtos/vendor/vendorVerificationResponse.dtos";
import { VendorVerificationRequestDTO } from "../../types/dtos/vendor/request.dtos";
import { IDocuments, IVendorInfo } from "../../types/entities/vendor.info.entity";

@injectable()
export class VendorVerificationService implements IVendorVerificationService{
    constructor(
        @inject('IVendorInfoRepository')
        private _vendorInfoRepository: IVendorInfoRepository,
    ) { }


    async getVerificationData(vendorId: string,): Promise<void> {
        
    }
//==============================================
 async vendorVerificationSubmit(
    vendorId: string,
    verificationData: VendorVerificationRequestDTO,
  ): Promise<IVendorVerificationResponseDTO> {

    const existingDoc = await this._vendorInfoRepository.findOne({
      userId: toObjectId(vendorId),
    });

  if (existingDoc?.status === VENDOR_VERIFICATION_STATUS.APPROVED) {
    throw new AppError(
      ERROR_MESSAGES.VENDOR_VERIFICARION_STATUS_APPROVED,
      HTTP_STATUS.BAD_REQUEST,
    )
    };


  if (existingDoc?.status === VENDOR_VERIFICATION_STATUS.PENDING) {
    throw new AppError(
      ERROR_MESSAGES.VENDOR_VERIFICATION_STATUS_PENDING,
      HTTP_STATUS.BAD_REQUEST,
    );
    };

     const documents = this._mapFilesToDocuments(verificationData.files);


  const payload: Partial<IVendorInfo> = {
    userId:      toObjectId(vendorId),
    businessInfo: {
      GSTIN:               verificationData.gstin,
      businessAddress:     verificationData.businessAddress,
      contactPersonName: verificationData.ownerName,
      bio: verificationData.bio,
    },
    bankDetails: {
      accountHolderName: verificationData.accountHolderName,
      accountNumber:     verificationData.accountNumber,
      bankName:          verificationData.bankName,
      branch:            verificationData.branch,
      ifsc:              verificationData.ifsc,
    },
    documents: {
        ...documents,
      } as IDocuments,
    status: VENDOR_VERIFICATION_STATUS.UNDER_REVIEW,
  };

  const vendorDoc = await this._vendorInfoRepository.create(
    payload,
  );
    return {
      isProfileVerified: vendorDoc.isProfileVerified,
    };
    };
    //===================================================

    async getRejectedVendor(vendorId: string): Promise<IVendorVerificationResponse>{
        
        const vendor = await this._vendorInfoRepository.findOne({ userId: toObjectId(vendorId), status: VENDOR_VERIFICATION_STATUS.REJECTED });

        if (!vendor) {
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        return VendorverificationMapper.toVendorRejectedResponse(vendor)
    };
//====================================
    async vendorVerificationReapply(
        vendorId: string,
        vendorInfoId:string,
        verificationData: VendorVerificationRequestDTO,
    ): Promise<IVendorVerificationResponseDTO> {
       
        const existingDoc = await this._vendorInfoRepository.findOne({
            _id:toObjectId(vendorInfoId),
            userId: toObjectId(vendorId),
        });

          if (!existingDoc) {
              throw new AppError(
                  ERROR_MESSAGES.VENDOR_NOT_FOUND,
                  HTTP_STATUS.NOT_FOUND,
              );
        };

          if (existingDoc.status !== VENDOR_VERIFICATION_STATUS.REJECTED) {
              throw new AppError(
                  ERROR_MESSAGES.VENDOR_REAPPLY_NOT_ALLOWED, // add this message
                  HTTP_STATUS.BAD_REQUEST,
              );
        };

        // Merge: existing DB documents + and the replaced files from request
        // Files not replaced by the vendor stay exactly as they were in DB

        const replacedDocuments = this._mapFilesToDocuments(verificationData.files);

        const mergedDocuments: IDocuments = {
            ...existingDoc.documents,  // existing keys 
            ...replacedDocuments,    
        };

        existingDoc.set({
            businessInfo: {
                GSTIN: verificationData.gstin,
                businessAddress: verificationData.businessAddress,
                contactPersonName: verificationData.ownerName,
                bio:verificationData.bio,
            },
            bankDetails: {
                accountHolderName: verificationData.accountHolderName,
                accountNumber: verificationData.accountNumber,
                bankName: verificationData.bankName,
                branch: verificationData.branch,
                ifsc: verificationData.ifsc,
            },
            documents: mergedDocuments,
            status: VENDOR_VERIFICATION_STATUS.UNDER_REVIEW,
            reasonForReject: '',  
        });

        await existingDoc.save();

         return { isProfileVerified: existingDoc.isProfileVerified };
     }
//====================================
 private _mapFilesToDocuments(
  files: VendorVerificationRequestDTO['files'],
): Partial<IDocuments> {
  const fieldMap: Record<string, keyof IDocuments> = {
    businessLicence:    'businessLicence',
    businessPan:        'businessPan',
    companyLogo:        'profileLogo',
    ownerIdentityProof: 'ownerIdentity',
  };

  const documents: Partial<IDocuments> = {};

  for (const file of files) {
    const docField = fieldMap[file.fieldName];
    if (docField) {
      documents[docField] = { key: file.key, fieldName: file.fieldName };
    }
        };

  return documents;
    };
}