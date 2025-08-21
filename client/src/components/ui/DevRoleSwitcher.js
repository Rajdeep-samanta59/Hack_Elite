import React from 'react';

// Small dev helper to switch between patient and doctor roles locally.
// This writes a simple fake token and user to localStorage and reloads the page.
// Only renders when NODE_ENV !== 'production'.

const DevRoleSwitcher = () => {
  if (process.env.NODE_ENV === 'production') return null;

  const setRole = (role) => {
    const fakeUser = {
      id: 'dev_user',
      email: role === 'doctor' ? 'doc@local.dev' : 'patient@local.dev',
      fullName: role === 'doctor' ? 'Dr. Developer' : 'Dev Patient',
      role,
    };
    const fakeToken = 'dev-token-' + Date.now();
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('dev_user', JSON.stringify(fakeUser));
    // Some parts of the app expect authAPI.verify() to return user; AuthProvider calls authAPI.verify().
    // For quick dev, we'll also set a small marker so AuthProvider can pick this up on reload.
    window.location.reload();
  };

  const clear = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('dev_user');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white/5 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-md">
      <div className="text-sm text-white mb-2">Dev Role</div>
      <div className="flex items-center gap-2">
        <button onClick={() => setRole('patient')} className="glass-nav">Patient</button>
        <button onClick={() => setRole('doctor')} className="glass-nav">Doctor</button>
        <button onClick={clear} className="glass-nav">Clear</button>
      </div>
    </div>
  );
};

export default DevRoleSwitcher;
