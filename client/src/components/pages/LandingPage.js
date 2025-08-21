import React from 'react';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Camera, Brain, Heart, Menu, X } from 'lucide-react';
import { TbHealthRecognition } from "react-icons/tb";
// DevRoleSwitcher removed for production

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);



  const benefits = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Smartphone Camera",
      text: "Use your phone's camera for professional-grade eye screening"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Analysis",
      text: "Advanced algorithms detect conditions with 95%+ accuracy"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Expert Care",
      text: "Connect with certified eye care professionals remotely"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Instant Results",
      text: "Get comprehensive reports within minutes, not days"
    }
  ];

  return (
  <div className="min-h-screen bg-[linear-gradient(180deg,#e6f0ff_0%,#d7e8ff_25%,#cfe2ff_50%,#d0e1ff_75%,#eaf4ff_100%)] relative overflow-hidden">
      {/* Navigation Header (overlay) */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-b-xl px-4 py-2 border border-white/10">
          {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              {/* <TbHealthRecognition  className="w-6 h-6 text-brand-500" /> */}
              <img src="/images/heartbeat.gif" alt="Health GIF" className="w-6 h-6" />

            </div>
            <span className="text-xl font-bold text-white">MediElite</span>
          </Link>

          {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="glass-nav px-4 py-2 text-lg font-semibold transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl">Home</Link>
              <Link to="/about" className="glass-nav px-4 py-2 text-lg font-semibold transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl">About Us</Link>
              <Link to="/contact" className="glass-nav px-4 py-2 text-lg font-semibold transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl">Contact</Link>
              <Link to="/login" className="glass-nav px-4 py-2 text-lg font-semibold transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl">Login</Link>
              <Link to="/doctor/portal" className="glass-nav px-4 py-2 text-lg font-semibold transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl">Doctor Portal</Link>
              <Link to="/onboarding" className="glass-button glass-button--float px-6 py-3 text-lg font-bold shadow-md hover:shadow-2xl transform hover:scale-105">Get Started</Link>
            </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20"
          >
            <div className="px-6 py-4 space-y-4">
              <Link 
                to="/" 
                className="block text-white hover:text-brand-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="block text-white hover:text-brand-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="block text-white hover:text-brand-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/login" 
                className="block text-white hover:text-brand-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/onboarding" 
                className="block glass-button px-6 py-2 text-center text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Full-page Hero with overlayed content */}
      <section className="relative w-full">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src="/images/hero-people.jpg" alt="Healthcare team" className="w-full h-screen object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>

        {/* Overlay content centered and readable on top of image */}
        <div className="relative z-40 flex items-center justify-center h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl text-center p-8 md:p-12 rounded-xl"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
              <span className="block">AI-Powered Health</span>
              <span className="block text-lg md:text-xl mt-2 text-white/90 font-medium">Monitoring & Remote Screening</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-white font-medium max-w-3xl mx-auto">
AI-Powered Health Management System - Complete telemedicine platform for health screening            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/onboarding" className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:-translate-y-1">
                Start Free Screening
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-3 rounded-lg text-lg font-medium backdrop-blur-sm bg-white/5 hover:bg-white/10 transform transition hover:scale-102">Learn More</Link>
            </div>

            {/* benefits small */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * i }} className="text-center">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center text-white mb-2 bg-white/10 rounded-lg shadow-md">
                    {benefit.icon}
                  </div>
                  <div className="text-white text-sm font-semibold">{benefit.title}</div>
                  <p className="text-white/80 text-xs mt-1">{benefit.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose MediElite?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Advanced technology meets compassionate care for the future of eye health
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-8 hover:scale-105 transition-transform duration-300"
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-blue-100">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* How It Works Section
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-blue-100">
              Simple steps to better eye health
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Take Photo</h3>
              <p className="text-blue-100">Use your smartphone camera to capture clear eye images with our guided interface</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Analysis</h3>
              <p className="text-blue-100">Our advanced AI analyzes your images for early detection of eye conditions</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Get Results</h3>
              <p className="text-blue-100">Receive detailed reports and connect with eye care professionals if needed</p>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Testimonials Section
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-blue-100">
              See what doctors and patients are saying about MediElite
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="glass-card p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-100 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-blue-200 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Protect Your Vision?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who trust MediElite for their eye care needs
            </p>
            <Link 
              to="/onboarding"
              className="glass-button text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <span>Start Your Free Screening</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section> */}

      {/* Footer */}
  <footer className="absolute bottom-0 left-0 right-0 z-50 px-6 py-6 border-t border-white/10 bg-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
      {/* <TbHealthRecognition  className="w-5 h-5 text-brand-600" /> */}
        <img src="/images/heartbeat.gif" alt="Health GIF" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white">MediElite</span>
          </div>
          <p className="text-brand-200">
            © 2025 MediElite. All rights reserved. HIPAA compliant and FDA registered.
          </p>
        </div>
      </footer>
  {/* DevRoleSwitcher removed */}
    </div>
  );
};

export default LandingPage; 