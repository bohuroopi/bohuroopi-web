import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  image: string;
  price: number;
  color?: string;
  size?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: {
    fullName?: string;
    phone?: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult: {
    id: string;
    status: string;
    update_time: string;
    email_address?: string;
  };
  couponCode?: string;
  discountPrice: number;
  shippingPrice: number;
  codPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'cancel_requested';
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  trackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
      {
        product: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        color: String,
        size: String,
      },
    ],
    shippingAddress: {
      fullName: { type: String },
      phone: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    couponCode: String,
    discountPrice: { type: Number, default: 0.0 },
    shippingPrice: { type: Number, default: 0.0 },
    codPrice: { type: Number, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: Date,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cancel_requested'],
      default: 'pending',
    },
    shiprocketOrderId: String,
    shiprocketShipmentId: String,
    awbCode: String,
    trackingUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', orderSchema);
