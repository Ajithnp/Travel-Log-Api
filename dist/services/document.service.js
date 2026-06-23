"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const tsyringe_1 = require("tsyringe");
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const http_status_code_1 = require("../shared/constants/http_status_code");
const AppError_1 = require("../errors/AppError");
const booking_1 = require("../shared/constants/booking");
const messages_1 = require("../shared/constants/messages");
const document_mapper_1 = require("../shared/mappers/document.mapper");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
let DocumentService = class DocumentService {
    constructor(_bookingRepo, _scheduleRepo) {
        this._bookingRepo = _bookingRepo;
        this._scheduleRepo = _scheduleRepo;
    }
    generateBookingInvoice(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepo.findOneAndPopulate(bookingId);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const data = document_mapper_1.DocumentMapper.toBookingTicket(booking);
            //QR code as PNG buffer
            const qrBuffer = yield qrcode_1.default.toBuffer(bookingId, {
                type: 'png',
                width: 200,
                margin: 2,
                color: {
                    dark: '#0A1628',
                    light: '#FFFFFF',
                },
            });
            const pdfBuffer = yield this.buildBookingTicketPDF(data, qrBuffer);
            return pdfBuffer;
        });
    }
    getBookingTicket(bookingId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepo.findByIdAndUserLean(bookingId, userId);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (booking.bookingStatus === booking_1.BOOKING_STATUS.CANCELLED_BY_USER) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.TICKET_NOT_AVAILABLE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const buffer = yield this.generateBookingInvoice(bookingId);
            return { buffer, filename: `Ticket-${booking.bookingCode}.pdf` };
        });
    }
    getScheduleBookingsCSV(scheduleId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield this._scheduleRepo.findOne({ _id: (0, objectId_helper_1.toObjectId)(scheduleId) });
            if (!schedule) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const bookings = yield this._bookingRepo.findAll({
                scheduleId: (0, objectId_helper_1.toObjectId)(scheduleId),
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
            });
            if (!bookings || bookings.length === 0) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
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
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const lead = (_a = b.travelers) === null || _a === void 0 ? void 0 : _a.find((t) => t.isLead);
                const allNames = ((_b = b.travelers) !== null && _b !== void 0 ? _b : []).map((t) => t.fullName).join(' | ');
                return [
                    (_c = b.bookingCode) !== null && _c !== void 0 ? _c : '',
                    (_d = lead === null || lead === void 0 ? void 0 : lead.fullName) !== null && _d !== void 0 ? _d : '',
                    (_e = lead === null || lead === void 0 ? void 0 : lead.phoneNumber) !== null && _e !== void 0 ? _e : '',
                    (_f = b.groupType) !== null && _f !== void 0 ? _f : '',
                    (_g = b.travelerCount) !== null && _g !== void 0 ? _g : 0,
                    allNames,
                    (_h = b.grossAmount) !== null && _h !== void 0 ? _h : 0,
                    (_j = b.paymentStatus) !== null && _j !== void 0 ? _j : '',
                    (_k = b.bookingStatus) !== null && _k !== void 0 ? _k : '',
                    b.isAttended ? 'Yes' : 'No',
                    b.attendedAt ? new Date(b.attendedAt).toLocaleString('en-IN') : '',
                    b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : '',
                ];
            });
            const escape = (val) => {
                const str = String(val !== null && val !== void 0 ? val : '');
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
        });
    }
    buildBookingTicketPDF(data, qrBuffer) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            const chunks = [];
            const doc = new pdfkit_1.default({
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
                .text(`${data.packageLocation}, ${data.packageState}  ·  ${data.days} Days ${data.nights} Nights  ·  ${data.difficultyLevel}`, pageLeft, y);
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
            const drawField = (label, value, x, currentY, width = 200) => {
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
            drawField('Group Type', `${data.groupType} · ${data.travelerCount} Traveler${data.travelerCount > 1 ? 's' : ''}`, col2, y);
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
            const sortedTravelers = [...data.travelers].sort((a, b) => (b.isLead ? 1 : 0) - (a.isLead ? 1 : 0));
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
                ['Payment Method', (_a = data.paymentMethod) !== null && _a !== void 0 ? _a : 'Online'],
                ['Transaction ID', (_b = data.transactionId) !== null && _b !== void 0 ? _b : '—'],
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
                    if (i % columns === 0 && i > 0)
                        y += 14;
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
                .text('This is your official travel ticket. Present this at the reporting location.', pageLeft, doc.page.height - 27, { width: doc.page.width - 200, align: 'left', lineBreak: false });
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
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(1, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __metadata("design:paramtypes", [Object, Object])
], DocumentService);
