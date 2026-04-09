import mongoose from 'mongoose';

export interface IWishlistEntity {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  packages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// types

export interface IWishlist {
  _id: string;
  userId: string;
  packages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlistToggleResponse {
  wishlisted: boolean; // true = added, false = removed
  packageId: string;
}

export interface IWishlistIdsResponse {
  wishlistedPackageIds: string[];
}

export interface IWishlistPackagePopulated {
  _id: mongoose.Types.ObjectId;
  title: string;
  location: string;
  state: string;
  categoryId: {
    _id: mongoose.Types.ObjectId;
    name: string;
  } | null;
  difficultyLevel: string;
  days: string;
  nights: string;
  basePrice: string;
  images: { key: string }[];
  isActive: boolean;
  status: string;
  hasUpcomingSchedule: boolean;
}

export interface IWishlistPopulatedDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  packages: IWishlistPackagePopulated[];
  totalCount: number;
  hasNextPage: boolean;
}

export interface WishlistImageDTO {
  key: string;
}

export interface IWishlistItem {
  packageId: string;
  title: string;
  location: string;
  state: string;
  category: string;
  difficultyLevel: string;
  hasUpcomingSchedule: boolean;
  days: string;
  nights: string;
  basePrice: string;
  images: WishlistImageDTO[];
}

export interface IWishlistResponse {
  data: IWishlistItem[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
