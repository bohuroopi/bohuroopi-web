import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatar?: string;
  comparePassword(password: string): Promise<boolean>;
}

const adminSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre('save', async function () {
  const admin = this as any;
  if (!admin.isModified('password') || !admin.password) return;
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
});

// Compare password
adminSchema.methods.comparePassword = async function (password: string) {
  const admin = this as any;
  if (!admin.password) return false;
  return await bcrypt.compare(password, admin.password);
};

export default mongoose.model<IAdmin>('Admin', adminSchema);
