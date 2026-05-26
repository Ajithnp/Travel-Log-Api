import { inject, injectable } from 'tsyringe';
import { IDocumentService, TicketData } from '../interfaces/service_interfaces/IDocumentService';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { IBookingRepository } from '../interfaces/repository_interfaces/IBookingRepository';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { AppError } from '../errors/AppError';
import { BOOKING_STATUS } from '../shared/constants/booking';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { DocumentMapper } from '../shared/mappers/document.mapper';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { ITraveler, IBooking } from '../types/entities/booking.entity';
import { ISchedulePackageRepository } from '../interfaces/repository_interfaces/ISchedulePackage';

@injectable()
export class DocumentService implements IDocumentService {
  constructor(
    @inject('IBookingRepository')
    private _bookingRepo: IBookingRepository,
    @inject('ISchedulePackageRepository')
    private _scheduleRepo: ISchedulePackageRepository,
  ) {}

  async generateBookingInvoice(bookingId: string): Promise<Buffer> {
    const booking = await this._bookingRepo.findOneAndPopulate(bookingId);
    if (!booking) {
      throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const data = DocumentMapper.toBookingTicket(booking);

    //QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(bookingId, {
      type: 'png',
      width: 200,
      margin: 2,
      color: {
        dark: '#0A1628',
        light: '#FFFFFF',
      },
    });

    const pdfBuffer = await this.buildBookingTicketPDF(data, qrBuffer);

