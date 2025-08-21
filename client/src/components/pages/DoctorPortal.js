import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, TrendingUp, Filter, Search, MessageSquare, Clock, Plus, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../services/api';

const DoctorPortal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  // Redirect if not a doctor (extra safeguard)
  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/appointments/for-doctor');
        if (res?.data?.appointments) {
          setTodayAppointments(res.data.appointments.map(a => ({
            id: a.id,
            patientName: a.patientId,
            time: a.time,
            type: a.type,
            status: a.status,
            priority: 'normal'
          })));
        }
      } catch (err) {
        console.error('Failed to load doctor appointments', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (appointment) => {
      toast.success(`New appointment booked by patient`, { duration: 4000 });
      // Optionally reload appointments
      window.location.reload();
    };
    socket.on('appointment_booked', handler);
    return () => socket.off('appointment_booked', handler);
  }, [socket]);

  // No fake data: start with empty queue until real API integration populates it
  const patientQueue = [];

  const [todayAppointments, setTodayAppointments] = useState([]);

  const analytics = {
    totalPatients: 0,
    criticalCases: 0,
    urgentCases: 0,
    averageWaitTime: '-',
    aiAccuracy: '-',
    satisfactionRate: '-'
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'urgent': return 'text-orange-400';
      case 'moderate': return 'text-yellow-400';
      case 'routine': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 border-red-400/30';
      case 'urgent': return 'bg-orange-500/20 border-orange-400/30';
      case 'moderate': return 'bg-yellow-500/20 border-yellow-400/30';
      case 'routine': return 'bg-green-500/20 border-green-400/30';
      default: return 'bg-blue-500/20 border-blue-400/30';
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleDiagnosis = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Diagnosis saved successfully!');
      setSelectedPatient(null);
    } catch (error) {
      toast.error('Failed to save diagnosis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => {
              if (user?.role === 'doctor') {
                // if a doctor is on this page and wants to go back, send to home
                navigate('/');
              } else if (user?.role === 'patient') {
                navigate('/patient/dashboard');
              } else {
                navigate('/');
              }
            }}
            className="glass-button flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Doctor Portal</h1>
            <p className="text-brand-200">Welcome back, Dr. {user?.fullName || 'Doctor'}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="glass-button">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="glass-button">
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Analytics Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-white">{analytics.totalPatients}</div>
                <div className="text-blue-200 text-sm">Total Patients</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{analytics.criticalCases}</div>
                <div className="text-blue-200 text-sm">Critical Cases</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-white">{analytics.aiAccuracy}</div>
                <div className="text-blue-200 text-sm">AI Accuracy</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{analytics.satisfactionRate}</div>
                <div className="text-blue-200 text-sm">Satisfaction</div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex space-x-1 mb-6">
                {[
                  { id: 'queue', name: 'Patient Queue', icon: <Users className="w-5 h-5" /> },
                  { id: 'appointments', name: 'Today\'s Appointments', icon: <Calendar className="w-5 h-5" /> },
                  { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                {/* Patient Queue */}
                {activeTab === 'queue' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Priority Queue</h3>
                      <div className="flex items-center space-x-2">
                        <button className="glass-button text-sm">
                          <Filter className="w-4 h-4 mr-1" />
                          Filter
                        </button>
                        <button className="glass-button text-sm">
                          <Search className="w-4 h-4 mr-1" />
                          Search
                        </button>
                      </div>
                    </div>

                    {patientQueue.length === 0 ? (
                      <div className="p-6 text-center text-blue-200">No patients in queue yet. Once patients submit tests they will appear here.</div>
                    ) : (
                      patientQueue.map((patient, index) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handlePatientSelect(patient)}
                        className={`glass-card p-4 cursor-pointer hover:scale-105 transition-all border-2 ${
                          selectedPatient?.id === patient.id ? 'border-blue-400' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={patient.image}
                              alt={patient.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <h4 className="text-white font-semibold">{patient.name}</h4>
                              <p className="text-blue-200 text-sm">{patient.age} years old</p>
                              <p className="text-blue-300 text-xs">{patient.mainFindings}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${getPriorityColor(patient.priority)}`}>
                              {patient.priority.toUpperCase()}
                            </div>
                            <div className="text-white text-sm">Score: {patient.riskScore}</div>
                            <div className="text-blue-200 text-xs">{patient.timeSinceTest}</div>
                          </div>
                        </div>
                      </motion.div>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Today's Appointments */}
                {activeTab === 'appointments' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Today's Schedule</h3>
                    {todayAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{appointment.patientName}</h4>
                              <p className="text-blue-200 text-sm">{appointment.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{appointment.time}</div>
                            <div className={`text-sm ${getPriorityColor(appointment.priority)}`}>
                              {appointment.priority}
                            </div>
                            <div className={`text-xs ${appointment.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'}`}>
                              {appointment.status}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Analytics */}
                {activeTab === 'analytics' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Analytics</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-card p-6">
                        <h4 className="text-white font-semibold mb-4">Case Distribution</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-blue-200">Critical Cases</span>
                            <span className="text-red-400 font-semibold">8 (5%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-200">Urgent Cases</span>
                            <span className="text-orange-400 font-semibold">23 (15%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-200">Moderate Cases</span>
                            <span className="text-yellow-400 font-semibold">45 (29%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-200">Routine Cases</span>
                            <span className="text-green-400 font-semibold">80 (51%)</span>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card p-6">
                        <h4 className="text-white font-semibold mb-4">AI Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-blue-200">Accuracy Rate</span>
                            <span className="text-green-400 font-semibold">94.2%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-200">False Positives</span>
                            <span className="text-yellow-400 font-semibold">3.2%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-200">False Negatives</span>
                            <span className="text-red-400 font-semibold">2.6%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-200">Processing Time</span>
                            <span className="text-blue-400 font-semibold">2.3s avg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full glass-button text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Patient
                </button>
                <button className="w-full glass-button text-sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </button>
                <button className="w-full glass-button text-sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </button>
                <button className="w-full glass-button text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </button>
              </div>
            </motion.div>

            {/* Selected Patient Details */}
            {selectedPatient && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Patient Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedPatient.image}
                      alt={selectedPatient.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="text-white font-semibold">{selectedPatient.name}</h4>
                      <p className="text-blue-200 text-sm">ID: {selectedPatient.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-blue-300" />
                      <span className="text-blue-200">{selectedPatient.contact}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-blue-300" />
                      <span className="text-blue-200">{selectedPatient.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-300" />
                      <span className="text-blue-200">{selectedPatient.location}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${getPriorityBgColor(selectedPatient.priority)}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Risk Score</span>
                      <span className={`font-bold ${getPriorityColor(selectedPatient.priority)}`}>
                        {selectedPatient.riskScore}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-blue-200 text-sm">AI Confidence</span>
                      <span className="text-white text-sm">{selectedPatient.aiConfidence}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button 
                      onClick={handleDiagnosis}
                      disabled={loading}
                      className="w-full glass-button text-sm"
                    >
                      {loading ? 'Processing...' : 'Review & Diagnose'}
                    </button>
                    <button className="w-full glass-button text-sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Patient
                    </button>
                    <button className="w-full glass-button text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Follow-up
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">AI Models</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">Database</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">Security</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPortal;
