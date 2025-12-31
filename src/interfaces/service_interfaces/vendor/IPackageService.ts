import { CreateBasePackageDTO } from "../../../types/dtos/vendor/base-Package/request.dtos"
export interface IPackageService {
    createPackage(vendorId:string, payload:CreateBasePackageDTO):Promise<void>
}