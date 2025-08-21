const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function main() {
  const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/eye-health-system';
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const email = process.argv[2] || 'admin@medielite.test';
  const phone = process.argv[3] || '+10000000000';
  const password = process.argv[4] || 'AdminPass123!';

  let user = await User.findOne({ email });
  if (user) {
    console.log('Admin user already exists:', email);
    console.log('If you want to change password, update in DB or create a new user.');
    process.exit(0);
  }

  user = new User({ email, phone, password, role: 'admin' });
  await user.save();
  console.log('Admin user created');
  console.log({ email, phone, password });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
