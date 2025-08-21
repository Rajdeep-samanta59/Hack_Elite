import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  HelpCircle,
  Shield,
  Users,
  Globe,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const offices = [
    {
      city: "San Francisco",
      country: "United States",
      address: "123 Innovation Drive, Suite 100",
      phone: "+1 (555) 123-4567",
      email: "sf@eyehealth.ai",
      hours: "Mon-Fri: 9AM-6PM PST",
      timezone: "PST"
    },
    {
      city: "New York",
      country: "United States", 
      address: "456 Tech Avenue, Floor 15",
      phone: "+1 (555) 234-5678",
      email: "nyc@eyehealth.ai",
      hours: "Mon-Fri: 9AM-6PM EST",
      timezone: "EST"
    },
    {
      city: "London",
      country: "United Kingdom",
      address: "789 Innovation Street, EC1A 1BB",
      phone: "+44 20 7123 4567",
      email: "london@eyehealth.ai",
      hours: "Mon-Fri: 9AM-6PM GMT",
      timezone: "GMT"
    }
  ];

  const supportOptions = [
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: "General Support",
      description: "Get help with account issues, billing, or general questions",
      email: "support@eyehealth.ai",
      response: "Within 24 hours"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Technical Support",
      description: "Technical issues, app problems, or integration help",
      email: "tech@eyehealth.ai",
      response: "Within 4 hours"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Partnership Inquiries",
      description: "For healthcare providers, clinics, or business partnerships",
      email: "partnerships@eyehealth.ai",
      response: "Within 48 hours"
    }
  ];

  const faqs = [
    {
      question: "How accurate is the AI analysis?",
      answer: "Our AI models achieve 95%+ accuracy in detecting eye conditions, validated by leading medical institutions."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we maintain HIPAA compliance and use end-to-end encryption to protect all patient data."
    },
    {
      question: "Can I use this without a doctor?",
      answer: "While our AI provides screening, we always recommend consulting with healthcare professionals for diagnosis and treatment."
    },
    {
      question: "What devices are supported?",
      answer: "Our platform works on any modern smartphone with a camera. We support iOS 12+ and Android 8+."
    }
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8"
      >
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 glass-nav mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-brand-100 max-w-3xl mx-auto">
              Get in touch with our team. We're here to help with any questions about MediElite.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-200 focus:outline-none focus:border-brand-400"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-200 focus:outline-none focus:border-brand-400"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-200 focus:outline-none focus:border-brand-400"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-brand-400"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-brand-200 focus:outline-none focus:border-brand-400 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full glass-cta text-lg py-4 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Quick Contact */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-brand-200">hello@eyehealth.ai</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <p className="text-brand-200">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Support Hours</p>
                    <p className="text-brand-200">24/7 Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Options */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Support Options</h2>
              <div className="space-y-4">
                {supportOptions.map((option, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="text-brand-300 mt-1">{option.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{option.title}</h3>
                        <p className="text-brand-200 text-sm mb-2">{option.description}</p>
                        <div className="flex items-center justify-between">
                          <a 
                            href={`mailto:${option.email}`}
                            className="text-brand-300 hover:text-white transition-colors text-sm"
                          >
                            {option.email}
                          </a>
                          <span className="text-brand-200 text-xs">{option.response}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Office Locations */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Offices</h2>
            <p className="text-brand-100">Visit us at one of our global locations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{office.city}</h3>
                  <p className="text-brand-300">{office.country}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-brand-300 mt-1 flex-shrink-0" />
                    <p className="text-brand-200 text-sm">{office.address}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-brand-300 flex-shrink-0" />
                    <p className="text-brand-200 text-sm">{office.phone}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-brand-300 flex-shrink-0" />
                    <p className="text-brand-200 text-sm">{office.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-brand-300 flex-shrink-0" />
                    <p className="text-brand-200 text-sm">{office.hours} ({office.timezone})</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-blue-100">Find answers to common questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-blue-300" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-blue-200 text-sm leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-16"
        >
          <div className="glass-card p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who trust MediElite for their eye care needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/onboarding"
                className="glass-cta text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Start Free Screening</span>
                <CheckCircle className="w-5 h-5" />
              </Link>
              <Link 
                to="/about"
                className="glass-cta text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Learn More</span>
                <Globe className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ContactUs;
