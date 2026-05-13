import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Phone, Building2, MapPin, 
  User, Briefcase, HardHat, Ruler, Calculator, Crown,
  Edit2, Trash2, X, Plus, Loader2, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface TeamMember {
  id: number;
  project_id: number;
  role: string;
  name: string;
  firm_name: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

interface ProjectTeamManagerProps {
  projectId: number;
  projectName: string;
}

const roleOptions = [
  { value: 'Project Manager', label: 'Project Manager', icon: User },
  { value: 'Architect', label: 'Architect', icon: Ruler },
  { value: 'Structural Engineer', label: 'Structural Engineer', icon: HardHat },
  { value: 'Electrical Engineer', label: 'Electrical Engineer', icon: HardHat },
  { value: 'Mechanical Engineer', label: 'Mechanical Engineer', icon: HardHat },
  { value: 'Quantity Surveyor', label: 'Quantity Surveyor', icon: Calculator },
  { value: 'Civil Engineer', label: 'Civil Engineer', icon: HardHat },
  { value: 'Interior Designer', label: 'Interior Designer', icon: Building2 },
  { value: 'Landscape Architect', label: 'Landscape Architect', icon: Building2 },
  { value: 'Main Contractor', label: 'Main Contractor', icon: Briefcase },
  { value: 'Client Representative', label: 'Client Representative', icon: Crown },
  { value: 'Other', label: 'Other Consultant', icon: Users },
];

export function ProjectTeamManager({ projectId, projectName }: ProjectTeamManagerProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    role: 'Project Manager',
    name: '',
    firm_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = editingMember 
        ? `${API_BASE_URL}/projects/${projectId}/team/${editingMember.id}`
        : `${API_BASE_URL}/projects/${projectId}/team`;
      
      const response = await fetch(url, {
        method: editingMember ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSuccess(editingMember ? 'Team member updated successfully' : 'Team member added successfully');
        setTimeout(() => setSuccess(''), 3000);
        setShowModal(false);
        resetForm();
        fetchTeamMembers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save team member');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.name} from the project team?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/team/${member.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setSuccess(`${member.name} removed from team`);
        setTimeout(() => setSuccess(''), 3000);
        fetchTeamMembers();
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      setError('Failed to remove team member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      role: 'Project Manager',
      name: '',
      firm_name: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      role: member.role,
      name: member.name,
      firm_name: member.firm_name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || ''
    });
    setShowModal(true);
  };

  const getRoleIcon = (role: string) => {
    const option = roleOptions.find(r => r.value === role);
    const Icon = option?.icon || Users;
    return <Icon size={16} />;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={20} className="text-amber-500" />
            Project Team
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage consultants, engineers, and key personnel for <span className="font-medium">{projectName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTeamMembers}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg border"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
          >
            <UserPlus size={16} />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Team Members List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200">
          <Users size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No team members added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add project manager, architects, engineers, and other consultants</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
          >
            <UserPlus size={16} />
            Add Your First Team Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {member.role}
                      </span>
                    </div>
                    {member.firm_name && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Building2 size={12} />
                        {member.firm_name}
                      </p>
                    )}
                    {member.email && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Mail size={12} />
                        {member.email}
                      </p>
                    )}
                    {member.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Phone size={12} />
                        {member.phone}
                      </p>
                    )}
                    {member.address && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {member.address}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 transition rounded"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition rounded"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., John Kamau"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Firm/Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.firm_name}
                    onChange={(e) => setFormData({ ...formData, firm_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., DesignHub Architects"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="name@firm.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="+254 712 345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Office Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={2}
                    placeholder="Physical address of the firm/consultant"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 p-5 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingMember ? 'Update' : 'Add'} Team Member
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