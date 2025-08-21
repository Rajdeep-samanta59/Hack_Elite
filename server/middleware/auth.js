const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Token verification failed.' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Patient-specific authorization
const authorizePatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ 
      message: 'Access denied. Patient role required.' 
    });
  }
  next();
};

// Doctor-specific authorization
const authorizeDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ 
      message: 'Access denied. Doctor role required.' 
    });
  }
  next();
};

// Admin-specific authorization
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin role required.' 
    });
  }
  next();
};

module.exports = {
  auth,
  authorize,
  authorizePatient,
  authorizeDoctor,
  authorizeAdmin
}; 