import React from 'react';
import toast from 'react-hot-toast';

const GenerateReport = () => {
  const handleGenerate = () => {
    // Placeholder: in real app, call endpoint to assemble PDF/report
    toast.success('Report generation started (placeholder).');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full glass-card p-8 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Generate Report</h2>
        <p className="text-white/80 mb-6">Generate a patient report (placeholder). Connect to server to produce real PDF reports.</p>
        <button onClick={handleGenerate} className="glass-button px-6 py-3">Generate</button>
      </div>
    </div>
  );
};

export default GenerateReport;
