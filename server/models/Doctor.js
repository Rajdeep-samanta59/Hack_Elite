const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: null },
  specialty: { type: String, default: null },
  clinic: { type: String, default: null },
  imageUrl: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
