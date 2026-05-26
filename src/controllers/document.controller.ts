import { inject, injectable } from 'tsyringe';
import { IDocumentService } from '../interfaces/service_interfaces/IDocumentService';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import expressAsyncHandler from 'express-async-handler';
import { IDocumentController } from '../interfaces/controller_interfaces/IDocumentController';

@injectable()
export class DocumentController implements IDocumentController {
  constructor(
    @inject('IDocumentService')
    private _documentService: IDocumentService,
  ) {}

  getBookingTicket = expressAsyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { bookingId } = req.params as { bookingId: string };

    const { buffer, filename } = await this._documentService.getBookingTicket(bookingId, userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HTTP_STATUS.OK).send(buffer);
  });

  getScheduleBookingsCSV = expressAsyncHandler(async (req, res) => {
    const { scheduleId } = req.params as { scheduleId: string };
    const userId = req.user?.id;

    const { buffer, filename } = await this._documentService.getScheduleBookingsCSV(
      scheduleId,
      userId,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HTTP_STATUS.OK).send(buffer);
  });
}
