import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  author: string;
  image: { url: string; public_id: string };
  tags: string[];
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

const blogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Bohuroopi' },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>('Blog', blogSchema);
