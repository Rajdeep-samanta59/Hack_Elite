const express = require('express');
const { auth, authorizePatient } = require('../middleware/auth');
const Patient = require('../models/Patient');
const EyeTest = require('../models/EyeTest');
const Joi = require('joi');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);
router.use(authorizePatient);

// Get patient profile
router.get('/profile', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId })
      .populate('userId', 'email phone biometricEnabled');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update patient profile
router.put('/profile', async (req, res) => {
  try {
    const updateSchema = Joi.object({
      fullName: Joi.string().min(2).optional(),
      dateOfBirth: Joi.date().max('now').optional(),
      gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
      emergencyContact: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        relationship: Joi.string().required()
      }).optional(),
      address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zipCode: Joi.string().optional(),
        country: Joi.string().optional()
      }).optional(),
      insurance: Joi.object({
        provider: Joi.string().optional(),
        policyNumber: Joi.string().optional(),
        groupNumber: Joi.string().optional(),
        expiryDate: Joi.date().optional()
      }).optional()
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.userId },
      value,
      { new: true, runValidators: true }
    ).populate('userId', 'email phone biometricEnabled');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      patient 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get medical history
router.get('/medical-history', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId })
      .select('medicalHistory riskFactors riskScore');

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({ 
      medicalHistory: patient.medicalHistory,
      riskFactors: patient.riskFactors,
      riskScore: patient.riskScore
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({ message: 'Failed to get medical history' });
  }
});

// Update medical history
router.post('/medical-history', async (req, res) => {
  try {
    const medicalHistorySchema = Joi.object({
      diabetes: Joi.boolean().optional(),
      bloodPressure: Joi.string().valid('normal', 'high', 'low', 'unknown').optional(),
      familyHistory: Joi.object({
        glaucoma: Joi.boolean().optional(),
        cataracts: Joi.boolean().optional(),
        macularDegeneration: Joi.boolean().optional(),
        diabeticRetinopathy: Joi.boolean().optional(),
        other: Joi.array().items(Joi.string()).optional()
      }).optional(),
      medications: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().required(),
        frequency: Joi.string().required(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        isActive: Joi.boolean().optional()
      })).optional(),
      allergies: Joi.array().items(Joi.object({
        allergen: Joi.string().required(),
        severity: Joi.string().valid('mild', 'moderate', 'severe').optional(),
        reaction: Joi.string().optional()
      })).optional(),
      lifestyle: Joi.object({
        smoking: Joi.string().valid('never', 'former', 'current').optional(),
        alcohol: Joi.string().valid('never', 'occasional', 'moderate', 'heavy').optional(),
        exercise: Joi.string().valid('sedentary', 'light', 'moderate', 'active').optional()
      }).optional()
    });

    const { error, value } = medicalHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.userId },
      { medicalHistory: value },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json({ 
      message: 'Medical history updated successfully',
      medicalHistory: patient.medicalHistory,
      riskScore: patient.riskScore
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({ message: 'Failed to update medical history' });
  }
});

// Get dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Get recent tests
    const recentTests = await EyeTest.find({ patientId: patient._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('testId createdAt priorityLevel riskScore status');

    // Get upcoming appointments (placeholder - would integrate with appointment system)
    const upcomingAppointments = []; // This would come from appointment service

    // Get notifications (placeholder - would come from notification service)
    const notifications = []; // This would come from notification service

    const dashboardData = {
      healthStatus: patient.riskScore > 75 ? 'critical' : 
                   patient.riskScore > 50 ? 'moderate' : 'normal',
      riskScore: patient.riskScore,
      lastTestDate: recentTests.length > 0 ? recentTests[0].createdAt : null,
      nextAppointment: upcomingAppointments.length > 0 ? upcomingAppointments[0] : null,
      recentTests: recentTests.map(test => ({
        id: test.testId,
        date: test.createdAt,
        status: test.status,
        priority: test.priorityLevel,
        confidence: 95 // Mock confidence score
      })),
      upcomingAppointments,
      notifications
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Failed to get dashboard data' });
  }
});

// Get test history
router.get('/test-history', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tests = await EyeTest.find({ patientId: patient._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('testId createdAt priorityLevel riskScore status aiAnalysis');

    const total = await EyeTest.countDocuments({ patientId: patient._id });

    const testHistory = tests.map(test => ({
      id: test.testId,
      date: test.createdAt,
      priorityLevel: test.priorityLevel,
      riskScore: test.riskScore,
      status: test.status,
      aiConfidence: test.getAIConfidence(),
      detectedConditions: test.getDetectedConditions()
    }));

    res.json({
      tests: testHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({ message: 'Failed to get test history' });
  }
});

// Get latest test results
router.get('/latest-results', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const latestTest = await EyeTest.findOne({ patientId: patient._id })
      .sort({ createdAt: -1 })
      .populate('doctorReview.doctorId', 'fullName');

    if (!latestTest) {
      return res.status(404).json({ message: 'No test results found' });
    }

    res.json({
      test: {
        id: latestTest.testId,
        date: latestTest.createdAt,
        priorityLevel: latestTest.priorityLevel,
        riskScore: latestTest.riskScore,
        status: latestTest.status,
        aiConfidence: latestTest.getAIConfidence(),
        detectedConditions: latestTest.getDetectedConditions(),
        doctorReview: latestTest.doctorReview,
        aiAnalysis: latestTest.aiAnalysis
      }
    });
  } catch (error) {
    console.error('Get latest results error:', error);
    res.status(500).json({ message: 'Failed to get latest results' });
  }
});

module.exports = router; 