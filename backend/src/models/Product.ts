import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;         // legacy / kept for backward compat
  shortDescription: string;
  longDescription?: string;
  price: number;
  discountPrice?: number;
  category: mongoose.Types.ObjectId;
  images: { url: string; public_id: string }[];
  variants: {
    color: string;
    size?: string;
    material: string;
    stock: number;
  }[];
  occasion: string[];
  style: string[];
  ratings: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  tags: string[];
  weight?: string;
  primaryMaterial?: string;
  colorFinish?: string;
}

const productSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },           // legacy — kept for backward compat
    shortDescription: { type: String, required: true },
    longDescription: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    variants: [
      {
        color: String,
        size: String,
        material: String,
        stock: { type: Number, default: 0 },
      },
    ],
    occasion: [{ type: String }],
    style: [{ type: String }],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    weight: { type: String },
    primaryMaterial: { type: String },
    colorFinish: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', productSchema);
