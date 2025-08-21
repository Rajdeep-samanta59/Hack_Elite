const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Doctor = require('../models/Doctor');

async function main() {
  const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/eye-health-system';
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for admin smoke');

  // Ensure admin exists
  const adminEmail = 'admin@medielite.test';
  const admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    console.log('Admin user not found. Please run create_admin.js first.');
    process.exit(1);
  }

  // List doctors
  const doctorsBefore = await Doctor.find().lean();
  console.log('Doctors before:', doctorsBefore.length);

  // Create a test doctor user+doc
  const email = 'docx@gmail.com';
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, phone: '987654321', password: '123456', role: 'doctor' });
    await user.save();
  }
  

  const doc = new Doctor({ userId: user._id, fullName: 'Dr Smoke Test', phone: '+19990000000', email, specialty: 'General', clinic: 'Smoke Clinic', imageUrl: null });
  await doc.save();
  console.log('Created doctor:', doc._id);

  const doctorsAfter = await Doctor.find().lean();
  console.log('Doctors after:', doctorsAfter.length);

  // Delete the doctor
  await Doctor.findByIdAndDelete(doc._id);
  await User.findByIdAndDelete(user._id);
  console.log('Deleted test doctor and user');

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
