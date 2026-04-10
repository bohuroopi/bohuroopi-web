import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'flat' | 'percentage';
  discountAmount: number;
  minPurchase: number;
  maxDiscount?: number;
  expiryDate: Date;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
}

const couponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['flat', 'percentage'], required: true },
    discountAmount: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: Number,
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 0 }, // 0 means unlimited
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>('Coupon', couponSchema);
