import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, FileText, Calendar, ChartLine, Clock, Users, 
  Download, ChevronLeft, Loader2, CheckCircle, AlertCircle, 
  TrendingUp, DollarSign, MapPin, CalendarDays, HardHat, 
  Phone, Mail, User, Briefcase, Image, FolderOpen
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useProject } from '@/contexts/ProjectContext';

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

interface Link {
  id: number;
  title: string;
  description: string;
  url: string;
  link_type: string;
  created_by_name: string;
  created_at: string;
}

interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  summary: string;
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
}

export function StakeholderProjectPortal() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { setCurrentProjectName } = useProject();
  const [project, setProject] = useState<Project | null>(null);
  const [documentLinks, setDocumentLinks] = useState<Link[]>([]);
  const [drawingLinks, setDrawingLinks] = useState<Link[]>([]);
  const [photoLinks, setPhotoLinks] = useState<Link[]>([]);
  const [reportLinks, setReportLinks] = useState<Link[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [siteDiaries, setSiteDiaries] = useState<SiteDiary[]>([]);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, [projectId]);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // Fetch project details
      const projectRes = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (projectRes.status === 403) {
        setError('You do not have access to this project');
        setLoading(false);
        return;
      }
      const projectData = await projectRes.json();
      if (projectRes.ok) {
        setProject(projectData);
        setCurrentProjectName(projectData.name);
      }

      // Fetch all links in parallel
      const [docs, drawings, photos, reports, meetingsRes, diariesRes, teamRes, financialRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/document`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/drawing`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/photo`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/report`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/meetings`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/site-diaries`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/team`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/financial-summary`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
      ]);

      setDocumentLinks(docs || []);
      setDrawingLinks(drawings || []);
      setPhotoLinks(photos || []);
      setReportLinks(reports || []);
      setMeetings(meetingsRes || []);
      setSiteDiaries(diariesRes || []);
      setTeamMembers(teamRes || []);
      setFinancial(financialRes || null);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2, count: null },
    { id: 'documents', label: 'Docs', icon: FileText, count: documentLinks.length },
    { id: 'drawings', label: 'Drawings', icon: FolderOpen, count: drawingLinks.length },
    { id: 'photos', label: 'Photos', icon: Image, count: photoLinks.length },
    { id: 'reports', label: 'Reports', icon: FileText, count: reportLinks.length },
    { id: 'meetings', label: 'Meetings', icon: Calendar, count: meetings.length },
    { id: 'team', label: 'Team', icon: Users, count: teamMembers.length },
    { id: 'financial', label: 'Financial', icon: DollarSign, count: null },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600">{error || 'Project not found'}</p>
        <button onClick={() => navigate('/stakeholder/dashboard')} className="mt-4 text-amber-500 hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button onClick={() => navigate('/stakeholder/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-500 transition">
        <ChevronLeft size={16} />
        Back to Dashboard
      </button>

      {/* Project Header - Compact */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">{project.name}</h1>
            <div className="flex gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={12} /> {project.location}</span>
              <span className="flex items-center gap-1"><CalendarDays size={12} /> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-500">{project.progress}%</div>
            <div className="w-32 mt-1 bg-gray-200 rounded-full h-1.5">
              <div className={`${getProgressColor(project.progress)} h-1.5 rounded-full`} style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Compact row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold">{documentLinks.length + drawingLinks.length + photoLinks.length + reportLinks.length}</p>
          <p className="text-xs text-gray-500">Documents</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold">{meetings.length}</p>
          <p className="text-xs text-gray-500">Meetings</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold">{teamMembers.length}</p>
          <p className="text-xs text-gray-500">Team</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold">{Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}</p>
          <p className="text-xs text-gray-500">Days Left</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-600">KES {(project.contractSum || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">Contract</p>
        </div>
      </div>

      {/* Tabs - Compact */}
      <div className="border-b flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition rounded-t-lg ${
              activeTab === tab.id
                ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Project Description</h3>
              <p className="text-sm text-gray-600">{project.description || 'No description provided.'}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <User size={16} className="text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Project Manager</p>
                  <p className="text-sm">{project.projectManager || 'Not assigned'}</p>
                  {project.projectManagerEmail && <p className="text-xs text-gray-500">{project.projectManagerEmail}</p>}
                  {project.projectManagerPhone && <p className="text-xs text-gray-500">{project.projectManagerPhone}</p>}
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <Building2 size={16} className="text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Client</p>
                  <p className="text-sm">{project.client}</p>
                </div>
              </div>
            </div>
            {financial && (
              <div className="border-t pt-3">
                <h3 className="text-sm font-semibold mb-2">Payment Summary</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Invoiced</p>
                    <p className="font-semibold">KES {financial.totalInvoiced.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Paid</p>
                    <p className="font-semibold text-green-600">KES {financial.totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Outstanding</p>
                    <p className={`font-semibold ${financial.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      KES {financial.outstanding.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-2">
            {documentLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No documents shared yet</div>
            ) : (
              documentLinks.map((doc) => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                    </div>
                  </div>
                  <Download size={14} className="text-gray-400" />
                </a>
              ))
            )}
          </div>
        )}

        {/* Drawings Tab */}
        {activeTab === 'drawings' && (
          <div className="space-y-2">
            {drawingLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No drawings shared yet</div>
            ) : (
              drawingLinks.map((doc) => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className="text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                    </div>
                  </div>
                  <Download size={14} className="text-gray-400" />
                </a>
              ))
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-3 gap-2">
            {photoLinks.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">No photos shared yet</div>
            ) : (
              photoLinks.map((photo) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="group bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center hover:bg-amber-50 transition">
                  <Image size={24} className="mx-auto text-gray-400 group-hover:text-amber-500 mb-1" />
                  <p className="text-xs font-medium truncate">{photo.title}</p>
                  <p className="text-[10px] text-gray-500">{new Date(photo.created_at).toLocaleDateString()}</p>
                </a>
              ))
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-2">
            {reportLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No reports shared yet</div>
            ) : (
              reportLinks.map((doc) => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                    </div>
                  </div>
                  <Download size={14} className="text-gray-400" />
                </a>
              ))
            )}
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="space-y-2">
            {meetings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No meetings scheduled yet</div>
            ) : (
              meetings.map((meeting) => (
                <div key={meeting.id} className="p-2 border-b last:border-0">
                  <p className="text-sm font-medium">{meeting.title}</p>
                  <p className="text-xs text-gray-500">{new Date(meeting.meeting_date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600 mt-1">{meeting.summary?.substring(0, 100)}...</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-2">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No team members added yet</div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-start gap-2 p-2 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{member.name}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">{member.role}</span>
                    </div>
                    {member.firm_name && <p className="text-xs text-gray-500">{member.firm_name}</p>}
                    {member.email && <p className="text-xs text-blue-500">{member.email}</p>}
                    {member.phone && <p className="text-xs text-gray-500">{member.phone}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && financial && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-gray-600">Contract Sum</span>
              <span className="font-medium">KES {financial.contractSum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-gray-600">Total Invoiced</span>
              <span className="text-blue-600">KES {financial.totalInvoiced.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-gray-600">Total Paid</span>
              <span className="text-green-600">KES {financial.totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="font-semibold">Outstanding</span>
              <span className={`font-bold ${financial.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                KES {financial.outstanding.toLocaleString()}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Payment Progress</span>
                <span>{((financial.totalPaid / financial.contractSum) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(financial.totalPaid / financial.contractSum) * 100}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}