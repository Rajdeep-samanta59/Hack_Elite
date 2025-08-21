const express = require('express');
const { auth, authorizePatient } = require('../middleware/auth');
const EyeTest = require('../models/EyeTest');
const Patient = require('../models/Patient');
const { analyzeImage } = require('../services/aiService');
const { sendTestResultNotification } = require('../services/notificationService');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);
router.use(authorizePatient);

// Capture eye test images
router.post('/capture', async (req, res) => {
  try {
    const { images, metadata } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Images are required' });
    }

    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Create new eye test
    const eyeTest = new EyeTest({
      patientId: patient._id,
      images: images.map(img => ({
        url: img.url,
        type: img.type || 'both_eyes',
        quality: {
          score: img.quality?.score || 0,
          factors: img.quality?.factors || {}
        }
      })),
      metadata: {
        deviceInfo: metadata?.deviceInfo || {},
        location: metadata?.location || {},
        testDuration: metadata?.testDuration || 0
      },
      status: 'pending'
    });

    await eyeTest.save();

    // Start AI analysis
    try {
      const analysisResults = await analyzeImage(images[0].url); // Analyze first image
      
      eyeTest.aiAnalysis = analysisResults;
      eyeTest.riskScore = analysisResults.riskAssessment.overallScore;
      eyeTest.priorityLevel = eyeTest.calculatePriorityLevel();
      eyeTest.status = 'completed';
      
      await eyeTest.save();

      // Send notifications based on priority
      if (eyeTest.requiresUrgentAttention()) {
        await sendTestResultNotification(patient, eyeTest);
      }

      res.json({
        message: 'Eye test captured and analyzed successfully',
        testId: eyeTest.testId,
        priorityLevel: eyeTest.priorityLevel,
        riskScore: eyeTest.riskScore,
        status: eyeTest.status
      });

    } catch (analysisError) {
      console.error('AI analysis failed:', analysisError);
      eyeTest.status = 'analyzing';
      await eyeTest.save();

      res.json({
        message: 'Eye test captured successfully. Analysis in progress.',
        testId: eyeTest.testId,
        status: eyeTest.status
      });
    }

  } catch (error) {
    console.error('Capture test error:', error);
    res.status(500).json({ message: 'Failed to capture eye test' });
  }
});

// Upload eye test images
router.post('/upload', async (req, res) => {
  try {
    // This would handle file upload via multer
    // For now, we'll assume the file is already uploaded and we have the URL
    const { imageUrl, imageType, quality } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Create new eye test with uploaded image
    const eyeTest = new EyeTest({
      patientId: patient._id,
      images: [{
        url: imageUrl,
        type: imageType || 'both_eyes',
        quality: {
          score: quality?.score || 0,
          factors: quality?.factors || {}
        }
      }],
      status: 'pending'
    });

    await eyeTest.save();

    // Start AI analysis
    try {
      const analysisResults = await analyzeImage(imageUrl);
      
      eyeTest.aiAnalysis = analysisResults;
      eyeTest.riskScore = analysisResults.riskAssessment.overallScore;
      eyeTest.priorityLevel = eyeTest.calculatePriorityLevel();
      eyeTest.status = 'completed';
      
      await eyeTest.save();

      res.json({
        message: 'Eye test uploaded and analyzed successfully',
        testId: eyeTest.testId,
        priorityLevel: eyeTest.priorityLevel,
        riskScore: eyeTest.riskScore,
        status: eyeTest.status
      });

    } catch (analysisError) {
      console.error('AI analysis failed:', analysisError);
      eyeTest.status = 'analyzing';
      await eyeTest.save();

      res.json({
        message: 'Eye test uploaded successfully. Analysis in progress.',
        testId: eyeTest.testId,
        status: eyeTest.status
      });
    }

  } catch (error) {
    console.error('Upload test error:', error);
    res.status(500).json({ message: 'Failed to upload eye test' });
  }
});

// Get test results by ID
router.get('/results/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const eyeTest = await EyeTest.findOne({
      testId,
      patientId: patient._id
    }).populate('doctorReview.doctorId', 'fullName');

    if (!eyeTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({
      test: {
        id: eyeTest.testId,
        date: eyeTest.createdAt,
        priorityLevel: eyeTest.priorityLevel,
        riskScore: eyeTest.riskScore,
        status: eyeTest.status,
        aiConfidence: eyeTest.getAIConfidence(),
        detectedConditions: eyeTest.getDetectedConditions(),
        doctorReview: eyeTest.doctorReview,
        aiAnalysis: eyeTest.aiAnalysis,
        images: eyeTest.images,
        metadata: eyeTest.metadata
      }
    });

  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({ message: 'Failed to get test results' });
  }
});

// Get test history
router.get('/history', async (req, res) => {
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
      .select('testId createdAt priorityLevel riskScore status');

    const total = await EyeTest.countDocuments({ patientId: patient._id });

    const testHistory = tests.map(test => ({
      id: test.testId,
      date: test.createdAt,
      priorityLevel: test.priorityLevel,
      riskScore: test.riskScore,
      status: test.status
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

// Retry analysis for failed tests
router.post('/retry-analysis/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const eyeTest = await EyeTest.findOne({
      testId,
      patientId: patient._id
    });

    if (!eyeTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (eyeTest.status === 'completed') {
      return res.status(400).json({ message: 'Test analysis is already completed' });
    }

    // Update status to analyzing
    eyeTest.status = 'analyzing';
    await eyeTest.save();

    // Retry AI analysis
    try {
      const firstImage = eyeTest.images[0];
      const analysisResults = await analyzeImage(firstImage.url);
      
      eyeTest.aiAnalysis = analysisResults;
      eyeTest.riskScore = analysisResults.riskAssessment.overallScore;
      eyeTest.priorityLevel = eyeTest.calculatePriorityLevel();
      eyeTest.status = 'completed';
      
      await eyeTest.save();

      res.json({
        message: 'Analysis completed successfully',
        testId: eyeTest.testId,
        priorityLevel: eyeTest.priorityLevel,
        riskScore: eyeTest.riskScore,
        status: eyeTest.status
      });

    } catch (analysisError) {
      console.error('AI analysis failed:', analysisError);
      eyeTest.status = 'pending';
      await eyeTest.save();

      res.status(500).json({
        message: 'Analysis failed. Please try again later.',
        testId: eyeTest.testId,
        status: eyeTest.status
      });
    }

  } catch (error) {
    console.error('Retry analysis error:', error);
    res.status(500).json({ message: 'Failed to retry analysis' });
  }
});

module.exports = router; 