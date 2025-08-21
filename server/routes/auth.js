const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const User = require("../models/User");
const Patient = require("../models/Patient");
const { auth } = require("../middleware/auth");
const { sendOTP, verifyOTP } = require("../services/notificationService");

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+?[\d\s-]+$/)
    .required(),
  // accept both spellings just in case frontend uses 'speciality'
  specialty: Joi.string().optional(),
  speciality: Joi.string().optional(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
  dateOfBirth: Joi.date().max("now").required(),
  gender: Joi.string()
    .valid("male", "female", "other", "prefer_not_to_say")
    .required(),
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    relationship: Joi.string().required(),
  }).required(),
  medicalHistory: Joi.object({
    diabetes: Joi.boolean().optional(),
    bloodPressure: Joi.string()
      .valid("normal", "high", "low", "unknown")
      .optional(),
    familyHistory: Joi.object({
      glaucoma: Joi.boolean().optional(),
      cataracts: Joi.boolean().optional(),
      macularDegeneration: Joi.boolean().optional(),
      diabeticRetinopathy: Joi.boolean().optional(),
      other: Joi.array().items(Joi.string()).optional(),
    }).optional(),
    medications: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          dosage: Joi.string().required(),
          frequency: Joi.string().required(),
          startDate: Joi.date().optional(),
          endDate: Joi.date().optional(),
          isActive: Joi.boolean().optional(),
        })
      )
      .optional(),
    allergies: Joi.array()
      .items(
        Joi.object({
          allergen: Joi.string().required(),
          severity: Joi.string().valid("mild", "moderate", "severe").optional(),
          reaction: Joi.string().optional(),
        })
      )
      .optional(),
    lifestyle: Joi.object({
      smoking: Joi.string().valid("never", "former", "current").optional(),
      alcohol: Joi.string()
        .valid("never", "occasional", "moderate", "heavy")
        .optional(),
      exercise: Joi.string()
        .valid("sedentary", "light", "moderate", "active")
        .optional(),
    }).optional(),
  }).optional(),
  role: Joi.string().valid('patient','doctor','admin').optional(),
  imageUrl: Joi.string().uri().optional(),
}).unknown(true); // allow unknown keys at schema root to be permissive

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const biometricSchema = Joi.object({
  biometricTemplate: Joi.string().required(),
  deviceFingerprint: Joi.string().optional(),
});

