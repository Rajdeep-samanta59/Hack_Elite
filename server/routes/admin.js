const express = require('express');
const router = express.Router();
const { auth, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// List all doctors
router.get('/doctors', auth, authorizeAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().lean();
    res.json({ doctors });
  } catch (err) {
    console.error('Admin list doctors error:', err);
    res.status(500).json({ message: 'Failed to list doctors' });
  }
});


// Create doctor (admin)
// Admin-side doctor creation disabled: doctors must register themselves.
router.post('/doctors', auth, authorizeAdmin, async (req, res) => {
  return res.status(405).json({ message: 'Doctor creation via admin panel is disabled. Doctors must register themselves.' });
});

// Delete doctor by id
router.delete('/doctors/:id', auth, authorizeAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await Doctor.findByIdAndDelete(id);
    // Notify connected clients that doctors list changed
    try {
      const io = req.app.get('io');
      if (io) io.emit('doctors-updated');
    } catch (e) {
      console.error('Emit doctors-updated failed', e);
    }
    res.json({ message: 'Doctor removed' });
  } catch (err) {
    console.error('Admin delete doctor error:', err);
    res.status(500).json({ message: 'Failed to remove doctor' });
  }
});

module.exports = router;
