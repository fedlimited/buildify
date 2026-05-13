import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { StakeholderProjectPortal } from './StakeholderProjectPortal';

export function StakeholderPreview() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [isContractor, setIsContractor] = useState(false);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    if (authUser.role === 'admin' || authUser.role === 'super_admin') {
      setIsContractor(true);
    } else {
      navigate('/stakeholder/dashboard');
    }
  }, [navigate]);

  if (!isContractor) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={48} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Preview Banner */}
      <div className="bg-amber-500 text-white px-4 py-2 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={20} />
            <span className="font-medium">Stakeholder Preview Mode</span>
            <span className="text-sm opacity-90">- You are viewing this project as a stakeholder would see it</span>
          </div>
          <button
            onClick={() => navigate('/dashboard?module=projects')}
            className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition"
          >
            <ArrowLeft size={16} />
            Exit Preview
          </button>
        </div>
      </div>

      {/* Stakeholder Project Portal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <StakeholderProjectPortal />
      </div>
    </div>
  );
}