
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, FileText, Calendar, ChartLine, Clock, Users, 
  MessageSquare, Download, Eye, ChevronLeft, Loader2,
  CheckCircle, AlertCircle, TrendingUp, DollarSign,
  MapPin, CalendarDays, HardHat, ClipboardList, Camera,
  Phone, Mail, User, Briefcase, AlertTriangle, CheckSquare,
  Image, Plus, X, Trash2, Edit2, Save, Clock as ClockIcon,
  Flag, UserPlus, ListChecks, FileWarning, Pencil, Trash,
  Send, Check, ThumbsUp, ThumbsDown, History, GitBranch,
  GripVertical
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useProject } from '@/contexts/ProjectContext';

// ============ INTERFACES ============
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
  approval_status?: string;
  version?: number;
  pending_tasks?: number;
  overdue_tasks?: number;
}

interface AgendaItem {
  id?: number;
  item_order: number;
  title: string;
  description: string;
  decision?: string;
  discussion_summary?: string;
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
}

interface Topic {
  id?: number;
  topic_type: string;
  title: string;
  content: string;
}

interface Stakeholder {
  id: number;
  name: string;
  email: string;
  role: string;
  stakeholder_type: string;
  can_approve: boolean;
}

interface MatterArising {
  id: number;
  action_item_id: number;
  description: string;
  due_date: string;
  priority: string;
  action_status: string;
  assigned_to_name: string;
  previous_meeting_title: string;
  previous_meeting_date: string;
  status: string;
  notes?: string;
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

interface Version {
  id: number;
  version_number: number;
  changed_by_name: string;
  changed_at: string;
  change_reason: string;
}

interface AgendaRegisterItem {
  id: number;
  title: string;
  description: string;
}

// ============ MAIN COMPONENT ============
export function StakeholderProjectPortal() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { setCurrentProjectName } = useProject();
  
  // Core data states
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
  
  // Overdue counter
  const [overdueCount, setOverdueCount] = useState(0);
  
