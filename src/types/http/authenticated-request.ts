import { Request } from 'express';
import { ITokenPayload } from '../../interfaces/service_interfaces/ITokenService';

export interface IAuthenticatedRequest extends Request {
  user: ITokenPayload;
}