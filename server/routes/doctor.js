const express = require('express');
const { auth, authorizeDoctor } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);
router.use(authorizeDoctor);

// Get patient queue (priority sorted)
router.get('/queue', async (req, res) => {
  try {
    // Mock patient queue data
    // Create dates 7 days from now for deterministic demo data
    const inSevenDays = (hoursOffset = 9) => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(hoursOffset, 0, 0, 0);
      return d.toISOString();
    };

    const patientQueue = [
      {
        patientId: 'pat_001',
        testId: 'test_001',
        patientName: 'John Doe',
        priorityLevel: 'critical',
        riskScore: 95,
        testDate: inSevenDays(10),
        status: 'pending_review',
        aiConfidence: 92,
        detectedConditions: ['conjunctivitis', 'swelling']
      },
      {
        patientId: 'pat_002',
        testId: 'test_002',
        patientName: 'Jane Smith',
        priorityLevel: 'urgent',
        riskScore: 78,
        testDate: inSevenDays(9),
        status: 'pending_review',
        aiConfidence: 88,
        detectedConditions: ['stye']
      },
      {
        patientId: 'pat_003',
        testId: 'test_003',
        patientName: 'Mike Johnson',
        priorityLevel: 'moderate',
        riskScore: 65,
        testDate: inSevenDays(8),
        status: 'pending_review',
        aiConfidence: 85,
        detectedConditions: []
      }
    ];

    res.json({
      queue: patientQueue,
      summary: {
        critical: patientQueue.filter(p => p.priorityLevel === 'critical').length,
        urgent: patientQueue.filter(p => p.priorityLevel === 'urgent').length,
        moderate: patientQueue.filter(p => p.priorityLevel === 'moderate').length,
        routine: patientQueue.filter(p => p.priorityLevel === 'routine').length,
        normal: patientQueue.filter(p => p.priorityLevel === 'normal').length
      }
    });

  } catch (error) {
    console.error('Get patient queue error:', error);
    res.status(500).json({ message: 'Failed to get patient queue' });
  }
});

// Get patient details
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // Mock patient data
    const patient = {
      id: patientId,
      fullName: 'John Doe',
      dateOfBirth: '1985-03-15',
      age: 38,
      gender: 'male',
      contact: {
        phone: '+1234567890',
        email: 'john.doe@email.com'
      },
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567891',
        relationship: 'spouse'
      },
      medicalHistory: {
        diabetes: false,
        bloodPressure: 'normal',
        familyHistory: {
          glaucoma: true,
          cataracts: false
        },
        medications: [
          {
            name: 'None',
            dosage: '',
            frequency: '',
            isActive: false
          }
        ],
        allergies: []
      },
      recentTests: [
        {
          testId: 'test_001',
          date: '2024-01-20',
          priorityLevel: 'critical',
          riskScore: 95,
          status: 'completed'
        }
      ]
    };

    res.json({ patient });

  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ message: 'Failed to get patient details' });
  }
});

// Submit diagnosis
router.post('/diagnosis', async (req, res) => {
  try {
    const diagnosisSchema = Joi.object({
      testId: Joi.string().required(),
      patientId: Joi.string().required(),
      diagnosis: Joi.string().required(),
      notes: Joi.string().optional(),
      recommendations: Joi.array().items(Joi.string()).optional(),
      followUpRequired: Joi.boolean().default(false),
      followUpDate: Joi.date().optional(),
      priorityLevel: Joi.string().valid('critical', 'urgent', 'moderate', 'routine', 'normal').required()
    });

    const { error, value } = diagnosisSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Mock diagnosis submission
    const diagnosis = {
      id: `diag_${Date.now()}`,
      testId: value.testId,
      patientId: value.patientId,
      doctorId: req.user.userId,
      diagnosis: value.diagnosis,
      notes: value.notes,
      recommendations: value.recommendations || [],
      followUpRequired: value.followUpRequired,
      followUpDate: value.followUpDate,
      priorityLevel: value.priorityLevel,
      submittedAt: new Date()
    };

    res.json({
      message: 'Diagnosis submitted successfully',
      diagnosis
    });

  } catch (error) {
    console.error('Submit diagnosis error:', error);
    res.status(500).json({ message: 'Failed to submit diagnosis' });
  }
});

// Create prescription
router.post('/prescription', async (req, res) => {
  try {
    const prescriptionSchema = Joi.object({
      patientId: Joi.string().required(),
      medications: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().required(),
        frequency: Joi.string().required(),
        duration: Joi.string().required(),
        instructions: Joi.string().optional()
      })).required(),
      instructions: Joi.string().optional(),
      followUpDate: Joi.date().optional()
    });

    const { error, value } = prescriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Mock prescription creation
    const prescription = {
      id: `pres_${Date.now()}`,
      patientId: value.patientId,
      doctorId: req.user.userId,
      medications: value.medications,
      instructions: value.instructions,
      followUpDate: value.followUpDate,
      issuedDate: new Date(),
      status: 'active'
    };

    res.json({
      message: 'Prescription created successfully',
      prescription
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Failed to create prescription' });
  }
});

// Get today's appointments
router.get('/today-appointments', async (req, res) => {
  try {
    // Mock today's appointments
    const makeTime = (hour) => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(hour, 0, 0, 0);
      return d.toISOString();
    };

    const appointments = [
      { id: 'apt_001', patientName: 'John Doe', time: makeTime(9), type: 'consultation', status: 'confirmed', priorityLevel: 'critical' },
      { id: 'apt_002', patientName: 'Jane Smith', time: makeTime(10), type: 'follow_up', status: 'confirmed', priorityLevel: 'urgent' },
      { id: 'apt_003', patientName: 'Mike Johnson', time: makeTime(14), type: 'routine', status: 'confirmed', priorityLevel: 'normal' }
    ];

    res.json({ date: new Date().toISOString().split('T')[0], appointments });

  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({ message: 'Failed to get today appointments' });
  }
});

// Get pending reviews
router.get('/pending-reviews', async (req, res) => {
  try {
    // Mock pending reviews
    const pendingReviews = [
      {
        testId: 'test_001',
        patientName: 'John Doe',
        priorityLevel: 'critical',
        testDate: '2024-01-20T10:30:00Z',
        aiConfidence: 92,
        detectedConditions: ['conjunctivitis', 'swelling']
      },
      {
        testId: 'test_002',
        patientName: 'Jane Smith',
        priorityLevel: 'urgent',
        testDate: '2024-01-20T09:15:00Z',
        aiConfidence: 88,
        detectedConditions: ['stye']
      }
    ];

    res.json({
      pendingReviews,
      count: pendingReviews.length
    });

  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ message: 'Failed to get pending reviews' });
  }
});

module.exports = router; 