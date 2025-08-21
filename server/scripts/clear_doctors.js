const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('../models/Doctor');
const User = require('../models/User');

async function main() {
  const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/eye-health-system';
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const doctors = await Doctor.find().lean();
  if (!doctors.length) {
    console.log('No doctors to remove');
    process.exit(0);
  }

  for (const d of doctors) {
    await Doctor.findByIdAndDelete(d._id);
    // Optionally remove associated user
    if (d.userId) {
      await User.findByIdAndDelete(d.userId);
    }
    console.log('Removed doctor', d._id);
  }

  console.log('All doctors removed');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
