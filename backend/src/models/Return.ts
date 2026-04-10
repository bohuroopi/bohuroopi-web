import mongoose, { Schema, Document } from 'mongoose';

export interface IReturn extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    reason: string;
    image?: string;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'received' | 'refunded';
  refundAmount: number;
  adminComment?: string;
  requestedAt: Date;
}

const returnSchema: Schema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, required: true, ref: 'Order' },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [
      {
        product: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        reason: { type: String, required: true },
        image: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'received', 'refunded'],
      default: 'pending',
    },
    refundAmount: { type: Number, default: 0 },
    adminComment: String,
  },
  { timestamps: true }
);

export default mongoose.model<IReturn>('Return', returnSchema);
