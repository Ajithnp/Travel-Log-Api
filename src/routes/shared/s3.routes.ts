import { inject, injectable } from 'tsyringe';
import BaseRoute from '../base.route';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { IS3Controller } from '../../interfaces/controller_interfaces/IS3Controller';

@injectable()
export class S3Routes extends BaseRoute {
  constructor(
    @inject('IS3Controller')
    private _s3Controller: IS3Controller,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.get(
      '/file-url',
      // isAuthenticated,
      this._s3Controller.generateDownloadURL.bind(this._s3Controller),
    );

    this._router.post(
      '/upload-url',
      // isAuthenticated,
      this._s3Controller.generateUploadURL.bind(this._s3Controller),
    );
  }
}
