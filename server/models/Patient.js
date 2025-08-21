const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date
  },
  medicalHistory: {
    diabetes: {
      type: Boolean,
      default: false
    },
    bloodPressure: {
      type: String,
      enum: ['normal', 'high', 'low', 'unknown'],
      default: 'unknown'
    },
    familyHistory: {
      glaucoma: { type: Boolean, default: false },
      cataracts: { type: Boolean, default: false },
      macularDegeneration: { type: Boolean, default: false },
      diabeticRetinopathy: { type: Boolean, default: false },
      other: [String]
    },
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      isActive: { type: Boolean, default: true }
    }],
    allergies: [{
      allergen: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        default: 'mild'
      },
      reaction: String
    }],
    previousSurgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      surgeon: String,
      complications: String
    }],
    lifestyle: {
      smoking: {
        type: String,
        enum: ['never', 'former', 'current'],
        default: 'never'
      },
      alcohol: {
        type: String,
        enum: ['never', 'occasional', 'moderate', 'heavy'],
        default: 'never'
      },
      exercise: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active'],
        default: 'sedentary'
      }
    }
  },
  riskFactors: {
    age: { type: Number, default: 0 },
    diabetes: { type: Boolean, default: false },
    highBloodPressure: { type: Boolean, default: false },
    familyHistory: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false },
    obesity: { type: Boolean, default: false },
    previousEyeConditions: { type: Boolean, default: false }
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
patientSchema.index({ userId: 1 });
patientSchema.index({ fullName: 1 });
patientSchema.index({ 'medicalHistory.diabetes': 1 });
patientSchema.index({ riskScore: -1 });
patientSchema.index({ isProfileComplete: 1 });

// Virtual for age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to calculate risk score
patientSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Age factor
  const age = this.age;
  if (age >= 60) score += 15;
  else if (age >= 50) score += 10;
  else if (age >= 40) score += 5;
  
  // Medical conditions
  if (this.medicalHistory.diabetes) score += 20;
  if (this.medicalHistory.bloodPressure === 'high') score += 10;
  
  // Family history
  const hasFamilyHistory = Object.values(this.medicalHistory.familyHistory).some(value => 
    typeof value === 'boolean' ? value : false
  );
  if (hasFamilyHistory) score += 10;
  
  // Lifestyle factors
  if (this.medicalHistory.lifestyle.smoking === 'current') score += 10;
  if (this.medicalHistory.lifestyle.exercise === 'sedentary') score += 5;
  
  // Previous conditions
  if (this.riskFactors.previousEyeConditions) score += 15;
  
  this.riskScore = Math.min(score, 100);
  return this.riskScore;
};

// Method to check if profile is complete
patientSchema.methods.checkProfileCompletion = function() {
  const requiredFields = [
    'fullName',
    'dateOfBirth',
    'gender',
    'emergencyContact.name',
    'emergencyContact.phone',
    'emergencyContact.relationship'
  ];
  
  const isComplete = requiredFields.every(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    return value && value.toString().trim() !== '';
  });
  
  this.isProfileComplete = isComplete;
  return isComplete;
};

// Pre-save middleware
patientSchema.pre('save', function(next) {
  if (this.isModified('dateOfBirth') || this.isModified('medicalHistory')) {
    this.calculateRiskScore();
  }
  
  if (this.isModified('fullName') || this.isModified('emergencyContact')) {
    this.checkProfileCompletion();
  }
  
  next();
});

module.exports = mongoose.model('Patient', patientSchema); 