import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Shield, 
  Zap, 
  Users, 
  Award,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Star,
  Target,
  Lightbulb,
  Globe
} from 'lucide-react';

const AboutUs = () => {
  const team = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer & Ophthalmologist",
      image: "https://via.placeholder.com/200x200/3b82f6/ffffff?text=Dr.+SJ",
      bio: "Leading ophthalmologist with 15+ years of experience in retinal diseases and AI-assisted diagnostics. Former head of ophthalmology at Johns Hopkins.",
      expertise: ["Retinal Diseases", "AI Diagnostics", "Clinical Research"],
      education: "MD - Harvard Medical School",
      experience: "15+ years",
      linkedin: "#",
      twitter: "#",
      email: "sarah.johnson@eyehealth.ai"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Chief Technology Officer",
      image: "https://via.placeholder.com/200x200/10b981/ffffff?text=MC",
      bio: "Tech visionary with expertise in AI/ML, computer vision, and healthcare technology. Previously led AI teams at Google Health and Microsoft.",
      expertise: ["Machine Learning", "Computer Vision", "Healthcare AI"],
      education: "PhD - Stanford University",
      experience: "12+ years",
      linkedin: "#",
      twitter: "#",
      email: "michael.chen@eyehealth.ai"
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      role: "Head of AI Research",
      image: "https://via.placeholder.com/200x200/f59e0b/ffffff?text=Dr.+ER",
      bio: "AI researcher specializing in medical image analysis and deep learning. Published 50+ papers on computer vision in healthcare.",
      expertise: ["Deep Learning", "Medical Imaging", "Research"],
      education: "PhD - MIT",
      experience: "10+ years",
      linkedin: "#",
      twitter: "#",
      email: "emily.rodriguez@eyehealth.ai"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Lead Software Engineer",
      image: "https://via.placeholder.com/200x200/8b5cf6/ffffff?text=DK",
      bio: "Full-stack developer with expertise in React, Node.js, and cloud architecture. Passionate about building scalable healthcare solutions.",
      expertise: ["React/Node.js", "Cloud Architecture", "DevOps"],
      education: "BS - UC Berkeley",
      experience: "8+ years",
      linkedin: "#",
      twitter: "#",
      email: "david.kim@eyehealth.ai"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "Head of Product & UX",
      image: "https://via.placeholder.com/200x200/ef4444/ffffff?text=LT",
      bio: "Product strategist and UX designer focused on creating intuitive healthcare experiences. Former design lead at Apple Health.",
      expertise: ["Product Strategy", "UX Design", "Healthcare UX"],
      education: "MS - Stanford Design School",
      experience: "9+ years",
      linkedin: "#",
      twitter: "#",
      email: "lisa.thompson@eyehealth.ai"
    },
    {
      id: 6,
      name: "Dr. James Wilson",
      role: "Chief Data Scientist",
      image: "https://via.placeholder.com/200x200/06b6d4/ffffff?text=Dr.+JW",
      bio: "Data scientist specializing in healthcare analytics and predictive modeling. Expert in building robust AI systems for medical applications.",
      expertise: ["Data Science", "Predictive Modeling", "Healthcare Analytics"],
      education: "PhD - Carnegie Mellon",
      experience: "11+ years",
      linkedin: "#",
      twitter: "#",
      email: "james.wilson@eyehealth.ai"
    }
  ];

  const stats = [
    { number: "50K+", label: "Patients Screened", icon: <Users className="w-8 h-8" /> },
    { number: "95%", label: "AI Accuracy Rate", icon: <Award className="w-8 h-8" /> },
    { number: "24/7", label: "Available Support", icon: <Shield className="w-8 h-8" /> },
    { number: "100+", label: "Partner Clinics", icon: <Globe className="w-8 h-8" /> }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Patient-Centered Care",
      description: "Every decision we make is guided by what's best for our patients' health and well-being."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy & Security",
      description: "We maintain the highest standards of data protection and HIPAA compliance."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We continuously push the boundaries of what's possible in healthcare technology."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Accessibility",
      description: "Making quality eye care accessible to everyone, everywhere."
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
            className="inline-flex items-center space-x-2 glass-cta mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About MediElite , Healthcare  AI
            </h1>
            <p className="text-xl text-brand-100 max-w-3xl mx-auto">
              Revolutionizing eye care through cutting-edge AI technology and compassionate healthcare delivery
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mission Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto">
              To democratize access to quality eye care by leveraging artificial intelligence to provide 
              accurate, affordable, and accessible eye health screening to everyone, everywhere. We believe 
              that vision health should not be limited by geography, income, or access to specialists.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-brand-300 mb-4 flex justify-center">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-brand-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Values</h2>
            <p className="text-xl text-brand-100 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-8"
              >
                <div className="text-brand-300 mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-brand-100">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Meet Our Team</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              The brilliant minds behind MediElite, dedicated to transforming healthcare
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="text-center mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/20"
                  />
                  <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-brand-300 font-medium mb-2">{member.role}</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-brand-200 mb-3">
                    <span>{member.education}</span>
                    <span>•</span>
                    <span>{member.experience}</span>
                  </div>
                </div>
                
                <p className="text-brand-100 text-sm mb-4 leading-relaxed">{member.bio}</p>
                
                <div className="mb-4">
                  <h4 className="text-white font-semibold text-sm mb-2">Expertise:</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-brand-500/20 text-brand-200 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-brand-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <div className="flex space-x-2">
                    <a href={member.linkedin} className="text-brand-300 hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href={member.twitter} className="text-brand-300 hover:text-white transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Our Story</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-brand-100 text-lg leading-relaxed mb-6">
                  MediElite was born from a simple observation: millions of people worldwide lack access 
                  to quality eye care, leading to preventable vision loss and blindness. Our founders, 
                  Dr. Sarah Johnson and Michael Chen, recognized that AI technology could bridge this gap.
                </p>
                <p className="text-brand-100 text-lg leading-relaxed mb-6">
                  What started as a research project at Stanford University has grown into a comprehensive 
                  platform that combines cutting-edge AI with compassionate healthcare delivery. Today, 
                  we're proud to serve patients across the globe, providing accurate, affordable, and 
                  accessible eye health screening.
                </p>
                <p className="text-brand-100 text-lg leading-relaxed">
                  Our commitment to innovation, patient care, and accessibility drives everything we do. 
                  We believe that everyone deserves access to quality eye care, regardless of where they live 
                  or their financial situation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-64 h-64 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Eye className="w-32 h-32 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Founded in 2022</h3>
                <p className="text-brand-200">
                  With a mission to democratize eye care through AI technology
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join Us in Transforming Eye Care
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Be part of the revolution in healthcare technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/onboarding"
                className="glass-cta text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
              <Link 
                to="/contact"
                className="glass-button text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Get in Touch</span>
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Gallery (Images from public/images) */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Community & Stories</h2>
+          <p className="text-brand-100 mb-8">Real people, real impact — snapshots from our community</p>
+          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
+            <img src="/images/dipa.jpg" alt="Dipa" className="w-full h-36 object-cover rounded-lg shadow-md" />
+            <img src="/images/pritha.jpg" alt="Pritha" className="w-full h-36 object-cover rounded-lg shadow-md" />
+            <img src="/images/raju.jpg" alt="Raju" className="w-full h-36 object-cover rounded-lg shadow-md" />
+            <img src="/images/rohan.jpg" alt="Rohan" className="w-full h-36 object-cover rounded-lg shadow-md" />
+            <img src="/images/srija.jpg" alt="Srija" className="w-full h-36 object-cover rounded-lg shadow-md" />
+          </div>
+        </div>
+      </section>
*** End Patch
    </div>
  );
};

export default AboutUs;
