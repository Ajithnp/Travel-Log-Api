import { inject, injectable } from "tsyringe";
import upload from "../../middlewares/multer";
import { BaseRoute } from "../../routes/base.routes";
import { IVendorController } from "../../interfaces/controller_interfaces/IVendorController";

@injectable()
export class VendorRoutes extends BaseRoute{

    constructor(
        @inject("IVendorController")
        private _vendorController : IVendorController,
    ) {
        super()
        this.initializeRoutes()
    }

    protected initializeRoutes(): void {
        
        this._router.post(
            '/vendor-verification',
            upload.fields([
                { name: "businessLicence", maxCount: 1 },
                { name: "businessPan", maxCount: 1 },
                { name: "companyLogo", maxCount: 1 },
            ]),
            this._vendorController.vendorVerificationSubmit.bind(this._vendorController)

        );
    }

}