import { TicketData } from "../../interfaces/service_interfaces/IDocumentService"
import { ITicketPopulatedBooking } from "../../types/entities/booking.entity"

export class DocumentMapper {

    static toBookingTicket(booking: ITicketPopulatedBooking): TicketData {
        const pkg = booking.packageId
        const sched = booking.scheduleId
        const vendor = booking.vendorId

        const formatDate = (d: Date | string | null | undefined): string => {
            if (!d) return '—'
            const date = new Date(d)
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            })
        }

        return {
            bookingId: booking._id.toString(),
            bookingCode: booking.bookingCode ?? '',
            packageTitle: pkg?.title ?? 'Trip',
            packageLocation: pkg?.location ?? '',
            packageState: pkg?.state ?? '',
            difficultyLevel: pkg?.difficultyLevel ?? '',
            days: pkg?.days?.toString() ?? '',
            nights: pkg?.nights?.toString() ?? '',
            vendorName: vendor?.name ?? '',
            startDate: formatDate(sched?.startDate),
            endDate: formatDate(sched?.endDate),
            reportingTime: sched?.reportingTime ?? '',
            reportingLocation: sched?.reportingLocation ?? '',
            groupType: booking.groupType ?? '',
            travelerCount: booking.travelerCount ?? 0,
            travelers: (booking.travelers ?? []).map((t) => ({
                fullName: t.fullName ?? '',
                isLead: t.isLead ?? false,
                idType: t.idType ?? '',
                idNumber: t.idNumber ?? '',
            })),
            grossAmount: booking.grossAmount ?? 0,
            finalAmount: booking.finalAmount ?? 0,
            paymentMethod: booking.paymentMethod ?? null,
            transactionId: booking.transactionId ?? null,
            inclusions: pkg?.inclusions ?? [],
            bookingDate: formatDate(booking.createdAt),
        }
    }
    
}