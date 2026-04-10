import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  supportWhatsApp?: string;
  officeAddress?: string;
  shippingFee: number;
  freeShippingThreshold: number;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  metaDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  codCharges: number;
  shippingSlabs: {
    minWeight: number;
    maxWeight: number;
    price: number;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

const settingsSchema: Schema = new Schema(
  {
    storeName: { type: String, required: true, default: 'Bohuroopi' },
    supportEmail: { type: String, required: true, default: 'support@bohuroopi.com' },
    supportPhone: { type: String, required: true, default: '+91' },
    supportWhatsApp: { type: String },
    officeAddress: { type: String },
    shippingFee: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    socialLinks: {
      instagram: { type: String },
      facebook: { type: String },
      twitter: { type: String },
      youtube: { type: String },
    },
    metaDescription: { type: String },
    logoUrl: { type: String },
    faviconUrl: { type: String },
    codCharges: { type: Number, default: 0 },
    shippingSlabs: [
      {
        minWeight: { type: Number, required: true },
        maxWeight: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
