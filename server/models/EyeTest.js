const mongoose = require('mongoose');

const eyeTestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testId: {
    type: String,
    required: true,
    unique: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['left_eye', 'right_eye', 'both_eyes'],
      required: true
    },
    quality: {
      score: { type: Number, min: 0, max: 100 },
      factors: {
        focus: Number,
        lighting: Number,
        stability: Number,
        eyeOpenness: Number
      }
    },
    capturedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiAnalysis: {
    externalConditions: {
      conjunctivitis: { probability: Number, confidence: Number },
      stye: { probability: Number, confidence: Number },
      ptosis: { probability: Number, confidence: Number },
      swelling: { probability: Number, confidence: Number }
    },
    colorAnalysis: {
      conjunctiva: {
        color: String,
        healthIndicator: String,
        severity: String
      },
      sclera: {
        color: String,
        healthIndicator: String,
        severity: String
      }
    },
    structuralAnalysis: {
      symmetry: { score: Number, issues: [String] },
      alignment: { score: Number, issues: [String] },
      shape: { score: Number, issues: [String] }
    },
    riskAssessment: {
      overallScore: { type: Number, min: 0, max: 100 },
      factors: [{
        factor: String,
        weight: Number,
        contribution: Number
      }],
      recommendations: [String]
    }
  },
  priorityLevel: {
    type: String,
    enum: ['critical', 'urgent', 'moderate', 'routine', 'normal'],
    default: 'normal'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'reviewed', 'archived'],
    default: 'pending'
  },
  doctorReview: {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    reviewedAt: Date,
    diagnosis: String,
    notes: String,
    recommendations: [String],
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date
  },
  notifications: [{
    type: {
      type: String,
      enum: ['sms', 'email', 'push', 'urgent_sms', 'doctor_alert'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    recipient: String,
    message: String
  }],
  metadata: {
    deviceInfo: {
      model: String,
      os: String,
      browser: String
    },
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      country: String
    },
    testDuration: Number, // in seconds
    retryCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
eyeTestSchema.index({ patientId: 1 });
eyeTestSchema.index({ testId: 1 });
eyeTestSchema.index({ priorityLevel: 1 });
eyeTestSchema.index({ riskScore: -1 });
eyeTestSchema.index({ status: 1 });
eyeTestSchema.index({ createdAt: -1 });
eyeTestSchema.index({ 'doctorReview.doctorId': 1 });

// Pre-save middleware to generate test ID
eyeTestSchema.pre('save', function(next) {
  if (!this.testId) {
    this.testId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Method to calculate priority level based on risk score
eyeTestSchema.methods.calculatePriorityLevel = function() {
  if (this.riskScore >= 90) return 'critical';
  if (this.riskScore >= 75) return 'urgent';
  if (this.riskScore >= 50) return 'moderate';
  if (this.riskScore >= 25) return 'routine';
  return 'normal';
};

// Method to get AI confidence score
eyeTestSchema.methods.getAIConfidence = function() {
  const externalConditions = Object.values(this.aiAnalysis.externalConditions);
  const avgConfidence = externalConditions.reduce((sum, condition) => 
    sum + (condition.confidence || 0), 0) / externalConditions.length;
  
  return Math.round(avgConfidence);
};

// Method to get detected conditions
eyeTestSchema.methods.getDetectedConditions = function() {
  const conditions = [];
  Object.entries(this.aiAnalysis.externalConditions).forEach(([condition, data]) => {
    if (data.probability > 0.5) {
      conditions.push({
        name: condition,
        probability: data.probability,
        confidence: data.confidence
      });
    }
  });
  
  return conditions.sort((a, b) => b.probability - a.probability);
};

// Method to check if urgent attention is needed
eyeTestSchema.methods.requiresUrgentAttention = function() {
  return this.priorityLevel === 'critical' || this.priorityLevel === 'urgent';
};

// Method to get summary for dashboard
eyeTestSchema.methods.getSummary = function() {
  return {
    testId: this.testId,
    date: this.createdAt,
    priorityLevel: this.priorityLevel,
    riskScore: this.riskScore,
    status: this.status,
    aiConfidence: this.getAIConfidence(),
    detectedConditions: this.getDetectedConditions(),
    requiresUrgentAttention: this.requiresUrgentAttention()
  };
};

// Static method to get tests by priority
eyeTestSchema.statics.getByPriority = function(priority) {
  return this.find({ priorityLevel: priority })
    .populate('patientId', 'fullName')
    .sort({ createdAt: -1 });
};

// Static method to get recent tests for a patient
eyeTestSchema.statics.getRecentForPatient = function(patientId, limit = 10) {
  return this.find({ patientId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('EyeTest', eyeTestSchema); 