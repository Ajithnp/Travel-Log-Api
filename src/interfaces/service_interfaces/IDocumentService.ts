export interface IDocumentService {
    generateBookingInvoice(bookingId: string): Promise<Buffer>;

    getBookingTicket(bookingId: string, userId: string): Promise<{ buffer: Buffer; filename: string }>;

}

export interface TicketData {
  bookingId:         string
  bookingCode:       string
  packageTitle:      string
  packageLocation:   string
  packageState:      string
  difficultyLevel:   string
  days:              string
  nights:            string
  vendorName:        string
  startDate:         string
  endDate:           string
  reportingTime:     string
  reportingLocation: string
  groupType:         string
  travelerCount:     number
  travelers:         Array<{
    fullName: string
    isLead:   boolean
    idType:   string
    idNumber: string
  }>
  grossAmount:       number
  finalAmount:       number
  paymentMethod:     string | null
  transactionId:     string | null
  inclusions:        string[]
  bookingDate:       string
}