  // Meeting Form States
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    meeting_date: '',
    location: '',
    meeting_type: 'regular',
    chairperson: '',
    secretary: ''
  });

  // Minutes Editor States
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMinutesEditor, setShowMinutesEditor] = useState(false);
  const [editingMode, setEditingMode] = useState<'view' | 'edit' | 'approve'>('view');
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [mattersArising, setMattersArising] = useState<MatterArising[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [meetingAttendees, setMeetingAttendees] = useState<Stakeholder[]>([]);
  const [allStakeholders, setAllStakeholders] = useState<Stakeholder[]>([]);
  
  // Agenda Register States
  const [agendaRegister, setAgendaRegister] = useState<AgendaRegisterItem[]>([]);
  const [showAgendaRegister, setShowAgendaRegister] = useState(false);
  const [newRegisterItem, setNewRegisterItem] = useState({ title: '', description: '' });
  
  // New agenda item form
  const [newAgendaItem, setNewAgendaItem] = useState({ title: '', description: '' });
  
  // New action item form
  const [newActionItem, setNewActionItem] = useState({
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium' as const
  });
  const [addingActionItem, setAddingActionItem] = useState(false);
  
  // Minutes content
  const [minutesContent, setMinutesContent] = useState({
    discussions: '',
    decisions: '',
    next_steps: ''
  });
  const [savingMinutes, setSavingMinutes] = useState(false);
  const [deletingMeeting, setDeletingMeeting] = useState(false);
  const [publishingMinutes, setPublishingMinutes] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showMissingFeaturesAlert, setShowMissingFeaturesAlert] = useState(false);

  // ============ DATA FETCHING ============
  useEffect(() => {
    fetchAllData();
    fetchOverdueCount();
    fetchAgendaRegister();
  }, [projectId]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProjectDetails(),
      fetchDocumentLinks(),
      fetchDrawingLinks(),
      fetchPhotoLinks(),
      fetchReportLinks(),
      fetchMeetings(),
      fetchSiteDiaries(),
      fetchFinancialSummary(),
      fetchTeamMembers(),
      fetchStakeholders()
    ]);
    setLoading(false);
  };

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProject(data);
        setCurrentProjectName(data.name);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchDocumentLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/links/document`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setDocumentLinks(data);
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
      if (response.ok) setDrawingLinks(data);
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
      if (response.ok) setPhotoLinks(data);
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
      if (response.ok) setReportLinks(data);
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
      if (response.ok) setMeetings(data);
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
      if (response.ok) setSiteDiaries(data);
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
      if (response.ok) setFinancial(data);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects/${projectId}/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setTeamMembers(data);
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
      if (response.ok) setStakeholders(data);
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
    }
  };

  const fetchAgendaRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/agenda-register`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setAgendaRegister(data);
    } catch (error) {
      console.error('Error fetching agenda register:', error);
    }
  };

  const fetchOverdueCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/tasks/overdue-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setOverdueCount(data.overdue_count);
    } catch (error) {
      console.error('Error fetching overdue count:', error);
    }
  };

  const fetchMeetingMinutes = async (minutesId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${minutesId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedMeeting(data.minutes);
        setMeetingAttendees(data.attendees || []);
        setAllStakeholders(data.allStakeholders || []);
        setAgendaItems(data.agenda || []);
        setTopics(data.topics || []);
        setActionItems(data.actionItems || []);
        setMattersArising(data.mattersArising || []);
        setVersions(data.versions || []);
        
        setMinutesContent({
          discussions: data.topics?.find((t: Topic) => t.topic_type === 'discussion')?.content || '',
          decisions: data.topics?.find((t: Topic) => t.topic_type === 'decision')?.content || '',
          next_steps: data.topics?.find((t: Topic) => t.topic_type === 'next_steps')?.content || ''
        });
        
        setShowMinutesEditor(true);
        setEditingMode(
          data.minutes.approval_status === 'pending_approval' ? 'approve' : 
          data.minutes.status === 'draft' ? 'edit' : 'view'
        );
      }
    } catch (error) {
      console.error('Error fetching meeting minutes:', error);
      alert('Failed to load meeting minutes');
    }
  };

  // ============ MEETING CRUD ============
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
          chairperson: newMeeting.chairperson,
          secretary: newMeeting.secretary
        })
      });
      
      if (response.ok) {
        await fetchMeetings();
        setShowMeetingForm(false);
        setNewMeeting({ title: '', meeting_date: '', location: '', meeting_type: 'regular', chairperson: '', secretary: '' });
        alert('Meeting created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Error creating meeting');
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleSaveMinutes = async () => {
    if (!selectedMeeting) return;
    setSavingMinutes(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const agendaData = agendaItems.map((item, idx) => ({
        item_order: idx + 1,
        title: item.title,
        description: item.description || '',
        decision: item.decision || '',
        discussion_summary: item.discussion_summary || ''
      }));
      
      const topicsData = [
        { topic_type: 'discussion', title: 'Discussions', content: minutesContent.discussions },
        { topic_type: 'decision', title: 'Decisions', content: minutesContent.decisions },
        { topic_type: 'next_steps', title: 'Next Steps', content: minutesContent.next_steps }
      ];
      
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${selectedMeeting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agenda_items: agendaData,
          topics: topicsData,
          status: 'draft',
          attendees: meetingAttendees.map(a => ({ id: a.id, status: 'present' }))
        })
      });
      
      if (response.ok) {
        alert('Meeting minutes saved successfully!');
        await fetchMeetingMinutes(selectedMeeting.id);
        await fetchMeetings();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save minutes');
      }
    } catch (error) {
      console.error('Error saving minutes:', error);
      alert('Error saving minutes');
    } finally {
      setSavingMinutes(false);
    }
  };

  const handlePublishMinutes = async () => {
    if (!selectedMeeting) return;
    setPublishingMinutes(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${selectedMeeting.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Minutes published for approval! Stakeholders have been notified.');
        await fetchMeetingMinutes(selectedMeeting.id);
        await fetchMeetings();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to publish minutes');
      }
    } catch (error) {
      console.error('Error publishing minutes:', error);
      alert('Error publishing minutes');
    } finally {
      setPublishingMinutes(false);
    }
  };

  const handleApproveMinutes = async () => {
    if (!selectedMeeting) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${selectedMeeting.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Minutes approved successfully!');
        setShowMinutesEditor(false);
        await fetchMeetings();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to approve minutes');
      }
    } catch (error) {
      console.error('Error approving minutes:', error);
      alert('Error approving minutes');
    }
  };

  const handleRejectMinutes = async () => {
    if (!selectedMeeting) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${selectedMeeting.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback: rejectionFeedback })
      });
      
      if (response.ok) {
        alert('Minutes rejected. Feedback sent to creator.');
        setShowRejectionModal(false);
        setRejectionFeedback('');
        setShowMinutesEditor(false);
        await fetchMeetings();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject minutes');
      }
    } catch (error) {
      console.error('Error rejecting minutes:', error);
      alert('Error rejecting minutes');
    }
  };

  const handleDeleteMeeting = async () => {
    if (!selectedMeeting) return;
    
    if (!confirm(`Are you sure you want to delete "${selectedMeeting.title}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingMeeting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/minutes/${selectedMeeting.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Meeting deleted successfully!');
        setShowMinutesEditor(false);
        setSelectedMeeting(null);
        await fetchMeetings();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete meeting');
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Error deleting meeting');
    } finally {
      setDeletingMeeting(false);
    }
  };

  // ============ AGENDA ITEMS ============
  const handleAddAgendaItem = () => {
    if (!newAgendaItem.title) return;
    
    setAgendaItems([
      ...agendaItems,
      {
        item_order: agendaItems.length + 1,
        title: newAgendaItem.title,
        description: newAgendaItem.description,
        decision: '',
        discussion_summary: ''
      }
    ]);
    setNewAgendaItem({ title: '', description: '' });
  };

  const handleAddFromRegister = (item: AgendaRegisterItem) => {
    setAgendaItems([
      ...agendaItems,
      {
        item_order: agendaItems.length + 1,
        title: item.title,
        description: item.description,
        decision: '',
        discussion_summary: ''
      }
    ]);
  };

  const handleAddToRegister = async () => {
    if (!newRegisterItem.title) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/agenda-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRegisterItem)
      });
      if (response.ok) {
        await fetchAgendaRegister();
        setNewRegisterItem({ title: '', description: '' });
        alert('Agenda item added to register!');
      }
    } catch (error) {
      console.error('Error adding to agenda register:', error);
    }
  };

  const handleRemoveAgendaItem = (index: number) => {
    const newAgenda = [...agendaItems];
    newAgenda.splice(index, 1);
    newAgenda.forEach((item, idx) => { item.item_order = idx + 1; });
    setAgendaItems(newAgenda);
  };

  const handleUpdateAgendaItem = (index: number, field: keyof AgendaItem, value: string) => {
    const newAgenda = [...agendaItems];
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    setAgendaItems(newAgenda);
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;
    if (draggedItem === index) return;
    
    const newAgenda = [...agendaItems];
    const dragged = newAgenda[draggedItem];
    newAgenda.splice(draggedItem, 1);
    newAgenda.splice(index, 0, dragged);
    newAgenda.forEach((item, idx) => { item.item_order = idx + 1; });
    setAgendaItems(newAgenda);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // ============ ACTION ITEMS ============
  const handleAddActionItem = async () => {
    if (!selectedMeeting) return;
    if (!newActionItem.description || !newActionItem.assigned_to || !newActionItem.due_date) {
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
        await fetchMeetingMinutes(selectedMeeting.id);
        setNewActionItem({ description: '', assigned_to: '', due_date: '', priority: 'medium' });
        alert('Action item added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add action item');
      }
    } catch (error) {
      console.error('Error adding action item:', error);
      alert('Error adding action item');
    } finally {
      setAddingActionItem(false);
    }
  };

  const handleUpdateActionItemStatus = async (actionItemId: number, newStatus: string) => {
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
        await fetchMeetingMinutes(selectedMeeting.id);
        await fetchOverdueCount();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // ============ AUTO-EMAIL ABSENTEES ============
  const handleEmailAbsentees = async () => {
    const absentees = allStakeholders.filter(s => !meetingAttendees.some(a => a.id === s.id));
    if (absentees.length === 0) {
      alert('No absentees to email.');
      return;
    }
    
    setShowMissingFeaturesAlert(true);
    // This would call an API endpoint to send emails to absentees
    alert(`Would send apology request emails to ${absentees.length} absentees. This feature is coming soon!`);
  };

  // ============ CALENDAR SYNC ============
  const handleCalendarSync = () => {
    setShowMissingFeaturesAlert(true);
    alert('Calendar sync (.ics export) coming soon!');
  };

  // ============ UTILITY FUNCTIONS ============
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'On Hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={() => navigate('/stakeholder/dashboard')} className="mt-4 text-amber-500 hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Project not found</p>
        <button onClick={() => navigate('/stakeholder/dashboard')} className="mt-4 text-amber-500 hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate('/stakeholder/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400 transition">
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
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={12} /> {project.location}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <CalendarDays size={12} />
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
            <div className="text-3xl font-bold text-amber-500">{project.progress}%</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className={`${getProgressColor(project.progress)} h-3 rounded-full transition-all`} style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><CalendarDays size={20} className="text-blue-500 dark:text-blue-400" /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Days Remaining</p><p className="text-lg font-bold text-gray-900 dark:text-white">{Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><FileText size={20} className="text-green-500 dark:text-green-400" /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Documents</p><p className="text-lg font-bold text-gray-900 dark:text-white">{documentLinks.length}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><Users size={20} className="text-amber-500 dark:text-amber-400" /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Meetings</p><p className="text-lg font-bold text-gray-900 dark:text-white">{meetings.length}</p></div>
          </div>
          {overdueCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {overdueCount}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><DollarSign size={20} className="text-purple-500 dark:text-purple-400" /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Contract Sum</p><p className="text-lg font-bold text-gray-900 dark:text-white">KES {(project.contractSum || 0).toLocaleString()}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><Flag size={20} className="text-red-500 dark:text-red-400" /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Overdue Tasks</p><p className="text-lg font-bold text-red-600 dark:text-red-400">{overdueCount}</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <button onClick={() => setActiveTab('overview')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'overview' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Overview</button>
          <button onClick={() => setActiveTab('documents')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'documents' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Documents ({documentLinks.length})</button>
          <button onClick={() => setActiveTab('drawings')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'drawings' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Drawings ({drawingLinks.length})</button>
          <button onClick={() => setActiveTab('photos')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'photos' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Photos ({photoLinks.length})</button>
          <button onClick={() => setActiveTab('reports')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'reports' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Reports ({reportLinks.length})</button>
          <button onClick={() => setActiveTab('meetings')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'meetings' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Meetings ({meetings.length})</button>
          <button onClick={() => setActiveTab('progress')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'progress' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Site Progress</button>
          {financial && <button onClick={() => setActiveTab('financial')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'financial' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Financial</button>}
          <button onClick={() => setActiveTab('team')} className={`pb-3 px-1 text-sm font-medium transition ${activeTab === 'team' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Team ({teamMembers.length})</button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Description</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{project.description || 'No description provided.'}</p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Team</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <User size={20} className="text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Project Manager</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{project.projectManager || 'Not assigned'}</p>
                {project.projectManagerEmail && <p className="text-xs text-gray-500 dark:text-gray-400">{project.projectManagerEmail}</p>}
                {project.projectManagerPhone && <p className="text-xs text-gray-500 dark:text-gray-400">{project.projectManagerPhone}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Building2 size={20} className="text-amber-500 mt-0.5" />
              <div><p className="font-medium text-gray-900 dark:text-white">Client</p><p className="text-sm text-gray-600 dark:text-gray-300">{project.client}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {documentLinks.length === 0 ? (
            <div className="text-center py-8"><FileText size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-500 dark:text-gray-400">No documents shared yet</p></div>
          ) : (
            <div className="space-y-3">
              {documentLinks.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-500" />
                    <div><p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>{doc.description && <p className="text-xs text-gray-500 dark:text-gray-400">{doc.description}</p>}<p className="text-xs text-gray-500 dark:text-gray-400">Added by {doc.created_by_name}</p></div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:text-blue-600"><Download size={18} /></a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drawings Tab */}
      {activeTab === 'drawings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {drawingLinks.length === 0 ? (
            <div className="text-center py-8"><FileText size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-500 dark:text-gray-400">No drawings shared yet</p></div>
          ) : (
            <div className="space-y-3">
              {drawingLinks.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-amber-500" />
                    <div><p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>{doc.description && <p className="text-xs text-gray-500 dark:text-gray-400">{doc.description}</p>}<p className="text-xs text-gray-500 dark:text-gray-400">Added by {doc.created_by_name}</p></div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:text-blue-600"><Download size={18} /></a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {photoLinks.length === 0 ? (
            <div className="text-center py-8"><Image size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-500 dark:text-gray-400">No photos shared yet</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photoLinks.map((photo) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="group bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center hover:bg-amber-50 dark:hover:bg-amber-950/30 transition">
                  <Image size={24} className="mx-auto text-gray-400 group-hover:text-amber-500 mb-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{photo.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(photo.created_at).toLocaleDateString()}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {reportLinks.length === 0 ? (
            <div className="text-center py-8"><FileText size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-500 dark:text-gray-400">No reports shared yet</p></div>
          ) : (
            <div className="space-y-3">
              {reportLinks.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-purple-500" />
                    <div><p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>{doc.description && <p className="text-xs text-gray-500 dark:text-gray-400">{doc.description}</p>}<p className="text-xs text-gray-500 dark:text-gray-400">Added by {doc.created_by_name}</p></div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 hover:text-blue-600"><Download size={18} /></a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== MEETINGS TAB WITH FULL FEATURES ========== */}
      {activeTab === 'meetings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Minutes</h3>
              {overdueCount > 0 && <p className="text-sm text-red-500 mt-1">⚠️ You have {overdueCount} overdue {overdueCount === 1 ? 'task' : 'tasks'}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCalendarSync} className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm">
                Sync Calendar
              </button>
              <button onClick={() => setShowMeetingForm(true)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm flex items-center gap-1">
                <Plus size={14} /> New Meeting
              </button>
            </div>
          </div>

          {meetings.length === 0 && !showMeetingForm ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No meetings scheduled yet</p>
              <button onClick={() => setShowMeetingForm(true)} className="mt-3 text-amber-500 hover:underline text-sm">Create your first meeting</button>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition" onClick={() => fetchMeetingMinutes(meeting.id)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white">{meeting.title}</p>
                        {meeting.approval_status && meeting.approval_status !== 'approved' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getApprovalStatusBadge(meeting.approval_status)}`}>
                            {meeting.approval_status === 'pending_approval' ? 'Pending Approval' : meeting.approval_status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar size={12} /> {new Date(meeting.meeting_date).toLocaleDateString()}
                        {meeting.location && ` • ${meeting.location}`}
                        {meeting.meeting_type && ` • ${meeting.meeting_type}`}
                      </p>
                    </div>
                    {meeting.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${meeting.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {meeting.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Meeting Form Modal */}
          {showMeetingForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Meeting</h3>
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Title *</label><input type="text" value={newMeeting.title} onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Date *</label><input type="date" value={newMeeting.meeting_date} onChange={(e) => setNewMeeting({...newMeeting, meeting_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label><input type="text" value={newMeeting.location} onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g., Site Office, Conference Room" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Type</label><select value={newMeeting.meeting_type} onChange={(e) => setNewMeeting({...newMeeting, meeting_type: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"><option value="regular">Regular</option><option value="progress">Progress Review</option><option value="technical">Technical</option><option value="emergency">Emergency</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chairperson</label><input type="text" value={newMeeting.chairperson} onChange={(e) => setNewMeeting({...newMeeting, chairperson: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Meeting chairperson" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secretary</label><input type="text" value={newMeeting.secretary} onChange={(e) => setNewMeeting({...newMeeting, secretary: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Meeting secretary" /></div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => { setShowMeetingForm(false); setNewMeeting({ title: '', meeting_date: '', location: '', meeting_type: 'regular', chairperson: '', secretary: '' }); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                    <button type="submit" disabled={creatingMeeting} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">{creatingMeeting ? 'Creating...' : 'Create Meeting'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Minutes Editor Modal */}
          {showMinutesEditor && selectedMeeting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl p-6 m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMeeting.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(selectedMeeting.meeting_date).toLocaleDateString()}{selectedMeeting.location && ` • ${selectedMeeting.location}`}</p>
                  </div>
                  <div className="flex gap-2">
                    {editingMode === 'edit' && <button onClick={handlePublishMinutes} disabled={publishingMinutes} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Publish for Approval</button>}
                    {editingMode === 'approve' && <><button onClick={handleApproveMinutes} className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">Approve</button><button onClick={() => setShowRejectionModal(true)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">Reject</button></>}
                    {editingMode !== 'approve' && <button onClick={handleDeleteMeeting} disabled={deletingMeeting} className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">Delete</button>}
                    <button onClick={() => setShowMinutesEditor(false)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">✕</button>
                  </div>
                </div>

                {/* Matters Present - Checkboxes from Stakeholders Register */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                    <Users size={18} className="text-blue-500" />
                    Matters Present (Stakeholders in Attendance)
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {allStakeholders.map((stakeholder) => (
                      <label key={stakeholder.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={meetingAttendees.some(a => a.id === stakeholder.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMeetingAttendees([...meetingAttendees, stakeholder]);
                            } else {
                              setMeetingAttendees(meetingAttendees.filter(a => a.id !== stakeholder.id));
                            }
                          }}
                          className="rounded"
                        />
                        {stakeholder.name} ({stakeholder.role})
                      </label>
                    ))}
                  </div>
                  
                  {/* Absentees section */}
                  {allStakeholders.filter(s => !meetingAttendees.some(a => a.id === s.id)).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Absentees:</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {allStakeholders.filter(s => !meetingAttendees.some(a => a.id === s.id)).map(s => (
                          <span key={s.id} className="text-sm text-gray-400 dark:text-gray-500">
                            {s.name}
                          </span>
                        ))}
                        <button 
                          onClick={handleEmailAbsentees}
                          className="ml-auto text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Auto-email apology request
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Matters Arising from Previous Minutes */}
                {mattersArising.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                      <History size={18} className="text-yellow-600 dark:text-yellow-500" />
                      Matters Arising from Previous Minutes
                    </h4>
                    <div className="space-y-3">
                      {mattersArising.map((matter) => (
                        <div key={matter.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <p className="font-medium text-gray-900 dark:text-white">{matter.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            From: {matter.previous_meeting_title} ({new Date(matter.previous_meeting_date).toLocaleDateString()})
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Assigned to: {matter.assigned_to_name}</span>
                            <span className="text-gray-600 dark:text-gray-400">Due: {new Date(matter.due_date).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full ${getStatusColor(matter.action_status)}`}>
                              {matter.action_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agenda Register Dropdown */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Agenda</h4>
                    <button
                      onClick={() => setShowAgendaRegister(!showAgendaRegister)}
                      className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
                    >
                      {showAgendaRegister ? 'Hide Agenda Register' : 'Load from Agenda Register'}
                    </button>
                  </div>
                  
                  {showAgendaRegister && (
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agenda Register</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {agendaRegister.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                              {item.description && <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>}
                            </div>
                            <button
                              onClick={() => handleAddFromRegister(item)}
                              className="p-1 text-green-500 hover:text-green-600"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="New agenda item title"
                          value={newRegisterItem.title}
                          onChange={(e) => setNewRegisterItem({...newRegisterItem, title: e.target.value})}
                          className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={newRegisterItem.description}
                          onChange={(e) => setNewRegisterItem({...newRegisterItem, description: e.target.value})}
                          className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button onClick={handleAddToRegister} className="px-3 py-1 bg-amber-500 text-white rounded text-sm">Add to Register</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agenda Items with Drag-drop and Decision Log */}
                <div className="mb-6">
                  <div className="space-y-4">
                    {agendaItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-move"
                        draggable={editingMode === 'edit'}
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {editingMode === 'edit' ? (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                  <GripVertical size={16} className="text-gray-400 cursor-grab" />
                                  <input 
                                    type="text" 
                                    value={item.title} 
                                    onChange={(e) => handleUpdateAgendaItem(idx, 'title', e.target.value)} 
                                    className="flex-1 px-3 py-2 border rounded-lg font-medium dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                                  />
                                </div>
                                <textarea 
                                  value={item.description} 
                                  onChange={(e) => handleUpdateAgendaItem(idx, 'description', e.target.value)} 
                                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                                  rows={2} 
                                  placeholder="Description" 
                                />
                                <div className="grid md:grid-cols-2 gap-3 mt-2">
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Discussion Summary</label>
                                    <textarea 
                                      value={item.discussion_summary} 
                                      onChange={(e) => handleUpdateAgendaItem(idx, 'discussion_summary', e.target.value)} 
                                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                                      rows={2} 
                                      placeholder="Record discussion points..." 
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Decision Log</label>
                                    <textarea 
                                      value={item.decision} 
                                      onChange={(e) => handleUpdateAgendaItem(idx, 'decision', e.target.value)} 
                                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                                      rows={2} 
                                      placeholder="Record decision made..." 
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 dark:text-white">{item.item_order}. {item.title}</p>
                                </div>
                                {item.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>}
                                {item.discussion_summary && (
                                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Discussion:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.discussion_summary}</p>
                                  </div>
                                )}
                                {item.decision && (
                                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded">
                                    <p className="text-xs font-medium text-green-600 dark:text-green-400">Decision:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.decision}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          {editingMode === 'edit' && (
                            <button onClick={() => handleRemoveAgendaItem(idx)} className="p-1 text-red-500 hover:text-red-600 ml-2">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {editingMode === 'edit' && (
                    <div className="mt-3 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="New agenda item" 
                        value={newAgendaItem.title} 
                        onChange={(e) => setNewAgendaItem({...newAgendaItem, title: e.target.value})} 
                        className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Description (optional)" 
                        value={newAgendaItem.description} 
                        onChange={(e) => setNewAgendaItem({...newAgendaItem, description: e.target.value})} 
                        className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                      />
                      <button onClick={handleAddAgendaItem} className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Minutes Content - Discussions, Decisions, Next Steps */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discussions</label>
                    {editingMode === 'edit' ? (
                      <textarea 
                        value={minutesContent.discussions} 
                        onChange={(e) => setMinutesContent({...minutesContent, discussions: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white h-32" 
                        placeholder="Record discussion points..." 
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[120px] whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                        {minutesContent.discussions || 'No discussions recorded yet.'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Decisions Made</label>
                    {editingMode === 'edit' ? (
                      <textarea 
                        value={minutesContent.decisions} 
                        onChange={(e) => setMinutesContent({...minutesContent, decisions: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white h-32" 
                        placeholder="Record decisions made..." 
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[120px] whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                        {minutesContent.decisions || 'No decisions recorded yet.'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Steps</label>
                    {editingMode === 'edit' ? (
                      <textarea 
                        value={minutesContent.next_steps} 
                        onChange={(e) => setMinutesContent({...minutesContent, next_steps: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white h-32" 
                        placeholder="Action items to be taken..." 
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[120px] whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                        {minutesContent.next_steps || 'No next steps recorded yet.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Items Section */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Action Items & Tasks</h4>
                  
                  {/* Existing Action Items */}
                  <div className="space-y-3 mb-4">
                    {actionItems.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{item.description}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              <span className="text-gray-600 dark:text-gray-400">Assigned to: {item.assigned_to_name}</span>
                              <span className="text-gray-600 dark:text-gray-400">Due: {new Date(item.due_date).toLocaleDateString()}</span>
                              <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                              <span className={`px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                            </div>
                          </div>
                          {editingMode !== 'approve' && item.status !== 'completed' && (
                            <select 
                              value={item.status} 
                              onChange={(e) => handleUpdateActionItemStatus(item.id, e.target.value)} 
                              className="text-xs px-2 py-1 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          )}
                          {item.status === 'completed' && <CheckCircle size={18} className="text-green-500" />}
                        </div>
                      </div>
                    ))}
                    {actionItems.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No action items assigned yet</p>}
                  </div>

                  {/* Add New Action Item */}
                  {editingMode === 'edit' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign New Task</h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input 
                          type="text" 
                          placeholder="Task description" 
                          value={newActionItem.description} 
                          onChange={(e) => setNewActionItem({...newActionItem, description: e.target.value})} 
                          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                        />
                        <select 
                          value={newActionItem.assigned_to} 
                          onChange={(e) => setNewActionItem({...newActionItem, assigned_to: e.target.value})} 
                          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Assign to...</option>
                          {stakeholders.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                        </select>
                        <input 
                          type="date" 
                          value={newActionItem.due_date} 
                          onChange={(e) => setNewActionItem({...newActionItem, due_date: e.target.value})} 
                          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                        />
                        <select 
                          value={newActionItem.priority} 
                          onChange={(e) => setNewActionItem({...newActionItem, priority: e.target.value as any})} 
                          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
                  )}
                </div>

                {/* Version History */}
                {versions.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                      <GitBranch size={18} className="text-gray-500" />
                      Version History
                    </h4>
                    <div className="space-y-2">
                      {versions.map((version) => (
                        <div key={version.id} className="text-sm flex justify-between items-center text-gray-600 dark:text-gray-400">
                          <span>v{version.version_number} - {new Date(version.changed_at).toLocaleString()}</span>
                          <span>by {version.changed_by_name}</span>
                          {version.change_reason && <span className="text-xs text-gray-400">{version.change_reason}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                {editingMode === 'edit' && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => setShowMinutesEditor(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      Close
                    </button>
                    <button onClick={handleSaveMinutes} disabled={savingMinutes} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2">
                      <Save size={16} /> {savingMinutes ? 'Saving...' : 'Save Minutes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejection Modal */}
          {showRejectionModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Minutes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please provide feedback for the minutes creator:</p>
                <textarea 
                  value={rejectionFeedback} 
                  onChange={(e) => setRejectionFeedback(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  rows={4} 
                  placeholder="Explain what needs to be changed..." 
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => { setShowRejectionModal(false); setRejectionFeedback(''); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                  <button onClick={handleRejectMinutes} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Missing Features Alert Modal */}
          {showMissingFeaturesAlert && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coming Soon!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This feature is under development and will be available in the next release.
                </p>
                <div className="flex justify-end">
                  <button onClick={() => setShowMissingFeaturesAlert(false)} className="px-4 py-2 bg-amber-500 text-white rounded-lg">
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Site Progress Tab */}
      {activeTab === 'progress' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {siteDiaries.length === 0 ? (
            <div className="text-center py-8"><HardHat size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-500 dark:text-gray-400">No site diary entries yet</p></div>
          ) : (
            <div className="space-y-4">
              {siteDiaries.map((diary) => (
                <div key={diary.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(diary.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Weather: {diary.weather || 'N/A'} • Workers: {diary.workers_count || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{diary.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && financial && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Contract Sum</span>
                  <span className="font-medium text-gray-900 dark:text-white">KES {financial.contractSum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Invoiced</span>
                  <span className="text-blue-600 dark:text-blue-400">KES {financial.totalInvoiced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Paid</span>
                  <span className="text-green-600 dark:text-green-400">KES {financial.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Outstanding Balance</span>
                  <span className={`font-bold ${financial.outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    KES {financial.outstanding.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Payment Progress</h3>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Paid: {((financial.totalPaid / financial.contractSum) * 100).toFixed(1)}%</span>
                  <span className="text-gray-600 dark:text-gray-400">Remaining: {((financial.outstanding / financial.contractSum) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(financial.totalPaid / financial.contractSum) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Team</h3>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8"><Users size={48} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-500 dark:text-gray-400">No team members added yet</p></div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {member.role}
                    </span>
                  </div>
                  {member.email && <p className="text-sm text-gray-600 dark:text-gray-300">{member.email}</p>}
                  {member.phone && <p className="text-sm text-gray-600 dark:text-gray-300">{member.phone}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}