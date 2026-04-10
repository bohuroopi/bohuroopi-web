import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;

  googleId?: string;
  avatar?: string;
  wishlist: mongoose.Types.ObjectId[];
  addresses: {
    fullName?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
    type?: string;
  }[];
  cart: {
    product: mongoose.Types.ObjectId;
    qty: number;
    color?: string;
    size?: string;
    mrp?: number;
    slug?: string;
    addedAt?: Date;
  }[];
  lastLogin?: Date;
  comparePassword(password: string): Promise<boolean>;
}


const userSchema: Schema = new Schema(
  {
    name: { type: String, default: 'Customer' },
    email: { type: String },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },

    googleId: { type: String },
    avatar: { type: String },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    addresses: [
      {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isDefault: { type: Boolean, default: false },
        type: { type: String, default: 'Home' },
      },
    ],
    cart: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        qty: { type: Number, default: 1 },
        color: { type: String },
        size: { type: String },
        mrp: { type: Number },
        slug: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    lastLogin: { type: Date },

  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  const user = this as any;
  if (!user.isModified('password') || !user.password) return;
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (password: string) {
  const user = this as any;
  if (!user.password) return false;
  return await bcrypt.compare(password, user.password);
};

export default mongoose.model<IUser>('User', userSchema);
