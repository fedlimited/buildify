import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, FileText, Calendar, ChartLine, Clock, Users, 
  CheckCircle, AlertCircle, TrendingUp, Eye, 
  User, Briefcase, HardHat, Ruler, Calculator, Crown,
  ChevronRight, RefreshCw, Loader2, Bell, MessageSquare
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface Project {
  id: number;
  name: string;
  client: string;
  location: string;
  progress: number;
  status: string;
  stakeholder_type: string;
  invite_status: string;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  documentsCount: number;
  meetingsCount: number;
  tasksCount: number;
}

const stakeholderLabels: Record<string, string> = {
  client: 'Client/Owner',
  consultant: 'Consultant',
  architect: 'Architect',
  structural_engineer: 'Structural Engineer',
  electrical_engineer: 'Electrical Engineer',
  mechanical_engineer: 'Mechanical Engineer',
  quantity_surveyor: 'Quantity Surveyor',
  project_manager: 'Project Manager'
};

const stakeholderIcons: Record<string, React.ElementType> = {
  client: Crown,
  consultant: Briefcase,
  architect: Ruler,
  structural_engineer: HardHat,
  electrical_engineer: HardHat,
  mechanical_engineer: HardHat,
  quantity_surveyor: Calculator,
  project_manager: Users
};

export function StakeholderDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [stakeholderType, setStakeholderType] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    documentsCount: 0,
    meetingsCount: 0,
    tasksCount: 0
  });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    setUserName(authUser.name || 'Stakeholder');
    setStakeholderType(authUser.stakeholderType || stakeholderLabels.project_manager);
    
    fetchProjects();
  }, []);




// Auto-navigate to project if coming from contractor view
useEffect(() => {
  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const projectIdFromUrl = urlParams.get('project');
  
  if (projectIdFromUrl) {
    navigate(`/stakeholder/projects/${projectIdFromUrl}`);
  } else {
    // Fallback to sessionStorage
    const projectId = sessionStorage.getItem('stakeholderViewProjectId');
    if (projectId) {
      sessionStorage.removeItem('stakeholderViewProjectId');
      navigate(`/stakeholder/projects/${projectId}`);
    }
  }
}, [navigate]);



  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/stakeholder/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok && data.projects) {
        setProjects(data.projects);
        
        const active = data.projects.filter((p: Project) => p.status === 'Active' || p.progress < 100).length;
        const completed = data.projects.filter((p: Project) => p.progress === 100).length;
        
        setStats({
          totalProjects: data.projects.length,
          activeProjects: active,
          completedProjects: completed,
          documentsCount: 0,
          meetingsCount: 0,
          tasksCount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const getStakeholderIcon = (type: string) => {
    const Icon = stakeholderIcons[type] || Users;
    return <Icon size={18} />;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={48} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}, {userName.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome to your project collaboration portal. Here you can track progress, access documents, and stay updated.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</p>
              <p className="text-xs text-gray-500">Projects</p>
            </div>
            <Building2 size={24} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.activeProjects}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <TrendingUp size={24} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.completedProjects}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <CheckCircle size={24} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.documentsCount}</p>
              <p className="text-xs text-gray-500">Documents</p>
            </div>
            <FileText size={24} className="text-purple-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.meetingsCount}</p>
              <p className="text-xs text-gray-500">Meetings</p>
            </div>
            <Calendar size={24} className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-cyan-600">{stats.tasksCount}</p>
              <p className="text-xs text-gray-500">Tasks</p>
            </div>
            <ChartLine size={24} className="text-cyan-500" />
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Projects Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Projects</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Projects you are assigned to or collaborating on</p>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No projects assigned to you yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">When added to a project, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                   onClick={() => navigate(`/stakeholder/projects/${project.id}`)}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {getStakeholderIcon(project.stakeholder_type)}
                        <span>{stakeholderLabels[project.stakeholder_type] || project.stakeholder_type}</span>
                      </div>
                      {project.status === 'Active' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                    <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>Client: {project.client}</span>
                      <span>Location: {project.location}</span>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-64">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${getProgressColor(project.progress)} h-2 rounded-full transition-all duration-500`} 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stakeholder/projects/${project.id}`);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
                    >
                      View Details
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Latest updates from your projects</p>
        </div>
        <div className="p-6 text-center">
          <Bell size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">Activity feed coming soon</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">You'll see document uploads, meeting notes, and task updates here.</p>
        </div>
      </div>
    </div>
  );
}