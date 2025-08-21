import axios from 'axios';

const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';
console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  biometricVerify: (biometricData) => api.post('/auth/biometric-verify', biometricData),
  enableBiometric: (biometricTemplate) => api.post('/auth/enable-biometric', biometricTemplate),
  // OTP endpoints removed - use face verification flow instead.
  // sendOTP: (phone) => api.post('/auth/otp-send', { phone }),
  // verifyOTP: (phone, otp) => api.post('/auth/otp-verify', { phone, otp }),
  verify: () => api.get('/auth/verify'),
};

// Patient endpoints
export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (profileData) => api.put('/patient/profile', profileData),
  getMedicalHistory: () => api.get('/patient/medical-history'),
  updateMedicalHistory: (historyData) => api.post('/patient/medical-history', historyData),
  getDashboard: () => api.get('/patient/dashboard'),
};

// Eye test endpoints
export const eyeTestAPI = {
  capture: (imageData) => api.post('/test/capture', imageData),
  upload: (formData) => api.post('/test/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResults: (testId) => api.get(`/test/results/${testId}`),
  getHistory: () => api.get('/test/history'),
  getLatestResults: () => api.get('/test/latest-results'),
};

// AI analysis endpoints
export const aiAPI = {
  analyze: (imageData) => api.post('/ai/analyze', imageData),
  getResults: (analysisId) => api.get(`/ai/results/${analysisId}`),
  submitFeedback: (feedbackData) => api.post('/ai/feedback', feedbackData),
};

// Appointment endpoints
export const appointmentAPI = {
  getAvailable: (params) => api.get('/appointments/available', { params }),
  book: (appointmentData) => api.post('/appointments/book', appointmentData),
  update: (appointmentId, updateData) => api.put(`/appointments/${appointmentId}`, updateData),
  cancel: (appointmentId) => api.delete(`/appointments/${appointmentId}`),
  getMyAppointments: () => api.get('/appointments/my-appointments'),
};

// Doctor endpoints
export const doctorAPI = {
  getQueue: () => api.get('/doctor/queue'),
  getPatient: (patientId) => api.get(`/doctor/patient/${patientId}`),
  submitDiagnosis: (diagnosisData) => api.post('/doctor/diagnosis', diagnosisData),
  createPrescription: (prescriptionData) => api.post('/doctor/prescription', prescriptionData),
  getTodayAppointments: () => api.get('/doctor/today-appointments'),
  getPendingReviews: () => api.get('/doctor/pending-reviews'),
};

// Admin endpoints
export const adminAPI = {
  listDoctors: () => api.get('/admin/doctors'),
  createDoctor: (data) => api.post('/admin/doctors', data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
};

// File upload endpoints
export const uploadAPI = {
  uploadImage: (file, type = 'eye-test') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadBiometric: (file) => {
    const formData = new FormData();
    formData.append('biometric', file);
    return api.post('/upload/biometric', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api; 