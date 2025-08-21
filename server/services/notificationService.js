const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send SMS via Twilio
const sendSMS = async (phoneNumber, message) => {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log('SMS sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP via SMS
const sendOTP = async (phoneNumber, otp) => {
  const message = `Your MediElite verification code is: ${otp}. Valid for 3 minutes. Do not share this code with anyone.`;
  // If Twilio is not configured in local/dev, skip sending and log the OTP so local testing works
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio not configured - skipping SMS send. OTP for', phoneNumber, 'is', otp);
    return { success: true, sid: 'local-dev', otp: process.env.NODE_ENV === 'production' ? undefined : otp };
  }

  return await sendSMS(phoneNumber, message);
};

// Send email
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@eyehealthai.com',
      to,
      subject,
      html: htmlContent,
      text: textContent
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send test result notification
const sendTestResultNotification = async (patient, testResult) => {
  const { fullName, email, phone } = patient;
  const { testId, priorityLevel, riskScore } = testResult;

  // Email notification
  if (email) {
    const subject = `Eye Test Results - ${priorityLevel.toUpperCase()}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">MediElite - Test Results</h2>
        <p>Dear ${fullName},</p>
        <p>Your eye test results are ready.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Test Summary</h3>
          <p><strong>Test ID:</strong> ${testId}</p>
          <p><strong>Priority Level:</strong> <span style="color: ${getPriorityColor(priorityLevel)};">${priorityLevel.toUpperCase()}</span></p>
          <p><strong>Risk Score:</strong> ${riskScore}/100</p>
        </div>
        <p>Please log in to your dashboard to view detailed results.</p>
        <p>Best regards,<br>MediElite Team</p>
      </div>
    `;

    await sendEmail(email, subject, htmlContent);
  }

  // SMS notification for urgent cases
  if (phone && (priorityLevel === 'critical' || priorityLevel === 'urgent')) {
    const message = `URGENT: Your eye test (${testId}) requires immediate attention. Please check your email or log in to your dashboard.`;
    await sendSMS(phone, message);
  }
};

// Send appointment reminder
const sendAppointmentReminder = async (patient, appointment) => {
  const { fullName, email, phone } = patient;
  const { date, time, doctor } = appointment;

  // Email reminder
  if (email) {
    const subject = 'Appointment Reminder - MediElite';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Appointment Reminder</h2>
        <p>Dear ${fullName},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Doctor:</strong> ${doctor}</p>
        </div>
        <p>Please ensure you're available for your appointment.</p>
        <p>Best regards,<br>MediElite Team</p>
      </div>
    `;

    await sendEmail(email, subject, htmlContent);
  }

  // SMS reminder
  if (phone) {
    const message = `Reminder: You have an appointment with ${doctor} on ${date} at ${time}.`;
    await sendSMS(phone, message);
  }
};

// Send emergency notification
const sendEmergencyNotification = async (patient, testResult) => {
  const { fullName, phone, emergencyContact } = patient;
  const { testId, priorityLevel } = testResult;

  // Notify patient
  if (phone) {
    const message = `EMERGENCY: Your eye test (${testId}) shows critical results. Please seek immediate medical attention.`;
    await sendSMS(phone, message);
  }

  // Notify emergency contact
  if (emergencyContact && emergencyContact.phone) {
    const message = `EMERGENCY: ${fullName} requires immediate medical attention for eye health concerns. Please contact them immediately.`;
    await sendSMS(emergencyContact.phone, message);
  }
};

// Send doctor assignment notification
const sendDoctorAssignmentNotification = async (patient, doctor) => {
  const { fullName, email, phone } = patient;
  const { fullName: doctorName } = doctor;

  // Email notification
  if (email) {
    const subject = 'Doctor Assigned - MediElite';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Doctor Assignment</h2>
        <p>Dear ${fullName},</p>
        <p>Dr. ${doctorName} has been assigned to review your case.</p>
        <p>You will be contacted shortly with further instructions.</p>
        <p>Best regards,<br>MediElite Team</p>
      </div>
    `;

    await sendEmail(email, subject, htmlContent);
  }

  // SMS notification
  if (phone) {
    const message = `Dr. ${doctorName} has been assigned to your case. You will be contacted shortly.`;
    await sendSMS(phone, message);
  }
};

// Send medication reminder
const sendMedicationReminder = async (patient, medication) => {
  const { fullName, email, phone } = patient;
  const { name, dosage, frequency } = medication;

  // Email reminder
  if (email) {
    const subject = 'Medication Reminder - MediElite';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Medication Reminder</h2>
        <p>Dear ${fullName},</p>
        <p>This is a reminder to take your medication:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Medication:</strong> ${name}</p>
          <p><strong>Dosage:</strong> ${dosage}</p>
          <p><strong>Frequency:</strong> ${frequency}</p>
        </div>
        <p>Please take your medication as prescribed.</p>
        <p>Best regards,<br>MediElite Team</p>
      </div>
    `;

    await sendEmail(email, subject, htmlContent);
  }

  // SMS reminder
  if (phone) {
    const message = `Reminder: Take ${name} ${dosage} as prescribed (${frequency}).`;
    await sendSMS(phone, message);
  }
};

// Helper function to get priority color
const getPriorityColor = (priorityLevel) => {
  switch (priorityLevel) {
    case 'critical':
      return '#ef4444';
    case 'urgent':
      return '#f59e0b';
    case 'moderate':
      return '#f97316';
    case 'routine':
      return '#10b981';
    case 'normal':
      return '#059669';
    default:
      return '#6b7280';
  }
};

// Send push notification (placeholder for future implementation)
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // This would integrate with Firebase Cloud Messaging or similar service
    console.log('Push notification sent:', { userId, title, body, data });
    return { success: true };
  } catch (error) {
    console.error('Push notification failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
  sendOTP,
  sendEmail,
  sendTestResultNotification,
  sendAppointmentReminder,
  sendEmergencyNotification,
  sendDoctorAssignmentNotification,
  sendMedicationReminder,
  sendPushNotification
}; 