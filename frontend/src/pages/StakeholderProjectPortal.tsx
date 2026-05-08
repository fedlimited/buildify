import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, FileText, Calendar, ChartLine, Clock, Users, 
  MessageSquare, Download, Eye, ChevronLeft, Loader2,
  CheckCircle, AlertCircle, TrendingUp, DollarSign,
  MapPin, CalendarDays, HardHat, ClipboardList, Camera,
  Phone, Mail, User, Briefcase, AlertTriangle, CheckSquare
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface Project {
  id: number;
  name: string;
  client: string;
  location: string;
  description: string;
  progress: number;
  status: string;
  startDate: string;
  endDate: string;
  contractSum: number;
  projectManager: string;
  projectManagerEmail: string;
  projectManagerPhone: string;
}

interface Document {
  id: number;
  title: string;
  description: string;
  file_url: string;
  category: string;
  created_at: string;
}

interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  summary: string;
  action_items: any[];
}

interface SiteDiary {
  id: number;
  date: string;
  summary: string;
  weather: string;
  workers_count: number;
}

interface FinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  contractSum: number;
}

interface TeamMember {
  id: number;
  role: string;
  name: string;
  firm_name: string;
  email: string;
  phone: string;
  address: string;
}

export function StakeholderProjectPortal() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [siteDiaries, setSiteDiaries] = useState<SiteDiary[]>([]);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'meetings' | 'progress' | 'financial' | 'team'>('overview');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchProjectDetails();
    fetchDocuments();
    fetchMeetings();
    fetchSiteDiaries();
    fetchFinancialSummary();
    fetchTeamMembers();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 403) {
        setError('You do not have access to this project');
        return;
      }
      
      const data = await response.json();
      if (response.ok) {
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/meetings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMeetings(data);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const fetchSiteDiaries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/site-diaries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSiteDiaries(data);
      }
    } catch (error) {
      console.error('Error fetching site diaries:', error);
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/financial-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setFinancial(data);
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      Active: 'bg-green-100 text-green-700',
      Completed: 'bg-blue-100 text-blue-700',
      'On Hold': 'bg-yellow-100 text-yellow-700',
      Cancelled: 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={48} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/stakeholder/dashboard')}
          className="mt-4 text-amber-500 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500">Project not found</p>
        <button 
          onClick={() => navigate('/stakeholder/dashboard')}
          className="mt-4 text-amber-500 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/stakeholder/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-amber-500 transition"
      >
        <ChevronLeft size={20} />
        Back to Dashboard
      </button>

      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} />
                {project.location}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <CalendarDays size={12} />
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Progress</div>
            <div className="text-3xl font-bold text-amber-500">{project.progress}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`${getProgressColor(project.progress)} h-3 rounded-full transition-all`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CalendarDays size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Days Remaining</p>
              <p className="text-lg font-bold">
                {Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Documents</p>
              <p className="text-lg font-bold">{documents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Users size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Meetings</p>
              <p className="text-lg font-bold">{meetings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Contract Sum</p>
              <p className="text-lg font-bold">KES {(project.contractSum || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 text-sm font-medium transition ${
              activeTab === 'overview'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-1 text-sm font-medium transition ${
              activeTab === 'documents'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`pb-3 px-1 text-sm font-medium transition ${
              activeTab === 'meetings'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-3 px-1 text-sm font-medium transition ${
              activeTab === 'progress'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Site Progress
          </button>
          {financial && (
            <button
              onClick={() => setActiveTab('financial')}
              className={`pb-3 px-1 text-sm font-medium transition ${
                activeTab === 'financial'
                  ? 'text-amber-500 border-b-2 border-amber-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Financial
            </button>
          )}
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 px-1 text-sm font-medium transition ${
              activeTab === 'team'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Team ({teamMembers.length})
          </button>
        </div>
      </div>

      {/* Tab Content - Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Project Description</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {project.description || 'No description provided.'}
          </p>

          <h3 className="text-lg font-semibold mb-4">Project Team</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <User size={20} className="text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Project Manager</p>
                <p className="text-sm">{project.projectManager || 'Not assigned'}</p>
                {project.projectManagerEmail && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Mail size={12} /> {project.projectManagerEmail}
                  </p>
                )}
                {project.projectManagerPhone && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={12} /> {project.projectManagerPhone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Building2 size={20} className="text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Client</p>
                <p className="text-sm">{project.client}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No documents shared yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-blue-500 hover:text-blue-600"
                  >
                    <Download size={18} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Meetings */}
      {activeTab === 'meetings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {meetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No meetings scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{meeting.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{meeting.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Site Progress */}
      {activeTab === 'progress' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {siteDiaries.length === 0 ? (
            <div className="text-center py-8">
              <HardHat size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No site diary entries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {siteDiaries.map((diary) => (
                <div key={diary.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{new Date(diary.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span>Weather: {diary.weather || 'N/A'}</span>
                        <span>•</span>
                        <span>Workers: {diary.workers_count || 0}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{diary.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Financial */}
      {activeTab === 'financial' && financial && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-600">Contract Sum</span>
                  <span className="font-medium">KES {financial.contractSum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-600">Total Invoiced</span>
                  <span className="text-blue-600">KES {financial.totalInvoiced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="text-green-600">KES {financial.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold">Outstanding Balance</span>
                  <span className={`font-bold ${financial.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    KES {financial.outstanding.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Payment Progress</h3>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Paid: {((financial.totalPaid / financial.contractSum) * 100).toFixed(1)}%</span>
                  <span>Remaining: {((financial.outstanding / financial.contractSum) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(financial.totalPaid / financial.contractSum) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Team */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Project Team</h3>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No team members added yet</p>
              <p className="text-sm text-gray-400">Team information will appear here once added by the contractor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {member.role}
                        </span>
                      </div>
                      {member.firm_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                          <Building2 size={14} />
                          {member.firm_name}
                        </p>
                      )}
                      {member.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                          <Mail size={14} />
                          <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                            {member.email}
                          </a>
                        </p>
                      )}
                      {member.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                          <Phone size={14} />
                          <a href={`tel:${member.phone}`} className="hover:underline">
                            {member.phone}
                          </a>
                        </p>
                      )}
                      {member.address && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                          <MapPin size={14} />
                          {member.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}