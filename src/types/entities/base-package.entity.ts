import { Document, Types } from 'mongoose';

/* ---------- File ---------- */
export interface IFile {
  key: string;
  fieldName: string;
}


/* ---------- Activity ---------- */
export type ActivityType =
  | "travel"
  | "meal"
  | "stay"
  | "sightseeing"
  | "activity"
  | "free";

export interface Activity {
  startTime: string;        // "09:00"
  endTime: string;          // "12:00"
  title: string;            // "Edakkal Caves Visit"
  description?: string;
  location: string;
  type: ActivityType
  included: boolean;
}

/* ---------- Day Itinerary ---------- */
export interface DayItinerary {
  dayNumber: number;        // 1, 2, 3
  title: string;            // "Arrival & Exploration"
  activities: Activity[];
}

/* ---------- Enums ---------- */
export type PackageCategory =
  | "weekend"
  | "adventure"
  | "family"
  | "honeymoon";

export type DifficultyLevel =
  | "easy"
  | "moderate"
  | "hard";

/* ---------- Base Package ---------- */  
export interface IBasePackage extends Document{
  vendorId: Types.ObjectId;

  title: string;
  location: string;           // "Wayanad, Kerala"
  category: PackageCategory

  images: IFile[];

  duration: {
    days: number;
    nights: number;
  };

  basePrice: number;          // reference price
  description: string;

  itinerary: DayItinerary[];  // DEFAULT itinerary

  inclusions: string[];
  exclusions: string[];

  difficultyLevel: DifficultyLevel
  isActive: boolean;

}
