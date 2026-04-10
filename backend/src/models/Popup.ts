import mongoose, { Schema, Document } from 'mongoose';

export interface IPopup extends Document {
  title?: string;
  message?: string;
  imageUrl: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  type?: 'sale' | 'newsletter' | 'info';
  showOnPage?: string; // 'all', 'home', etc.
  order: number;
}

const popupSchema: Schema = new Schema(
  {
    title: { type: String, default: 'Popup' },
    message: { type: String },
    imageUrl: { type: String, required: true },
    link: { type: String },
    buttonText: { type: String, default: 'Shop Now' },
    isActive: { type: Boolean, default: false },
    type: { 
      type: String, 
      enum: ['sale', 'newsletter', 'info'], 
      default: 'sale' 
    },
    showOnPage: { type: String, default: 'home' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IPopup>('Popup', popupSchema);
