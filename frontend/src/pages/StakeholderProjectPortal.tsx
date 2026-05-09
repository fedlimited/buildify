import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, FileText, Calendar, ChartLine, Clock, Users, 
  MessageSquare, Download, Eye, ChevronLeft, Loader2,
  CheckCircle, AlertCircle, TrendingUp, DollarSign,
  MapPin, CalendarDays, HardHat, ClipboardList, Camera,
  Phone, Mail, User, Briefcase, AlertTriangle, CheckSquare,
  Image, Plus, X, Trash2, Edit2, Save, Clock as ClockIcon,
  Flag, UserPlus, ListChecks, FileWarning
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
  category: string;
  created_by_name: string;
  created_at: string;
}

interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  location?: string;
  meeting_type?: string;
  status?: string;
  summary?: string;
  action_items?: ActionItem[];
  attendees?: Stakeholder[];
}

interface ActionItem {
  id: number;
  description: string;
  assigned_to: number;
  assigned_to_name: string;
  assigned_by: number;
  assigned_by_name: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_notes?: string;
  created_at: string;
}

interface Stakeholder {
  id: number;
  name: string;
  email: string;
  role: string;
  stakeholder_type: string;
}

interface AgendaItem {
  id?: number;
  title: string;
  description: string;
  proposed_by?: string;
}

interface MatterArising {
  id?: number;
  from_meeting: string;
  issue: string;
  resolution_status: 'pending' | 'resolved' | 'in_progress';
  notes: string;
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
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'drawings' | 'photos' | 'reports' | 'meetings' | 'progress' | 'financial' | 'team'>('meetings');
  
