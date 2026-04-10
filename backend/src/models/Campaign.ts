import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  type: 'email' | 'whatsapp';
  subject?: string;
  content: string;
  targetAudience: 'all' | 'past_buyers' | 'abandoned_carts' | 'newsletter_subs';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentAt?: Date;
}

const campaignSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['email', 'whatsapp'] },
    subject: { type: String },
    content: { type: String, required: true },
    targetAudience: { 
      type: String, 
      required: true, 
      enum: ['all', 'past_buyers', 'abandoned_carts', 'newsletter_subs'] 
    },
    status: { type: String, required: true, enum: ['draft', 'scheduled', 'sent', 'failed'], default: 'draft' },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ICampaign>('Campaign', campaignSchema);
