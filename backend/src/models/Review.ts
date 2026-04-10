import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  images?: { url: string; public_id: string }[];
  isVerifiedPurchase: boolean;
}

const reviewSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    product: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', reviewSchema);
