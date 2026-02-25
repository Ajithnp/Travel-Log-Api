// shared/database/objectId.helper.ts

import { Types } from 'mongoose';
import { AppError } from '../../../errors/AppError';
import { HTTP_STATUS } from '../../../shared/constants/http_status_code';

export const toObjectId = (id: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ObjectId format', HTTP_STATUS.BAD_REQUEST);
  }

  return new Types.ObjectId(id);
};
