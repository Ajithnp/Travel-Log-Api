import { Schema , model} from "mongoose";
import { IWishlistEntity } from "types/entities/wishlist.entity";

const wishlistSchema = new Schema<IWishlistEntity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
       unique: true, 
       index: true
    },
    packages: [
      {
        type: Schema.Types.ObjectId,
         ref: "Package",
      },
    ],
  },
  { timestamps: true }
);


export const WishlistModel = model<IWishlistEntity>('Wishlist', wishlistSchema);