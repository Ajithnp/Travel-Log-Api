import mongoose from "mongoose";

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
  wishlisted: boolean;   // true = added, false = removed
  packageId: string;
}

export interface IWishlistIdsResponse {
  wishlistedPackageIds: string[];
}