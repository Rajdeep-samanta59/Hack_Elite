const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Public listing of doctors (for patients)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'fullName email').lean();
    res.json(doctors.map(d => ({
      id: d._id,
      fullName: d.fullName,
      email: d.email,
      specialty: d.specialty,
      clinic: d.clinic,
      imageUrl: d.imageUrl || null
    })));
  } catch (err) {
    console.error('Get doctors error:', err);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
});

module.exports = router;
