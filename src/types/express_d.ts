import { ITokenPayload } from '../interfaces/service_interfaces/ITokenService';

declare module 'express-serve-static-core' {
  interface Request {
    file?: Express.Multer.File; // single upload
    files?:
    | Express.Multer.File[] // multiple
    | { [fieldname: string]: Express.Multer.File[] }; // for upload.fields
    user: ITokenPayload;
  }
}
