import { ISchedule } from "../../../types/entities/schedule.entity";
import { PricingTierDTO } from "../../../types/dtos/vendor/response.dtos";
import { IBasePackageEntity } from "../../../types/entities/base-package.entity";


//Package + Schedule data → human readable text
export function buildCombinedText(pkg: IBasePackageEntity, schedule: ISchedule): string {

    const seatsAvailable = schedule.totalSeats - schedule.seatsBooked;

    const pricingText = schedule.pricing
        .map((p: PricingTierDTO) => `${p.type} ₹${p.price} for ${p.peopleCount} person(s)`)
        .join(', ');

    const startDate = new Date(schedule.startDate).toDateString();
    const endDate = new Date(schedule.endDate).toDateString();

    return `
    Trip Title: ${pkg.title}
    Location: ${pkg.location}, ${pkg.state}
    Difficulty Level: ${pkg.difficultyLevel}
    Duration: ${pkg.days} days and ${pkg.nights} nights
    Description: ${pkg.description}
    Unique Selling Point: ${pkg.usp || ''}
    Inclusions: ${pkg?.inclusions?.join(', ') || ' '}
    Exclusions: ${pkg?.exclusions?.join(', ') || ' '}
    Packing List: ${pkg?.packingList?.join(', ') || ' '}
    Average Rating: ${pkg?.averageRating} (${pkg?.totalReviews} reviews)

    Schedule Start Date: ${startDate}
    Schedule End Date: ${endDate}
    Reporting Time: ${schedule.reportingTime}
    Reporting Location: ${schedule.reportingLocation}
    Pricing Options: ${pricingText}
    Total Seats: ${schedule.totalSeats}
    Seats Available: ${seatsAvailable}
    Schedule Notes: ${schedule.notes || 'None'}
  `.trim();
}