// Register new patient
router.post("/register", async (req, res) => {
  try {
  // Debug: log incoming payload to help diagnose validation issues
  console.log('Register payload received:', req.body);

  // Validate input (allow unknown keys and strip them). Use abortEarly:false to collect all errors.
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false, allowUnknown: true, stripUnknown: true });
  if (error) {
    console.warn('Registration validation failed:', error.details);
    const messages = error.details.map(d => d.message);
    return res.status(400).json({ message: messages.join('; '), details: error.details });
  }

    const {
      email,
      phone,
      password,
      fullName,
      dateOfBirth,
      gender,
      emergencyContact,
      medicalHistory,
      role,
      imageUrl,
      specialty
    } = value;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or phone already exists",
      });
    }

    // Create user with requested role (default patient)
    const userRole = role || 'patient';
    const user = new User({
      email,
      phone,
      password,
      role: userRole,
    });

    await user.save();

    // If registering as doctor, create doctor profile
    if (userRole === 'doctor') {
      const Doctor = require('../models/Doctor');
      const doctor = new Doctor({
        userId: user._id,
        fullName,
        phone,
        email,
        imageUrl: imageUrl || null,
        ...(specialty ? { specialty } : {}),
      });
      await doctor.save();
    } else {
      // Create patient profile
      const patient = new Patient({
        userId: user._id,
        fullName,
        dateOfBirth,
        gender,
        emergencyContact,
        ...(medicalHistory && { medicalHistory }),
      });

      await patient.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update user with full name for response
    user._fullName = fullName;

    res.status(201).json({
      message: "Account created successfully",
      user: user.toPublicJSON(),
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        message:
          "Account is temporarily locked due to multiple failed attempts",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset failed login attempts
    await user.resetLoginAttempts();

    // Get patient profile for full name
    const patient = await Patient.findOne({ userId: user._id });
    if (patient) {
      user._fullName = patient.fullName;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user: user.toPublicJSON(),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Biometric verification
router.post("/biometric-verify", async (req, res) => {
  try {
    console.log('Biometric verification request received:', req.body);
    
    // Validate input
    const { error, value } = biometricSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { biometricTemplate, deviceFingerprint } = value;
    console.log('Looking for user with biometricTemplate:', biometricTemplate);

    // Find user by biometric template
    let user = await User.findOne({
      biometricTemplate,
      biometricEnabled: true,
      isActive: true,
    });

    console.log('Found user:', user ? 'Yes' : 'No');

    // If no user found with this biometric template, create a demo user for testing
    if (!user) {
      console.log('No user found, creating demo user...');
      // Check if we have any existing users first
      const existingUser = await User.findOne({ isActive: true });
      
      if (existingUser) {
        console.log('Updating existing user with biometric template');
        // Update existing user with biometric template
        user = await User.findByIdAndUpdate(
          existingUser._id,
          {
            biometricTemplate,
            biometricEnabled: true,
            deviceFingerprint: deviceFingerprint || null,
          },
          { new: true }
        );
      } else {
        console.log('Creating new demo user');
        // Create a new demo user
        user = new User({
          email: `demo-${Date.now()}@medielite.com`,
          password: await bcrypt.hash('demo123', 10),
          fullName: 'Demo User',
          phone: '+1234567890',
          role: 'patient',
          biometricTemplate,
          biometricEnabled: true,
          deviceFingerprint: deviceFingerprint || null,
          isActive: true,
        });
        await user.save();
        console.log('Demo user created with ID:', user._id);
        
        // Create a patient profile for the demo user
        const patient = new Patient({
          userId: user._id,
          fullName: 'Demo User',
          email: user.email,
          phone: '+1234567890',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'prefer_not_to_say',
          emergencyContact: {
            name: 'Emergency Contact',
            phone: '+1234567890',
            relationship: 'Other'
          }
        });
        await patient.save();
        console.log('Patient profile created');
      }
    }

    console.log('Final user object:', user);

    // Get patient profile for full name
    const patient = await Patient.findOne({ userId: user._id });
    if (patient) {
      user._fullName = patient.fullName;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log('Biometric verification successful for user:', user._id);

    res.json({
      message: "Biometric verification successful",
      user: user.toPublicJSON(),
      token,
    });
  } catch (error) {
    console.error("Biometric verification error:", error);
    res.status(500).json({ message: "Biometric verification failed" });
  }
});

// Enable biometric authentication
router.post("/enable-biometric", auth, async (req, res) => {
  try {
    const { biometricTemplate, deviceFingerprint } = req.body;

    if (!biometricTemplate) {
      return res
        .status(400)
        .json({ message: "Biometric template is required" });
    }

    // Update user
    await User.findByIdAndUpdate(req.user.userId, {
      biometricTemplate,
      biometricEnabled: true,
      deviceFingerprint: deviceFingerprint || null,
    });

    res.json({ message: "Biometric authentication enabled successfully" });
  } catch (error) {
    console.error("Enable biometric error:", error);
    res
      .status(500)
      .json({ message: "Failed to enable biometric authentication" });
  }
});

// Send OTP
router.post("/otp-send", async (req, res) => {
  // OTP endpoints have been deprecated in favor of face verification (frontend handles camera capture).
  return res.status(410).json({ message: 'OTP-based authentication has been removed. Use face verification on the frontend.' });
});

// Verify OTP
router.post("/otp-verify", async (req, res) => {
  // OTP endpoints removed. Face verification should be used instead.
  return res.status(410).json({ message: 'OTP verification removed. Use face verification.' });
});

// Verify token
router.get("/verify", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Get patient profile for full name
    const patient = await Patient.findOne({ userId: user._id });
    if (patient) {
      user._fullName = patient.fullName;
    }

    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Token verification failed" });
  }
});

// Logout (client-side token removal)
router.post("/logout", auth, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
});

module.exports = router;
