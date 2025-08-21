import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.listDoctors();
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctors');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadDoctors(); }, []);

  // Doctor creation via admin panel disabled - admin can only remove doctors.

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteDoctor(id);
      toast.success('Doctor removed');
      loadDoctors();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove doctor');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[linear-gradient(180deg,#e6f0ff_0%,#d7e8ff_25%,#cfe2ff_50%,#d0e1ff_75%,#eaf4ff_100%)]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-sky-900 mb-4">Admin Panel</h2>
        <div className="glass-card p-4 mb-6">
          <h3 className="font-semibold mb-2">Doctors (admin can only remove)</h3>
          <p className="text-sm text-sky-700 mb-3">Doctor creation via admin panel is disabled. Doctors must register themselves. Admin can remove doctors below.</p>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-semibold mb-2">Doctors</h3>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-3">
              {doctors.map(d => (
                <div key={d._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {d.imageUrl ? (
                      <img
                        src={d.imageUrl}
                        alt={d.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/avatar-placeholder.png'; }}
                      />
                    ) : (
                      <img src="/images/avatar-placeholder.png" alt="placeholder" className="w-12 h-12 rounded-full object-cover" />
                    )}
                    <div>
                      <div className="font-semibold">{d.fullName}</div>
                      <div className="text-sm text-sky-700">{d.email} • {d.specialty || 'Not specified'}</div>
                    </div>
                  </div>
                  <div>
                    <button onClick={()=>handleDelete(d._id)} className="text-red-500">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
