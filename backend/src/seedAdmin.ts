/**
 * Run this script once to seed the first admin account.
 * Usage: npx ts-node src/seedAdmin.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import Admin from './models/Admin';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bohuroopi';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Admin.findOne({ email: 'admin@bohuroopi.com' });
    if (existing) {
      console.log('ℹ️  Admin already exists:', existing.email);
      process.exit(0);
    }

    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@bohuroopi.com',
      phone: '9999999999',
      password: 'admin123',
    });

    console.log('🎉 Admin created successfully!');
    console.log('   Email   :', admin.email);
    console.log('   Phone   :', admin.phone);
    console.log('   Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
