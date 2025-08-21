const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Upload eye test image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { type = 'eye-test' } = req.body;

    // In a real implementation, you would:
    // 1. Upload to cloud storage (AWS S3, CloudFlare R2, etc.)
    // 2. Generate a public URL
    // 3. Store the URL in the database

    const imageUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;

    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      type
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload biometric template
router.post('/biometric', upload.single('biometric'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No biometric file provided' });
    }

    // Validate biometric file format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid biometric file format' });
    }

    // In a real implementation, you would:
    // 1. Process the biometric image
    // 2. Extract biometric template
    // 3. Encrypt and store securely
    // 4. Generate a template ID

    const biometricUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      message: 'Biometric template uploaded successfully',
      biometricUrl,
      templateId,
      filename: req.file.filename,
      size: req.file.size
    });

  } catch (error) {
    console.error('Upload biometric error:', error);
    res.status(500).json({ message: 'Failed to upload biometric template' });
  }
});

// Upload multiple images for eye test
router.post('/multiple-images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const { type = 'eye-test' } = req.body;

    const uploadedImages = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
      type
    }));

    res.json({
      message: 'Images uploaded successfully',
      images: uploadedImages,
      count: uploadedImages.length
    });

  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Delete uploaded file
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // In a real implementation, you would:
    // 1. Delete from cloud storage
    // 2. Remove from database
    // 3. Clean up any references

    res.json({
      message: 'File deleted successfully',
      filename
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

// Get upload status
router.get('/status/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;

    // Mock upload status
    const status = {
      uploadId,
      status: 'completed',
      progress: 100,
      files: [
        {
          filename: 'image-123456789.jpg',
          url: 'http://localhost:5000/uploads/image-123456789.jpg',
          size: 1024000,
          uploadedAt: new Date()
        }
      ]
    };

    res.json(status);

  } catch (error) {
    console.error('Get upload status error:', error);
    res.status(500).json({ message: 'Failed to get upload status' });
  }
});

module.exports = router; 