  // Meeting Form States
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    meeting_date: '',
    location: '',
    meeting_type: 'regular'
  });

  // Meeting Details States
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [meetingAttendees, setMeetingAttendees] = useState<number[]>([]);
  
  // Agenda States
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState({ title: '', description: '' });
  
  // Matters Arising States
  const [mattersArising, setMattersArising] = useState<MatterArising[]>([]);
  const [newMatter, setNewMatter] = useState({ from_meeting: '', issue: '', notes: '' });
  
  // Action Items States
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionItem, setNewActionItem] = useState({
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium' as const
  });
  const [addingActionItem, setAddingActionItem] = useState(false);
  
  // Minutes Content States
  const [minutesContent, setMinutesContent] = useState({
    discussions: '',
    decisions: '',
    next_steps: ''
  });
  const [savingMinutes, setSavingMinutes] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
    fetchDocumentLinks();
    fetchDrawingLinks();
    fetchPhotoLinks();
    fetchReportLinks();
    fetchMeetings();
    fetchSiteDiaries();
    fetchFinancialSummary();
    fetchTeamMembers();
    fetchStakeholders();
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
        setCurrentProjectName(data.name);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    }
  };

  const fetchDocumentLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/document`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDocumentLinks(data);
      }
    } catch (error) {
      console.error('Error fetching document links:', error);
    }
  };

  const fetchDrawingLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/drawing`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDrawingLinks(data);
      }
    } catch (error) {
      console.error('Error fetching drawing links:', error);
    }
  };

  const fetchPhotoLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/photo`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPhotoLinks(data);
      }
    } catch (error) {
      console.error('Error fetching photo links:', error);
    }
  };

  const fetchReportLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setReportLinks(data);
      }
    } catch (error) {
      console.error('Error fetching report links:', error);
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

  const fetchStakeholders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/stakeholders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStakeholders(data);
      }
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
    }
  };

  const fetchMeetingDetails = async (minutesId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${minutesId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedMeeting(data.minutes);
        setMeetingAttendees(data.attendees?.map((a: any) => a.stakeholder_id) || []);
        setAgendaItems(data.agenda || []);
        setActionItems(data.actionItems || []);
        setMinutesContent({
          discussions: data.topics?.find((t: any) => t.topic_type === 'discussion')?.content || '',
          decisions: data.topics?.find((t: any) => t.topic_type === 'decision')?.content || '',
          next_steps: data.topics?.find((t: any) => t.topic_type === 'next_steps')?.content || ''
        });
        setShowMeetingDetails(true);
      }
    } catch (error) {
      console.error('Error fetching meeting details:', error);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingMeeting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/minutes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: parseInt(projectId!),
          meeting_date: newMeeting.meeting_date,
          title: newMeeting.title,
          location: newMeeting.location,
          meeting_type: newMeeting.meeting_type,
          attendees: meetingAttendees.map(id => ({ id, status: 'present' }))
        })
      });
      
      if (response.ok) {
        await fetchMeetings();
        setShowMeetingForm(false);
        setNewMeeting({
          title: '',
          meeting_date: '',
          location: '',
          meeting_type: 'regular'
        });
        setMeetingAttendees([]);
      } else {
        const error = await response.json();
        console.error('Create meeting error:', error);
        alert('Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Error creating meeting');
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleAddAgendaItem = async () => {
    if (!selectedMeeting || !newAgendaItem.title) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${selectedMeeting.id}/agenda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAgendaItem)
      });
      
      if (response.ok) {
        await fetchMeetingDetails(selectedMeeting.id);
        setNewAgendaItem({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Error adding agenda item:', error);
    }
  };

  const handleAddActionItem = async () => {
    if (!selectedMeeting || !newActionItem.description || !newActionItem.assigned_to) {
      alert('Please fill in all required fields');
      return;
    }
    
    setAddingActionItem(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${selectedMeeting.id}/action-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          minutes_id: selectedMeeting.id,
          description: newActionItem.description,
          assigned_to: parseInt(newActionItem.assigned_to),
          due_date: newActionItem.due_date,
          priority: newActionItem.priority
        })
      });
      
      if (response.ok) {
        await fetchMeetingDetails(selectedMeeting.id);
        setNewActionItem({ description: '', assigned_to: '', due_date: '', priority: 'medium' });
        alert('Action item added successfully!');
      }
    } catch (error) {
      console.error('Error adding action item:', error);
      alert('Error adding action item');
    } finally {
      setAddingActionItem(false);
    }
  };

  const handleUpdateTaskStatus = async (actionItemId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/tasks/${actionItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok && selectedMeeting) {
        await fetchMeetingDetails(selectedMeeting.id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleSaveMinutesContent = async () => {
    if (!selectedMeeting) return;
    setSavingMinutes(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${selectedMeeting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topics: [
            { title: 'Discussions', content: minutesContent.discussions, topic_type: 'discussion' },
            { title: 'Decisions', content: minutesContent.decisions, topic_type: 'decision' },
            { title: 'Next Steps', content: minutesContent.next_steps, topic_type: 'next_steps' }
          ],
          status: 'published'
        })
      });
      
      if (response.ok) {
        alert('Meeting minutes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving minutes:', error);
      alert('Error saving minutes');
    } finally {
      setSavingMinutes(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
              <p className="text-lg font-bold">{documentLinks.length}</p>
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
        <div className="flex flex-wrap gap-4">
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
            Documents ({documentLinks.length})
          </button>
          <button
            onClick={() => setActiveTab('drawings')}
            className={`pb-3 px-1 text-sm font-medium transition ${
              activeTab === 'drawings'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Drawings ({drawingLinks.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-1 text-sm font-medium transition ${
              activeTab === 'photos'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Photos ({photoLinks.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-1 text-sm font-medium transition ${
              activeTab === 'reports'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reports ({reportLinks.length})
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
          {documentLinks.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No documents shared yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documentLinks.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                      <p className="text-xs text-gray-500">Added by {doc.created_by_name} on {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a 
                    href={doc.url} 
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

      {/* Tab Content - Drawings */}
      {activeTab === 'drawings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {drawingLinks.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No drawings shared yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drawingLinks.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-amber-500" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                      <p className="text-xs text-gray-500">Added by {doc.created_by_name} on {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a 
                    href={doc.url} 
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

      {/* Tab Content - Photos */}
      {activeTab === 'photos' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {photoLinks.length === 0 ? (
            <div className="text-center py-8">
              <Image size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No photos shared yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photoLinks.map((photo) => (
                <a 
                  key={photo.id}
                  href={photo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-video flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                    <Image size={32} className="text-gray-400 group-hover:text-amber-500 transition" />
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{photo.title}</p>
                    <p className="text-xs text-gray-500">{new Date(photo.created_at).toLocaleDateString()}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {reportLinks.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No reports shared yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportLinks.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-purple-500" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                      <p className="text-xs text-gray-500">Added by {doc.created_by_name} on {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a 
                    href={doc.url} 
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

      {/* Tab Content - Meetings with Full Minutes System */}
      {activeTab === 'meetings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Meeting Minutes</h3>
            <button
              onClick={() => setShowMeetingForm(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm flex items-center gap-1"
            >
              <Plus size={14} />
              New Meeting
            </button>
          </div>

          {meetings.length === 0 && !showMeetingForm ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No meetings scheduled yet</p>
              <button
                onClick={() => setShowMeetingForm(true)}
                className="mt-3 text-amber-500 hover:underline text-sm"
              >
                Create your first meeting
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  onClick={() => fetchMeetingDetails(meeting.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{meeting.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                        {meeting.location && ` • ${meeting.location}`}
                      </p>
                      {meeting.meeting_type && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          {meeting.meeting_type}
                        </span>
                      )}
                    </div>
                    {meeting.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        meeting.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {meeting.status}
                      </span>
                    )}
                  </div>
                  {meeting.summary && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{meeting.summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New Meeting Form Modal */}
          {showMeetingForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Create New Meeting</h3>
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Meeting Title *</label>
                    <input
                      type="text"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meeting Date *</label>
                    <input
                      type="date"
                      value={newMeeting.meeting_date}
                      onChange={(e) => setNewMeeting({...newMeeting, meeting_date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      placeholder="e.g., Site Office, Conference Room"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meeting Type</label>
                    <select
                      value={newMeeting.meeting_type}
                      onChange={(e) => setNewMeeting({...newMeeting, meeting_type: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    >
                      <option value="regular">Regular</option>
                      <option value="progress">Progress Review</option>
                      <option value="technical">Technical</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Attendees</label>
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                      {stakeholders.map((stakeholder) => (
                        <label key={stakeholder.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={meetingAttendees.includes(stakeholder.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMeetingAttendees([...meetingAttendees, stakeholder.id]);
                              } else {
                                setMeetingAttendees(meetingAttendees.filter(id => id !== stakeholder.id));
                              }
                            }}
                            className="rounded"
                          />
                          {stakeholder.name} ({stakeholder.role})
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMeetingForm(false);
                        setNewMeeting({
                          title: '',
                          meeting_date: '',
                          location: '',
                          meeting_type: 'regular'
                        });
                        setMeetingAttendees([]);
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingMeeting}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                    >
                      {creatingMeeting ? 'Creating...' : 'Create Meeting'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Meeting Details Modal - Full Minutes System */}
          {showMeetingDetails && selectedMeeting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl p-6 m-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                  <div>
                    <h3 className="text-xl font-bold">{selectedMeeting.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(selectedMeeting.meeting_date).toLocaleDateString()} 
                      {selectedMeeting.location && ` • ${selectedMeeting.location}`}
                      {selectedMeeting.meeting_type && ` • ${selectedMeeting.meeting_type}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMeetingDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Matters Present - Pulled from Stakeholders Register */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Users size={18} className="text-blue-500" />
                    Matters Present (Stakeholders in Attendance)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stakeholders.filter(s => meetingAttendees.includes(s.id)).map(stakeholder => (
                      <span key={stakeholder.id} className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-sm">
                        {stakeholder.name} ({stakeholder.role})
                      </span>
                    ))}
                    {meetingAttendees.length === 0 && (
                      <p className="text-sm text-gray-500">No attendees recorded yet</p>
                    )}
                  </div>
                </div>

                {/* Agenda Section */}
                <div className="mb-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <ClipboardList size={18} className="text-amber-500" />
                    Agenda
                  </h4>
                  <div className="space-y-2">
                    {agendaItems.map((item, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="font-medium">{item.title}</p>
                        {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="New agenda item"
                      value={newAgendaItem.title}
                      onChange={(e) => setNewAgendaItem({...newAgendaItem, title: e.target.value})}
                      className="flex-1 px-3 py-1 border rounded-lg text-sm dark:bg-gray-700"
                    />
                    <button
                      onClick={handleAddAgendaItem}
                      className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Minutes Content - Discussions, Decisions, Next Steps */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Discussions</label>
                    <textarea
                      value={minutesContent.discussions}
                      onChange={(e) => setMinutesContent({...minutesContent, discussions: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 h-32"
                      placeholder="Record discussion points..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Decisions Made</label>
                    <textarea
                      value={minutesContent.decisions}
                      onChange={(e) => setMinutesContent({...minutesContent, decisions: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 h-32"
                      placeholder="Record decisions made..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Next Steps</label>
                    <textarea
                      value={minutesContent.next_steps}
                      onChange={(e) => setMinutesContent({...minutesContent, next_steps: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 h-32"
                      placeholder="Action items to be taken..."
                    />
                  </div>
                </div>

                {/* Action Items / Tasks Section */}
                <div className="mb-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Flag size={18} className="text-red-500" />
                    Action Items & Tasks
                  </h4>
                  
                  {/* Existing Action Items */}
                  <div className="space-y-3 mb-4">
                    {actionItems.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{item.description}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              <span className="flex items-center gap-1">
                                <User size={12} /> Assigned to: {item.assigned_to_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> Due: {new Date(item.due_date).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateTaskStatus(item.id, e.target.value)}
                            className="text-xs px-2 py-1 border rounded-lg"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {actionItems.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">No action items assigned yet</p>
                    )}
                  </div>

                  {/* Add New Action Item */}
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium mb-2">Assign New Task</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Task description"
                        value={newActionItem.description}
                        onChange={(e) => setNewActionItem({...newActionItem, description: e.target.value})}
                        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700"
                      />
                      <select
                        value={newActionItem.assigned_to}
                        onChange={(e) => setNewActionItem({...newActionItem, assigned_to: e.target.value})}
                        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700"
                      >
                        <option value="">Assign to...</option>
                        {stakeholders.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={newActionItem.due_date}
                        onChange={(e) => setNewActionItem({...newActionItem, due_date: e.target.value})}
                        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700"
                      />
                      <select
                        value={newActionItem.priority}
                        onChange={(e) => setNewActionItem({...newActionItem, priority: e.target.value as any})}
                        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddActionItem}
                      disabled={addingActionItem}
                      className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      {addingActionItem ? 'Adding...' : '+ Add Action Item'}
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowMeetingDetails(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveMinutesContent}
                    disabled={savingMinutes}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {savingMinutes ? 'Saving...' : 'Save Minutes'}
                  </button>
                </div>
              </div>
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