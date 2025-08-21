import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { 
  Eye, 
  Calendar, 
  FileText, 
  Bell, 
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';

const PatientDashboard = () => {
  const { user, logout, token } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    healthStatus: 'normal',
    riskScore: 0,
    lastTestDate: null,
    nextAppointment: null,
    recentTests: [],
    upcomingAppointments: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [loadErrorShown, setLoadErrorShown] = useState(false);
  const initRef = useRef(false);
  const [doctors, setDoctors] = useState([]);
  const { socket } = useSocket();
  
  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      // small delay to allow auth initialization
      setTimeout(() => {
        window.location.href = '/login';
      }, 200);
    }
  }, [token]);

  useEffect(() => {
    // Wait until we have an auth token before calling protected endpoints
    if (!token) return;
    // Prevent double invocation in React StrictMode during development
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      try {
        setLoading(true);
        // load dashboard
        const res = await patientAPI.getDashboard();
        if (res?.data) setDashboardData(res.data);
      } catch (err) {
        console.error('Load dashboard error:', err?.response?.data || err.message || err);
        if (!loadErrorShown) {
          const serverMessage = err.response?.data?.message;
          toast.error(serverMessage || 'Failed to load dashboard data — server unreachable or returned error. Please ensure backend is running.');
          setLoadErrorShown(true);
        }
      }

      // load doctors (public)
        try {
          const resp = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/doctors');
          if (resp.ok) {
            const data = await resp.json();
            setDoctors(data || []);
          }
        } catch (err) {
          console.error('Failed to load doctors', err);
        } finally {
          setLoading(false);
        }
    })();

    if (!socket) return undefined;

    const handler = () => loadDoctors();
    socket.on('doctors-updated', handler);
    return () => {
      socket.off('doctors-updated', handler);
    };
  }, [socket, loadErrorShown, token]);

  // loadDashboardData inlined into useEffect; kept helper functions for doctors

  const loadDoctors = async () => {
    try {
      // use axios instance for consistent baseURL and error handling
      const res = await (await import('../../services/api')).default.get('/doctors');
      setDoctors(res.data || []);
    } catch (err) {
      console.error('Failed to load doctors', err);
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'text-health-critical';
      case 'urgent':
        return 'text-health-urgent';
      case 'moderate':
        return 'text-health-moderate';
      case 'routine':
        return 'text-health-routine';
      case 'normal':
        return 'text-health-normal';
      default:
        return 'text-gray-400';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'critical':
      case 'urgent':
        return <AlertTriangle className="w-6 h-6 text-health-critical" />;
      case 'moderate':
        return <AlertTriangle className="w-6 h-6 text-health-moderate" />;
      case 'routine':
        return <CheckCircle className="w-6 h-6 text-health-routine" />;
      case 'normal':
        return <CheckCircle className="w-6 h-6 text-health-normal" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: 'Take Eye Test',
      description: 'Start a new screening',
      link: '/patient/eye-test',
      color: 'bg-blue-500'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'View Results',
      description: 'Check latest reports',
      link: '/patient/results/latest',
      color: 'bg-green-500'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Book Appointment',
      description: 'Schedule with doctor',
      link: '/patient/appointments',
      color: 'bg-purple-500'
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Medication Reminder',
      description: 'Set up reminders',
      link: '/patient/medications',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)]">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MediElite</h1>
              <p className="text-brand-200 text-sm">Patient Portal</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <motion.button whileHover={{ y: -3 }} className="glass-button glass-button--float">
              <Bell className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ y: -3 }} className="glass-button">
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ y: -3 }} onClick={logout} className="glass-button">
              <LogOut className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.fullName || 'Patient'}! 👋
            </h2>
            <p className="text-blue-200">
              Here's your eye health overview for today
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Health Status Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Health Status</h3>
                  <div className="flex items-center space-x-2">
                    {getHealthStatusIcon(dashboardData.healthStatus)}
                    <span className={`font-semibold ${getHealthStatusColor(dashboardData.healthStatus)}`}>
                      {dashboardData.healthStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{dashboardData.riskScore}</div>
                    <div className="text-blue-200 text-sm">Risk Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {dashboardData.recentTests.length}
                    </div>
                    <div className="text-blue-200 text-sm">Tests This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {dashboardData.upcomingAppointments.length}
                    </div>
                    <div className="text-blue-200 text-sm">Upcoming Appointments</div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="glass-card p-4 hover:scale-105 transition-transform duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{action.title}</h4>
                          <p className="text-blue-200 text-sm">{action.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {dashboardData.recentTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Eye Test #{test.id}</p>
                          <p className="text-blue-200 text-sm">{test.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`priority-badge priority-${test.priority}`}>
                          {test.priority}
                        </span>
                        <p className="text-blue-200 text-sm mt-1">{test.confidence}% confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Emergency Banner */}
              {dashboardData.healthStatus === 'critical' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-6 bg-red-500/20 border border-red-400/30"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <h4 className="text-white font-semibold">Urgent Attention Required</h4>
                  </div>
                  <p className="text-red-200 text-sm mb-4">
                    Your recent test results require immediate medical attention.
                  </p>
                  <Link to="/patient/appointments" className="glass-button w-full text-center">
                    Book Emergency Appointment
                  </Link>
                </motion.div>
              )}

              {/* Upcoming Appointments */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Appointments</h3>
                {dashboardData.upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.upcomingAppointments.map((apt, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white font-medium">{apt.doctor}</p>
                        <p className="text-blue-200 text-sm">{apt.date} at {apt.time}</p>
                        <p className="text-blue-300 text-xs">{apt.type}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-200 text-sm">No upcoming appointments</p>
                )}
                <Link to="/patient/appointments" className="glass-button w-full mt-4 text-center">
                  Book Appointment
                </Link>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                {dashboardData.notifications.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.notifications.map((notif, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <p className="text-blue-200 text-sm">{notif.message}</p>
                        <p className="text-blue-300 text-xs">{notif.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-200 text-sm">No new notifications</p>
                )}
              </motion.div>

              {/* Available Doctors */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Available Doctors</h3>
                {doctors.length > 0 ? (
                  <div className="space-y-3">
                    {doctors.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3">
                        <img src={doc.imageUrl || '/images/avatar-placeholder.png'} alt={doc.fullName} className="w-10 h-10 rounded-full object-cover" onError={(e)=>{e.target.onerror=null; e.target.src='/images/avatar-placeholder.png'}} />
                        <div>
                          <div className="text-white font-medium">{doc.fullName}</div>
                          <div className="text-blue-200 text-sm">{doc.specialty || 'Not specified'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-200 text-sm">No doctors available yet</p>
                )}
              </motion.div>

              {/* Health Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Health Tips</h3>
                <div className="space-y-3 text-sm text-blue-200">
                  <p>• Take regular breaks from screens</p>
                  <p>• Maintain good lighting while reading</p>
                  <p>• Stay hydrated for eye health</p>
                  <p>• Schedule annual eye exams</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 