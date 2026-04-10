import mongoose, { Schema, Document } from 'mongoose';

export interface IHomepageSection extends Document {
  type: 'hero' | 'categories' | 'products' | 'banner';
  selectionType: 'manual' | 'category';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
  items: string[]; // Product IDs or Category IDs
  order: number;
  isActive: boolean;
}

const homepageSectionSchema: Schema = new Schema(
  {
    type: { 
      type: String, 
      required: true, 
      enum: ['hero', 'categories', 'products', 'banner'] 
    },
    selectionType: {
      type: String,
      enum: ['manual', 'category'],
      default: 'manual'
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    imageUrl: { type: String },
    link: { type: String },
    items: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IHomepageSection>('HomepageSection', homepageSectionSchema);
