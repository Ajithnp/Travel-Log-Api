import { inject, injectable } from 'tsyringe';
import { IContactController } from '../interfaces/controller_interfaces/IContactController';
import {
  CreateContactRequestDTO,
  IContactService,
} from '../interfaces/service_interfaces/IContactService';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { IApiResponse } from '../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../shared/constants/messages';
import { getPaginationOptions } from '../shared/utils/pagination.helper';
import { ContactStatus } from '../shared/constants/constants';

@injectable()
export class ContactController implements IContactController {
  constructor(
    @inject('IContactService')
    private readonly _contactService: IContactService,
  ) {}

  createContact = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateContactRequestDTO = {
      userId: req.user?.id || null,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message,
      isGuest: req.user?.id ? true : false,
    };

    await this._contactService.createContact(payload);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  contactEnquiries = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search } = getPaginationOptions(req);
    const status = req.query.status as ContactStatus;

    const data = await this._contactService.contactEnquiries(page, limit, search, status);

    const successResponse: IApiResponse<typeof data> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  updateEnquiry = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { enquiryId } = req.params;

    const data = await this._contactService.updateEnquiry(enquiryId);

    const successResponse: IApiResponse<typeof data> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
