import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const NewPatient = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Minimal create form placeholder - extend with real API calls
  const handleCreate = (e) => {
    e.preventDefault();
    toast.success('New patient created (placeholder)');
    navigate('/doctor/portal');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full glass-card p-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Create New Patient</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input name="fullName" placeholder="Full name" className="w-full p-3 rounded bg-white/5 text-white" required />
          <input name="email" placeholder="Email" className="w-full p-3 rounded bg-white/5 text-white" />
          <input name="phone" placeholder="Phone" className="w-full p-3 rounded bg-white/5 text-white" />
          <div className="flex justify-end">
            <button className="glass-button px-6 py-2" type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatient;
