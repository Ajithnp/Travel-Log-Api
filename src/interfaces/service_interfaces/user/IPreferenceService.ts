import { RecentFiveBookingsPopulated as Bookings } from '../../../types/entities/booking.entity';
import { IWishlistPackagePreferencePopulated as Wishlist } from '../../../types/entities/wishlist.entity';
import { PreferenceProfile } from '../../../shared/utils/user-preference-build';

export interface IUserPreferenceService {
  fetchUserPreferences(userId: string): Promise<FetchUserPreferencesResult>;
  generatePreferenceSummary(profile: PreferenceProfile): Promise<string>;
}

export interface FetchUserPreferencesResult {
  bookings: Bookings[];
  wishlist: Wishlist[] | null;
}
