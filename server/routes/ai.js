const express = require('express');
const { auth } = require('../middleware/auth');
const { analyzeImage } = require('../services/aiService');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Analyze image
router.post('/analyze', async (req, res) => {
  try {
    const { imageUrl, imageType = 'both_eyes' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Perform AI analysis
    const analysisResults = await analyzeImage(imageUrl);

    res.json({
      message: 'Analysis completed successfully',
      results: analysisResults
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ message: 'AI analysis failed' });
  }
});

// Get analysis results by ID
router.get('/results/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;

    // In a real implementation, you would fetch from database
    // For now, return mock data
    const mockResults = {
      analysisId,
      status: 'completed',
      results: {
        externalConditions: {
          conjunctivitis: { probability: 0.1, confidence: 0.85 },
          stye: { probability: 0.05, confidence: 0.90 },
          ptosis: { probability: 0.02, confidence: 0.88 },
          swelling: { probability: 0.03, confidence: 0.87 }
        },
        colorAnalysis: {
          conjunctiva: {
            color: 'normal',
            healthIndicator: 'healthy',
            severity: 'none'
          },
          sclera: {
            color: 'white',
            healthIndicator: 'healthy',
            severity: 'none'
          }
        },
        structuralAnalysis: {
          symmetry: { score: 0.95, issues: [] },
          alignment: { score: 0.92, issues: [] },
          shape: { score: 0.94, issues: [] }
        },
        riskAssessment: {
          overallScore: 15,
          factors: [
            { factor: 'age', weight: 0.2, contribution: 5 },
            { factor: 'family_history', weight: 0.1, contribution: 0 },
            { factor: 'lifestyle', weight: 0.15, contribution: 3 },
            { factor: 'previous_conditions', weight: 0.25, contribution: 0 },
            { factor: 'current_symptoms', weight: 0.3, contribution: 7 }
          ],
          recommendations: [
            'Continue regular eye exams',
            'Maintain healthy lifestyle',
            'Monitor for any changes in vision'
          ]
        }
      }
    };

    res.json(mockResults);

  } catch (error) {
    console.error('Get analysis results error:', error);
    res.status(500).json({ message: 'Failed to get analysis results' });
  }
});

// Submit feedback for AI model improvement
router.post('/feedback', async (req, res) => {
  try {
    const { analysisId, feedback, accuracy, suggestions } = req.body;

    if (!analysisId || !feedback) {
      return res.status(400).json({ message: 'Analysis ID and feedback are required' });
    }

    // In a real implementation, you would store feedback in database
    // and use it to improve the AI models

    console.log('AI feedback received:', {
      analysisId,
      feedback,
      accuracy,
      suggestions,
      userId: req.user.userId,
      timestamp: new Date()
    });

    res.json({
      message: 'Feedback submitted successfully',
      feedbackId: `feedback_${Date.now()}`
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

module.exports = router; 