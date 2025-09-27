import { Request } from 'express';
import { ITokenPayload } from '../interfaces/service_interfaces/ITokenService';

declare module 'express-serve-static-core' {
  interface Request {
    user?: ITokenPayload;
    file?: Express.Multer.File; // single upload
    files?:
    | Express.Multer.File[] // multiple
    | { [fieldname: string]: Express.Multer.File[] }; // for upload.fields
   
  }
}
