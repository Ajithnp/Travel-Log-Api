import { RecentFiveBookingsPopulated } from "../../types/entities/booking.entity";
import { IWishlistPackagePreferencePopulated } from "../../types/entities/wishlist.entity";

export interface PreferenceProfile {
    bookedPackageIds: string[];
    bookedLocations: string[];
    bookedStates: string[];
    wishlistLocations: string[];
    wishlistStates: string[];
    difficulties: string[];
    travelStyle: string | null;
    avgBudget: number | null;
    hasHistory: boolean;
    hasWishlist: boolean;
}

export function buildPreferenceProfile(
    bookings: RecentFiveBookingsPopulated[], 
    wishlist: IWishlistPackagePreferencePopulated[] | null
): PreferenceProfile {

    const bookedPackageIds = bookings.map((b) => b.packageId?._id?.toString()).filter(Boolean) as string[];

    const amounts = bookings.map((b) => b.finalAmount).filter(Boolean) as number[];
    const avgBudget = amounts.length
        ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length)
        : null;

    const groupTypes = bookings.map((b) => b.groupType).filter(Boolean) as string[];
    const travelStyle = groupTypes.length
        ? groupTypes
            .sort(
                (a, b) =>
                    groupTypes.filter((v) => v === b).length -
                    groupTypes.filter((v) => v === a).length,
            )
            .at(0) || null
        : null;

    const bookedLocations = bookings
        .map((b) => b.packageId?.location)
        .filter(Boolean) as string[];

    const bookedStates = bookings
        .map((b) => b.packageId?.state)
        .filter(Boolean) as string[];

    const difficulties = bookings
        .map((b) => b.packageId?.difficultyLevel)
        .filter(Boolean) as string[];

    const wishlistPackages = wishlist || [];
    const wishlistLocations = wishlistPackages
        .map((p) => p.location)
        .filter(Boolean) as string[];

    const wishlistStates = wishlistPackages
        .map((p) => p.state)
        .filter(Boolean) as string[];

    return {
        bookedPackageIds,
        bookedLocations: [...new Set(bookedLocations)],
        bookedStates: [...new Set(bookedStates)],
        wishlistLocations: [...new Set(wishlistLocations)],
        wishlistStates: [...new Set(wishlistStates)],
        difficulties: [...new Set(difficulties)],
        travelStyle,
        avgBudget,
        hasHistory: bookings.length > 0,
        hasWishlist: wishlistPackages.length > 0,
    };
}