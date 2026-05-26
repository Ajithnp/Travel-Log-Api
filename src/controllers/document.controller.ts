import { inject, injectable } from 'tsyringe';
import { IDocumentService } from '../interfaces/service_interfaces/IDocumentService';
import { IApiResponse } from '../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../shared/constants/messages';
import expressAsyncHandler from 'express-async-handler';
import { IDocumentController } from '../interfaces/controller_interfaces/IDocumentController';
import { AppError } from '../errors/AppError';



@injectable()
export class DocumentController implements IDocumentController {
  constructor(
    @inject('IDocumentService')
    private _documentService: IDocumentService,
  ) {}

   getBookingTicket = expressAsyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { bookingId } = req.params as {bookingId:string};
    
    const { buffer, filename } = await this._documentService.getBookingTicket(bookingId, userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HTTP_STATUS.OK).send(buffer);
  });

}