    return pdfBuffer;
  }

  async getBookingTicket(
    bookingId: string,
    userId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const booking = await this._bookingRepo.findByIdAndUserLean(bookingId, userId);
    if (!booking) {
      throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED_BY_USER) {
      throw new AppError(ERROR_MESSAGES.TICKET_NOT_AVAILABLE, HTTP_STATUS.BAD_REQUEST);
    }

    const buffer = await this.generateBookingInvoice(bookingId);
    return { buffer, filename: `Ticket-${booking.bookingCode}.pdf` };
  }

  async getScheduleBookingsCSV(
    scheduleId: string,
    vendorId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const schedule = await this._scheduleRepo.findOne({ _id: toObjectId(scheduleId) });
    if (!schedule) {
      throw new AppError(ERROR_MESSAGES.SCHEDULE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const bookings = await this._bookingRepo.findAll({
      scheduleId: toObjectId(scheduleId),
      vendorId: toObjectId(vendorId),
    } as Partial<IBooking>);

    if (!bookings || bookings.length === 0) {
      throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Build CSV
    const headers = [
      'Booking Code',
      'Lead Traveler',
      'Phone',
      'Group Type',
      'Traveler Count',
      'All Travelers',
      'Amount Paid (₹)',
      'Payment Status',
      'Booking Status',
      'Attended',
      'Attended At',
      'Booked On',
    ];
    const rows = bookings.map((b) => {
      const lead = b.travelers?.find((t: ITraveler) => t.isLead);
      const allNames = (b.travelers ?? []).map((t: ITraveler) => t.fullName).join(' | ');

      return [
        b.bookingCode ?? '',
        lead?.fullName ?? '',
        lead?.phoneNumber ?? '',
        b.groupType ?? '',
        b.travelerCount ?? 0,
        allNames,
        b.grossAmount ?? 0,
        b.paymentStatus ?? '',
        b.bookingStatus ?? '',
        b.isAttended ? 'Yes' : 'No',
        b.attendedAt ? new Date(b.attendedAt).toLocaleString('en-IN') : '',
        b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : '',
      ];
    });

    const escape = (val: string | number) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const csvLines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ];

    const csvString = csvLines.join('\n');
    const buffer = Buffer.from(csvString, 'utf-8');
    const filename = `Bookings_Schedule_${scheduleId}.csv`;

    return { buffer, filename };
  }

  private buildBookingTicketPDF(data: TicketData, qrBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 15, left: 48, right: 48 },
        info: {
          Title: `TravelLog Ticket — ${data.bookingCode}`,
          Author: 'TravelLog',
          Subject: data.packageTitle,
        },
      });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const NAVY = '#0A1628';
      const TEAL = '#0ACDAA';
      const GOLD = '#C9A84C';
      const LIGHT = '#EEF2F8';
      const TEXT2 = '#4A6280';
      const WHITE = '#FFFFFF';
      const MUTED = '#E8ECF4';

      const pageWidth = doc.page.width - 96;
      const pageLeft = 48;

      doc.rect(0, 0, doc.page.width, 90).fill(NAVY);

      doc
        .fillColor(WHITE)
        .font('Helvetica-Bold')
        .fontSize(22)
        .text('Travel', pageLeft, 28, { continued: true })
        .fillColor(GOLD)
        .text('Log');

      doc
        .fillColor('#8FA3BF')
        .font('Helvetica')
        .fontSize(9)
        .text('Your Adventure Awaits', pageLeft, 54);

      doc
        .fillColor(WHITE)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(data.bookingCode, 0, 30, { align: 'right', width: doc.page.width - 48 });

      doc
        .fillColor('#8FA3BF')
        .font('Helvetica')
        .fontSize(8)
        .text('BOOKING CODE', 0, 48, { align: 'right', width: doc.page.width - 48 });

      let y = 108;

      doc
        .fillColor(NAVY)
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(data.packageTitle, pageLeft, y, { width: pageWidth - 120 });

      y = doc.y + 4;

      doc
        .fillColor(TEXT2)
        .font('Helvetica')
        .fontSize(10)
        .text(
          `${data.packageLocation}, ${data.packageState}  ·  ${data.days} Days ${data.nights} Nights  ·  ${data.difficultyLevel}`,
          pageLeft,
          y,
        );

      y = doc.y + 4;

      doc.fillColor(TEXT2).fontSize(9).text(`Operated by: ${data.vendorName}`, pageLeft, y);

      y = doc.y + 16;

      doc
        .moveTo(pageLeft, y)
        .lineTo(pageLeft + pageWidth, y)
        .strokeColor(MUTED)
        .lineWidth(1)
        .stroke();
      y += 16;

      const col1 = pageLeft;
      const col2 = pageLeft + pageWidth / 2 + 10;

      const drawField = (
        label: string,
        value: string,
        x: number,
        currentY: number,
        width = 200,
      ) => {
        doc
          .fillColor(TEXT2)
          .font('Helvetica')
          .fontSize(8)
          .text(label.toUpperCase(), x, currentY, { width });

        doc
          .fillColor(NAVY)
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(value || '—', x, currentY + 11, { width });
      };

      drawField('Trip Start Date', data.startDate, col1, y);
      drawField('Trip End Date', data.endDate, col2, y);
      y += 38;

      drawField('Reporting Time', data.reportingTime, col1, y);
      drawField(
        'Group Type',
        `${data.groupType} · ${data.travelerCount} Traveler${data.travelerCount > 1 ? 's' : ''}`,
        col2,
        y,
      );
      y += 38;

      drawField('Reporting Location', data.reportingLocation, col1, y, pageWidth);
      y += 38;

      doc
        .moveTo(pageLeft, y)
        .lineTo(pageLeft + pageWidth, y)
        .strokeColor(MUTED)
        .lineWidth(1)
        .stroke();
      y += 16;

      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text('Travelers', pageLeft, y);

      y = doc.y + 8;

      // Table header
      doc.rect(pageLeft, y, pageWidth, 20).fill(LIGHT);

      const col = {
        name: pageLeft + 6,
        id: pageLeft + 220,
        idno: pageLeft + 310,
        lead: pageLeft + pageWidth - 50,
      };

      doc
        .fillColor(TEXT2)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('FULL NAME', col.name, y + 6)
        .text('ID TYPE', col.id, y + 6)
        .text('ID NUMBER', col.idno, y + 6)
        .text('ROLE', col.lead, y + 6);

      y += 22;

      // Table rows
      const sortedTravelers = [...data.travelers].sort(
        (a, b) => (b.isLead ? 1 : 0) - (a.isLead ? 1 : 0),
      );

      sortedTravelers.forEach((t, i) => {
        const rowBg = i % 2 === 0 ? WHITE : '#F8FAFC';
        doc.rect(pageLeft, y, pageWidth, 22).fill(rowBg);

        doc
          .fillColor(NAVY)
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(t.fullName, col.name, y + 6, { width: 200 });

        doc
          .fillColor(TEXT2)
          .font('Helvetica')
          .fontSize(9)
          .text(t.idType, col.id, y + 6, { width: 80 })
          .text(t.idNumber, col.idno, y + 6, { width: 90 });

        if (t.isLead) {
          doc
            .fillColor(TEAL)
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('LEAD', col.lead, y + 7);
        }

        y += 24;
      });

      y += 16;

      doc
        .moveTo(pageLeft, y)
        .lineTo(pageLeft + pageWidth, y)
        .strokeColor(MUTED)
        .lineWidth(1)
        .stroke();
      y += 16;

      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text('Payment Summary', pageLeft, y);

      y = doc.y + 8;

      const paymentRows = [
        ['Amount Paid', `₹${data.finalAmount.toLocaleString('en-IN')}`],
        ['Payment Method', data.paymentMethod ?? 'Online'],
        ['Transaction ID', data.transactionId ?? '—'],
        ['Booking Date', data.bookingDate],
      ];

      paymentRows.forEach(([label, value]) => {
        doc
          .fillColor(TEXT2)
          .font('Helvetica')
          .fontSize(9)
          .text(label, pageLeft, y, { width: 180 })
          .fillColor(NAVY)
          .font('Helvetica-Bold')
          .text(value, pageLeft + 200, y, { width: pageWidth - 200 });
        y += 16;
      });

      y += 10;

      if (data.inclusions.length > 0) {
        doc
          .moveTo(pageLeft, y)
          .lineTo(pageLeft + pageWidth, y)
          .strokeColor(MUTED)
          .lineWidth(1)
          .stroke();
        y += 14;

        doc
          .fillColor(NAVY)
          .font('Helvetica-Bold')
          .fontSize(11)
          .text("What's Included", pageLeft, y);

        y = doc.y + 6;

        const columns = 2;
        const colWidth = Math.floor(pageWidth / columns);

        data.inclusions.forEach((item, i) => {
          const x = pageLeft + (i % columns) * colWidth;
          if (i % columns === 0 && i > 0) y += 14;

          doc
            .fillColor(TEAL)
            .font('Helvetica-Bold')
            .fontSize(9)
            .text('✓ ', x, y, { continued: true, width: colWidth })
            .fillColor(TEXT2)
            .font('Helvetica')
            .text(item, { continued: false });
        });

        y = doc.y + 16;
      }

      //  QR
      const qrSize = 110;
      const qrX = doc.page.width - 48 - qrSize;
      const qrY = doc.page.height - 48 - qrSize - 30;

      doc.rect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 40).fill(LIGHT);

      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      doc
        .fillColor(TEXT2)
        .font('Helvetica')
        .fontSize(7)
        .text('Scan for attendance', qrX - 8, qrY + qrSize + 6, {
          width: qrSize + 16,
          align: 'center',
        });

      doc
        .fillColor(TEXT2)
        .fontSize(7)
        .text('verification', qrX - 8, doc.y, {
          width: qrSize + 16,
          align: 'center',
        });

      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(NAVY);

      doc
        .fillColor('#8FA3BF')
        .font('Helvetica')
        .fontSize(8)
        .text(
          'This is your official travel ticket. Present this at the reporting location.',
          pageLeft,
          doc.page.height - 27,
          { width: doc.page.width - 200, align: 'left', lineBreak: false },
        );

      doc
        .fillColor(WHITE)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('travellog.com', 0, doc.page.height - 27, {
          width: doc.page.width - 48,
          align: 'right',
          lineBreak: false,
        });

      doc.end();
    });
  }
}
