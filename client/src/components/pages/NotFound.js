import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)] flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center bg-white/5 backdrop-blur rounded-2xl p-10">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Oops — page not found</h1>
        <p className="text-brand-200 mb-6">It seems the page you're looking for doesn't exist. Try one of the links below.</p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="glass-cta px-5 py-3">Home</Link>
          <Link to="/login" className="glass-cta px-5 py-3">Login</Link>
          <Link to="/onboarding" className="glass-cta px-5 py-3">Get Started</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
