import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: { url: string; public_id: string };
  description?: string;
  order: number;
}

const categorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: {
      url: String,
      public_id: String,
    },
    description: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', categorySchema);
