const express = require('express');
const { auth, authorizePatient } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);
router.use(authorizePatient);

// Get available appointment slots
router.get('/available', async (req, res) => {
  try {
    const { date, doctorId, type } = req.query;

    // Mock available slots
    const availableSlots = [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: false },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true }
    ];

    res.json({
      date: date || new Date().toISOString().split('T')[0],
      slots: availableSlots,
      doctors: [] // doctors should be managed by admin; no default doctors
    });

  } catch (error) {
    console.error('Get available appointments error:', error);
    res.status(500).json({ message: 'Failed to get available appointments' });
  }
});

// Book appointment
router.post('/book', async (req, res) => {
  try {
    const bookingSchema = Joi.object({
      doctorId: Joi.string().required(),
      date: Joi.date().min('now').required(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      type: Joi.string().valid('consultation', 'follow_up', 'emergency', 'routine').required(),
      notes: Joi.string().optional()
    });

    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Persist appointment in in-memory store for demo
    const { addAppointment } = require('../services/appointmentsStore');
    const appointment = {
      id: `apt_${Date.now()}`,
      patientId: req.user.userId,
      doctorId: value.doctorId,
      date: value.date,
      time: value.time,
      type: value.type,
      status: 'confirmed',
      notes: value.notes,
      createdAt: new Date()
    };

    addAppointment(appointment);

    // Emit socket event to doctor room if io available
    try {
      const io = req.app.get('io');
      if (io && value.doctorId) {
        io.to(`doctor_${value.doctorId}`).emit('appointment_booked', appointment);
      }
    } catch (emitErr) {
      console.error('Socket emit failed:', emitErr);
    }

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
});

// Update appointment
router.put('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updateSchema = Joi.object({
      date: Joi.date().min('now').optional(),
      time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      notes: Joi.string().optional(),
      status: Joi.string().valid('confirmed', 'cancelled', 'rescheduled').optional()
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Mock appointment update
    const updatedAppointment = {
      id: appointmentId,
      ...value,
      updatedAt: new Date()
    };

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.delete('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Mock appointment cancellation
    res.json({
      message: 'Appointment cancelled successfully',
      appointmentId
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
});

// Get my appointments
router.get('/my-appointments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Mock appointments data
    const appointments = [
      {
        id: 'apt_001',
        doctorId: 'doc_001',
        doctorName: 'Dr. Sarah Johnson',
        date: '2024-02-01',
        time: '10:00',
        type: 'follow_up',
        status: 'confirmed',
        notes: 'Follow-up after recent eye test'
      },
      {
        id: 'apt_002',
        doctorId: 'doc_002',
        doctorName: 'Dr. Michael Chen',
        date: '2024-02-15',
        time: '14:00',
        type: 'routine',
        status: 'confirmed',
        notes: 'Annual eye examination'
      }
    ];

    res.json({
      appointments,
      pagination: {
        page,
        limit,
        total: appointments.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ message: 'Failed to get appointments' });
  }
});

// Get appointments for logged-in doctor
router.get('/for-doctor', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { getAppointmentsByDoctor } = require('../services/appointmentsStore');
    const appts = getAppointmentsByDoctor(doctorId);
    res.json({ appointments: appts });
  } catch (error) {
    console.error('Get appointments for doctor error:', error);
    res.status(500).json({ message: 'Failed to get appointments' });
  }
});

module.exports = router; 