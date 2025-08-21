import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { eyeTestAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ResultsViewer = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadTestResults();
  }, [testId]);

  const loadTestResults = async () => {
    try {
      // Mock data for demonstration
      const mockResults = {
        id: testId,
        date: '2024-01-20T10:30:00Z',
        priorityLevel: 'moderate',
        riskScore: 65,
        status: 'completed',
        aiConfidence: 88,
        detectedConditions: [
          { name: 'conjunctivitis', probability: 0.75, confidence: 0.85 },
          { name: 'swelling', probability: 0.45, confidence: 0.78 }
        ],
        aiAnalysis: {
          externalConditions: {
            conjunctivitis: { probability: 0.75, confidence: 0.85 },
            stye: { probability: 0.15, confidence: 0.90 },
            ptosis: { probability: 0.05, confidence: 0.88 },
            swelling: { probability: 0.45, confidence: 0.78 }
          },
          colorAnalysis: {
            conjunctiva: {
              color: 'red',
              healthIndicator: 'irritation',
              severity: 'moderate'
            },
            sclera: {
              color: 'white',
              healthIndicator: 'healthy',
              severity: 'none'
            }
          },
          structuralAnalysis: {
            symmetry: { score: 0.92, issues: [] },
            alignment: { score: 0.88, issues: ['minor_alignment_issue'] },
            shape: { score: 0.94, issues: [] }
          },
          riskAssessment: {
            overallScore: 65,
            factors: [
              { factor: 'age', weight: 0.2, contribution: 8 },
              { factor: 'family_history', weight: 0.1, contribution: 0 },
              { factor: 'lifestyle', weight: 0.15, contribution: 5 },
              { factor: 'previous_conditions', weight: 0.25, contribution: 0 },
              { factor: 'current_symptoms', weight: 0.3, contribution: 52 }
            ],
            recommendations: [
              'Schedule follow-up with ophthalmologist',
              'Monitor symptoms for any changes',
              'Avoid eye strain and maintain good hygiene',
              'Consider over-the-counter eye drops for relief'
            ]
          }
        },
        doctorReview: null,
        images: [
          {
            url: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Eye+Image+1',
            type: 'left_eye',
            quality: { score: 85, factors: { focus: 90, lighting: 80, stability: 85, eyeOpenness: 85 } }
          },
          {
            url: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Eye+Image+2',
            type: 'right_eye',
            quality: { score: 82, factors: { focus: 88, lighting: 75, stability: 82, eyeOpenness: 83 } }
          }
        ]
      };

      setTestResults(mockResults);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load test results');
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!testResults) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Test Results Not Found</h2>
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="glass-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate('/patient/dashboard')}
            className="glass-button flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Test Results</h1>
            <p className="text-brand-200">Test ID: {testResults.id}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {getPriorityIcon(testResults.priorityLevel)}
            <span className={`font-semibold ${getPriorityColor(testResults.priorityLevel)}`}>
              {testResults.priorityLevel.toUpperCase()}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Priority Alert */}
            {testResults.priorityLevel === 'critical' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 bg-red-500/20 border border-red-400/30"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <h3 className="text-xl font-bold text-white">Urgent Attention Required</h3>
                </div>
                <p className="text-red-200 mb-4">
                  Your test results indicate a critical condition that requires immediate medical attention.
                </p>
                <button className="glass-button bg-red-500/20 border-red-400/30">
                  Book Emergency Appointment
                </button>
              </motion.div>
            )}

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex space-x-1 mb-6">
                {['overview', 'analysis', 'images', 'recommendations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-white text-brand-600'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-3xl font-bold text-white mb-2">{testResults.riskScore}</div>
                        <div className="text-brand-200 text-sm">Risk Score</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-3xl font-bold text-white mb-2">{testResults.aiConfidence}%</div>
                        <div className="text-brand-200 text-sm">AI Confidence</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-3xl font-bold text-white mb-2">{testResults.detectedConditions.length}</div>
                        <div className="text-brand-200 text-sm">Conditions Detected</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Detected Conditions</h3>
                      <div className="space-y-3">
                        {testResults.detectedConditions.map((condition, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-white font-medium capitalize">
                              {condition.name.replace(/_/g, ' ')}
                            </span>
                            <div className="text-right">
                              <div className="text-white font-semibold">
                                {(condition.probability * 100).toFixed(0)}%
                              </div>
                              <div className="text-blue-200 text-sm">
                                {(condition.confidence * 100).toFixed(0)}% confidence
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'analysis' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">External Conditions Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(testResults.aiAnalysis.externalConditions).map(([condition, data]) => (
                          <div key={condition} className="p-4 bg-white/5 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium capitalize">
                                {condition.replace(/_/g, ' ')}
                              </span>
                              <span className="text-blue-200 text-sm">
                                {(data.confidence * 100).toFixed(0)}% confidence
                              </span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${data.probability * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-white text-sm">
                                {(data.probability * 100).toFixed(1)}% probability
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Color Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(testResults.aiAnalysis.colorAnalysis).map(([region, data]) => (
                          <div key={region} className="p-4 bg-white/5 rounded-lg">
                            <h4 className="text-white font-medium capitalize mb-2">
                              {region.replace(/_/g, ' ')}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-200">Color:</span>
                                <span className="text-white capitalize">{data.color}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-200">Health Indicator:</span>
                                <span className="text-white capitalize">{data.healthIndicator}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-200">Severity:</span>
                                <span className="text-white capitalize">{data.severity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'images' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Test Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {testResults.images.map((image, index) => (
                        <div key={index} className="space-y-3">
                          <img
                            src={image.url}
                            alt={`Eye image ${index + 1}`}
                            className="w-full rounded-lg border border-white/20"
                          />
                          <div className="p-3 bg-white/5 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium capitalize">
                                {image.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-blue-200 text-sm">
                                Quality: {image.quality.score}%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-blue-200">Focus:</span>
                                <span className="text-white">{image.quality.factors.focus}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-200">Lighting:</span>
                                <span className="text-white">{image.quality.factors.lighting}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-200">Stability:</span>
                                <span className="text-white">{image.quality.factors.stability}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-200">Eye Openness:</span>
                                <span className="text-white">{image.quality.factors.eyeOpenness}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'recommendations' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
                      <div className="space-y-3">
                        {testResults.aiAnalysis.riskAssessment.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-white">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
                      <div className="space-y-3">
                        {testResults.aiAnalysis.riskAssessment.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-white capitalize">
                              {factor.factor.replace(/_/g, ' ')}
                            </span>
                            <div className="text-right">
                              <div className="text-white font-semibold">
                                {factor.contribution} points
                              </div>
                              <div className="text-blue-200 text-sm">
                                Weight: {(factor.weight * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Test Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Test Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-200">Test Date:</span>
                  <span className="text-white">
                    {new Date(testResults.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Status:</span>
                  <span className="text-white capitalize">{testResults.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Priority Level:</span>
                  <span className={`font-semibold ${getPriorityColor(testResults.priorityLevel)}`}>
                    {testResults.priorityLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Risk Score:</span>
                  <span className="text-white font-semibold">{testResults.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">AI Confidence:</span>
                  <span className="text-white font-semibold">{testResults.aiConfidence}%</span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full glass-button">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Follow-up
                </button>
                <button className="w-full glass-button">
                  <FileText className="w-5 h-5 mr-2" />
                  Download Report
                </button>
                <button className="w-full glass-button">
                  <User className="w-5 h-5 mr-2" />
                  Share with Doctor
                </button>
              </div>
            </motion.div>

            {/* Doctor Review */}
            {testResults.doctorReview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Doctor Review</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-blue-200 text-sm">Reviewed by:</span>
                    <p className="text-white font-medium">{testResults.doctorReview.doctorName}</p>
                  </div>
                  <div>
                    <span className="text-blue-200 text-sm">Diagnosis:</span>
                    <p className="text-white">{testResults.doctorReview.diagnosis}</p>
                  </div>
                  <div>
                    <span className="text-blue-200 text-sm">Notes:</span>
                    <p className="text-white">{testResults.doctorReview.notes}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsViewer; 