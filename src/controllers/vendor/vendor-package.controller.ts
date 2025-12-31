import asyncHandler from "express-async-handler";
import { inject, injectable } from 'tsyringe';
import { IVendorPackageController } from "../../interfaces/controller_interfaces/vendor/IVendorPackageController";
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { IPackageService } from "../../interfaces/service_interfaces/vendor/IPackageService";
import { IApiResponse } from 'types/common/IApiResponse';
import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";


@injectable()
export class VendorPackageController implements IVendorPackageController {

    constructor(
        @inject('IPackageService')
         private _packageService: IPackageService,
    ) { }
    
    createPackage = asyncHandler(
        async (req, res) => {
            const vendorId = req.user?.id!;
            const createPackagePayload = req.body;

            await this._packageService.createPackage(vendorId, createPackagePayload);

            const successResponse: IApiResponse = {
                success: SUCCESS_STATUS.SUCCESS,
                message: SUCCESS_MESSAGES.PACKAGE_CREATION_SUCCESS
            };
            res.status(HTTP_STATUS.CREATED).json(successResponse)
        }
    )
}