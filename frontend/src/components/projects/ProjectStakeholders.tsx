import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, X, CheckCircle, Clock, AlertCircle, 
  User, Briefcase, HardHat, Ruler, Calculator, Crown, 
  Building2, RefreshCw, Trash2, Send, Loader2
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface Stakeholder {
  id: number;
  user_id: number;
  name: string;
  email: string;
  stakeholder_type: string;
  invite_status: string;
  invited_at: string;
  is_active: boolean;
}

interface ProjectStakeholdersProps {
  projectId: number;
  projectName: string;
}

const stakeholderTypes = [
  { value: 'client', label: 'Client/Owner', icon: Crown, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'consultant', label: 'Consultant', icon: Briefcase, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'architect', label: 'Architect', icon: Ruler, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { value: 'structural_engineer', label: 'Structural Engineer', icon: HardHat, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'electrical_engineer', label: 'Electrical Engineer', icon: HardHat, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'mechanical_engineer', label: 'Mechanical Engineer', icon: HardHat, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'quantity_surveyor', label: 'Quantity Surveyor', icon: Calculator, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'project_manager', label: 'Project Manager', icon: Users, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
];

export function ProjectStakeholders({ projectId, projectName }: ProjectStakeholdersProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteType, setInviteType] = useState('consultant');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStakeholders();
  }, [projectId]);

  const fetchStakeholders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStakeholders(data);
      } else {
        console.error('Error fetching stakeholders:', data);
      }
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStakeholders();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          stakeholderType: inviteType
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        setInviteName('');
        setInviteType('consultant');
        setTimeout(() => {
          setShowInviteModal(false);
          setSuccess('');
        }, 2000);
        fetchStakeholders();
      } else {
        setError(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (stakeholderId: number, stakeholderName: string) => {
    if (!confirm(`Remove ${stakeholderName} from this project?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders/${stakeholderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchStakeholders();
        setSuccess(`${stakeholderName} removed from project`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error removing stakeholder:', error);
      setError('Failed to remove stakeholder');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResendInvite = async (email: string, name: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          name: name
        })
      });
      
      if (response.ok) {
        setSuccess(`Invitation resent to ${email}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error resending invite:', error);
      setError('Failed to resend invitation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle size={12} /> Accepted</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock size={12} /> Pending</span>;
      case 'declined':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle size={12} /> Declined</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{status}</span>;
    }
  };

  const getStakeholderIcon = (type: string) => {
    const found = stakeholderTypes.find(t => t.value === type);
    const Icon = found?.icon || Users;
    return <Icon size={18} className={found?.color?.split(' ')[0] || 'text-gray-500'} />;
  };

  const getStakeholderLabel = (type: string) => {
    const found = stakeholderTypes.find(t => t.value === type);
    return found?.label || type;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={20} className="text-amber-500" />
            Project Stakeholders
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage clients, consultants, and other stakeholders for <span className="font-medium">{projectName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition rounded-lg border"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
          >
            <UserPlus size={16} />
            Invite Stakeholder
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Stakeholders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      ) : stakeholders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No stakeholders added yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Invite clients, consultants, or engineers to collaborate</p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
          >
            <UserPlus size={16} />
            Invite Your First Stakeholder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {stakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  {getStakeholderIcon(stakeholder.stakeholder_type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 dark:text-white">{stakeholder.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stakeholderTypes.find(t => t.value === stakeholder.stakeholder_type)?.color || 'bg-gray-100'}`}>
                      {getStakeholderLabel(stakeholder.stakeholder_type)}
                    </span>
                    {getStatusBadge(stakeholder.invite_status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Mail size={12} />
                    {stakeholder.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Invited: {formatDate(stakeholder.invited_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stakeholder.invite_status === 'pending' && (
                  <button
                    onClick={() => handleResendInvite(stakeholder.email, stakeholder.name)}
                    className="p-1.5 text-blue-500 hover:text-blue-600 transition rounded"
                    title="Resend invitation"
                  >
                    <Send size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleRemove(stakeholder.id, stakeholder.name)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition rounded"
                  title="Remove from project"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Stakeholder</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., John Mwangi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="john@example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    They will receive an invitation email with login instructions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inviteType}
                    onChange={(e) => setInviteType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {stakeholderTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}