const express = require('express');
const Joi = require('joi');
const { sendEmail } = require('../services/notificationService');

const router = express.Router();

// Validation schema for contact form
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[\d\s-]+$/).optional(),
  subject: Joi.string().valid('general', 'technical', 'billing', 'partnership', 'feedback', 'other').required(),
  message: Joi.string().min(10).max(1000).required()
});

// Submit contact form
router.post('/submit', async (req, res) => {
  try {
    // Validate input
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, phone, subject, message } = value;

    // Create email content
    const emailContent = `
      New Contact Form Submission
      
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Subject: ${subject}
      
      Message:
      ${message}
      
      Submitted at: ${new Date().toISOString()}
    `;

    // Send notification email to support team
    await sendEmail({
      to: 'support@eyehealth.ai',
      subject: `Contact Form: ${subject}`,
      text: emailContent,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `
    });

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting MediElite',
      text: `
        Dear ${name},
        
        Thank you for reaching out to MediElite. We have received your message and will get back to you within 24-48 hours.
        
        Your message details:
        Subject: ${subject}
        Message: ${message}
        
        If you have any urgent questions, please call us at +1 (555) 123-4567.
        
        Best regards,
        The MediElite Team
      `,
      html: `
        <h2>Thank you for contacting MediElite</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to MediElite. We have received your message and will get back to you within 24-48 hours.</p>
        <p><strong>Your message details:</strong></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p>If you have any urgent questions, please call us at <strong>+1 (555) 123-4567</strong>.</p>
        <p>Best regards,<br>The MediElite Team</p>
      `
    });

    res.status(200).json({ 
      message: 'Contact form submitted successfully. We\'ll get back to you soon!' 
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ 
      message: 'Failed to submit contact form. Please try again later.' 
    });
  }
});

// Get contact information
router.get('/info', (req, res) => {
  const contactInfo = {
    email: 'hello@eyehealth.ai',
    phone: '+1 (555) 123-4567',
    supportHours: '24/7 Available',
    offices: [
      {
        city: 'San Francisco',
        country: 'United States',
        address: '123 Innovation Drive, Suite 100',
        phone: '+1 (555) 123-4567',
        email: 'sf@eyehealth.ai',
        hours: 'Mon-Fri: 9AM-6PM PST',
        timezone: 'PST'
      },
      {
        city: 'New York',
        country: 'United States',
        address: '456 Tech Avenue, Floor 15',
        phone: '+1 (555) 234-5678',
        email: 'nyc@eyehealth.ai',
        hours: 'Mon-Fri: 9AM-6PM EST',
        timezone: 'EST'
      },
      {
        city: 'London',
        country: 'United Kingdom',
        address: '789 Innovation Street, EC1A 1BB',
        phone: '+44 20 7123 4567',
        email: 'london@eyehealth.ai',
        hours: 'Mon-Fri: 9AM-6PM GMT',
        timezone: 'GMT'
      }
    ],
    supportOptions: [
      {
        title: 'General Support',
        description: 'Get help with account issues, billing, or general questions',
        email: 'support@eyehealth.ai',
        response: 'Within 24 hours'
      },
      {
        title: 'Technical Support',
        description: 'Technical issues, app problems, or integration help',
        email: 'tech@eyehealth.ai',
        response: 'Within 4 hours'
      },
      {
        title: 'Partnership Inquiries',
        description: 'For healthcare providers, clinics, or business partnerships',
        email: 'partnerships@eyehealth.ai',
        response: 'Within 48 hours'
      }
    ]
  };

  res.json(contactInfo);
});

module.exports = router;
