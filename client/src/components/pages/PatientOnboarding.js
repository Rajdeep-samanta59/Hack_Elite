import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Shield, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PatientOnboarding = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Account Creation
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  role: 'patient',
  imageUrl: '',
  specialty: '',
    dateOfBirth: '',
    gender: '',
    
    // Step 2: Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    
    // Step 3: Medical History
    diabetes: false,
    bloodPressure: 'normal',
    familyHistory: {
      glaucoma: false,
      cataracts: false,
      macularDegeneration: false,
      diabeticRetinopathy: false
    },
    medications: [],
    allergies: [],
    lifestyle: {
      smoking: 'never',
      alcohol: 'never',
      exercise: 'sedentary'
    }
  });

  const steps = [
    { id: 1, title: 'Account Creation', icon: User },
    { id: 2, title: 'Emergency Contact', icon: Shield },
    { id: 3, title: 'Medical History', icon: Heart }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.phone && 
               formData.password && formData.confirmPassword && 
               formData.dateOfBirth && formData.gender &&
               formData.password === formData.confirmPassword;
      case 2:
        return formData.emergencyContactName && formData.emergencyContactPhone && 
               formData.emergencyContactRelationship;
      case 3:
        return true; // Medical history is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: (formData.phone || '').trim(),
        password: formData.password,
        // send dateOfBirth as ISO date string (server expects a date)
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
        gender: formData.gender,
        role: formData.role,
        // only include imageUrl when provided (avoid sending null which fails server validation)
        ...(formData.imageUrl ? { imageUrl: formData.imageUrl } : {}),
        ...(formData.role === 'doctor' && formData.specialty ? { specialty: formData.specialty } : {}),
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        },
        medicalHistory: {
          diabetes: formData.diabetes,
          bloodPressure: formData.bloodPressure,
          familyHistory: formData.familyHistory,
          medications: formData.medications,
          allergies: formData.allergies,
          lifestyle: formData.lifestyle
        }
      };

      console.log('Submitting registration data:', userData);
      // Let AuthContext.register handle post-registration routing based on role
      await register(userData);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-brand-200">Join MediElite for personalized eye care</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  currentStep >= step.id ? 'bg-white text-brand-600' : 'bg-white/20 text-white'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-brand-200'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 rounded ${
                    currentStep > step.id ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Role *</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white">
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {formData.role === 'doctor' && (
                    <>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Profile Image URL</label>
                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="https://..." />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Specialty</label>
                        <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="e.g. Ophthalmologist" />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 bg-grey-700"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male" style={{backgroundColor: '#eee', color: '#333'}} >Male</option>
                      <option value="female" style={{backgroundColor: '#eee', color: '#333'}}>Female</option>
                      <option value="other" style={{backgroundColor: '#eee', color: '#333'}}>Other</option>
                      <option value="prefer_not_to_say" style={{backgroundColor: '#eee', color: '#333'}}>Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Create a password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Emergency Contact</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter contact name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter contact phone"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Relationship *
                    </label>
                    <select
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      required
                    >
                      <option value="" style={{backgroundColor: '#eee', color: '#333'}}>Select relationship</option>
                      <option value="spouse"  style={{backgroundColor: '#eee', color: '#333'}}>Spouse</option>
                      <option value="parent"  style={{backgroundColor: '#eee', color: '#333'}}>Parent</option>
                      <option value="child"  style={{backgroundColor: '#eee', color: '#333'}}>Child</option>
                      <option value="sibling" style={{backgroundColor: '#eee', color: '#333'}}>Sibling</option>
                      <option value="friend" style={{backgroundColor: '#eee', color: '#333'}} >Friend</option>
                      <option value="other" style={{backgroundColor: '#eee', color: '#333'}} >Other</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Medical History</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Medical Conditions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="diabetes"
                          checked={formData.diabetes}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                        <span className="text-white">Diabetes</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Blood Pressure
                    </label>
                    <select
                      name="bloodPressure"
                      value={formData.bloodPressure}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="normal" style={{backgroundColor: '#eee', color: '#333'}} >Normal</option>
                      <option value="high" style={{backgroundColor: '#eee', color: '#333'}} >High</option>
                      <option value="low" style={{backgroundColor: '#eee', color: '#333'}} >Low</option>
                      <option value="unknown" style={{backgroundColor: '#eee', color: '#333'}} >Unknown</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Family History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(formData.familyHistory).map(condition => (
                        <label key={condition} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name={`familyHistory.${condition}`}
                            checked={formData.familyHistory[condition]}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                          />
                          <span className="text-white capitalize">
                            {condition.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="glass-cta flex items-center space-x-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="glass-cta flex items-center space-x-2"
            >
              <span>{currentStep === steps.length ? 'Create Account' : 'Next'}</span>
              {currentStep < steps.length && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientOnboarding; 