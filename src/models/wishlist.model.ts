import { Schema, model } from 'mongoose';
import { IWishlistEntity } from 'types/entities/wishlist.entity';

export type WishlistDocument = IWishlistEntity & Document;

const wishlistSchema = new Schema<WishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    packages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Package',
      },
    ],
  },
  { timestamps: true },
);

export const WishlistModel = model<WishlistDocument>('Wishlist', wishlistSchema);
