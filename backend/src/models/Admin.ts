import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'super_admin' | 'sub_admin';
}

const adminSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['super_admin', 'sub_admin'], default: 'sub_admin' },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>('Admin', adminSchema);
