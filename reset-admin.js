const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the backend .env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI not found in backend/.env");
  process.exit(1);
}

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  role: { type: String, enum: ['super_admin', 'sub_admin'], default: 'sub_admin' },
}, { timestamps: true, collection: 'admins' });

const Admin = mongoose.model('Admin', adminSchema);

async function reset() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    console.log("Purging all existing admins...");
    const deleteCount = await Admin.deleteMany({});
    console.log(`Successfully removed ${deleteCount.deletedCount} admin(s).`);

    console.log("Creating new Super Admin...");
    const newAdmin = await Admin.create({
      name: 'Social Bohuroopi',
      email: 'social.bohuroopi@gmail.com',
      phone: '9999999999',
      role: 'super_admin'
    });

    console.log("-----------------------------------------");
    console.log("SUCCESS: New Super Admin Created");
    console.log(`ID: ${newAdmin._id}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Role: ${newAdmin.role}`);
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("CRITICAL ERROR:", err.message);
    process.exit(1);
  }
}

reset();
