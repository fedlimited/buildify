import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  User, 
  Calendar, 
  Filter, 
  RefreshCw,
  Eye,
  Trash2,
  Edit,
  PlusCircle,
  LogIn,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface ActivityItem {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: number;
  entity_name: string;
  details: any;
  ip_address: string;
  created_at: string;
}

interface ActivitySummary {
  user_id: number;
  user_name: string;
  email: string;
  total_activities: number;
  creations: number;
  updates: number;
  deletions: number;
  last_active: string;
}

export function ActivityDashboard() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [summary, setSummary] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  
  // Filters
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Available filter options
  const [actions, setActions] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [users, setUsers] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    fetchActivities();
    fetchSummary();
    fetchFilterOptions();
    fetchUsers();
  }, [offset, selectedUserId, selectedAction, selectedEntityType, startDate, endDate]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      if (selectedUserId) params.append('userId', selectedUserId);
      if (selectedAction) params.append('action', selectedAction);
      if (selectedEntityType) params.append('entityType', selectedEntityType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`${API_BASE_URL}/activities?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setActivities(data.activities || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/activities/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary || []);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/activities/types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setActions(data.actions || []);
        setEntityTypes(data.entityTypes || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <PlusCircle size={14} className="text-green-500" />;
      case 'update': return <Edit size={14} className="text-blue-500" />;
      case 'delete': return <Trash2 size={14} className="text-red-500" />;
      case 'login': return <LogIn size={14} className="text-emerald-500" />;
      case 'logout': return <LogOut size={14} className="text-gray-500" />;
      case 'view': return <Eye size={14} className="text-purple-500" />;
      case 'upload': return <FileText size={14} className="text-amber-500" />;
      default: return <Activity size={14} className="text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-700';
      case 'update': return 'bg-blue-100 text-blue-700';
      case 'delete': return 'bg-red-100 text-red-700';
      case 'login': return 'bg-emerald-100 text-emerald-700';
      case 'logout': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionMessage = (activity: ActivityItem): string => {
    const action = activity.action;
    const entityType = activity.entity_type;
    const entityName = activity.entity_name || `#${activity.entity_id}`;
    
    const messages: Record<string, string> = {
      'create': `created ${entityType} "${entityName}"`,
      'update': `updated ${entityType} "${entityName}"`,
      'delete': `deleted ${entityType} "${entityName}"`,
      'login': `logged in`,
      'logout': `logged out`,
      'view': `viewed ${entityType} "${entityName}"`,
      'upload': `uploaded ${entityType} "${entityName}"`,
      'test': `tested the system`,
    };
    
    return messages[action] || `${action} ${entityType}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const resetFilters = () => {
    setSelectedUserId('');
    setSelectedAction('');
    setSelectedEntityType('');
    setStartDate('');
    setEndDate('');
    setOffset(0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={24} className="text-amber-500" />
            Recent Activities
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all user actions across the application
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={16} />
            Filters
            {(selectedUserId || selectedAction || selectedEntityType || startDate || endDate) && (
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={fetchActivities}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Activities</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Creations</p>
          <p className="text-2xl font-bold text-green-600">
            {summary.reduce((sum, u) => sum + (u.creations || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Updates</p>
          <p className="text-2xl font-bold text-blue-600">
            {summary.reduce((sum, u) => sum + (u.updates || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Deletions</p>
          <p className="text-2xl font-bold text-red-600">
            {summary.reduce((sum, u) => sum + (u.deletions || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Filter Activities</h3>
            <button onClick={resetFilters} className="text-sm text-amber-600 hover:text-amber-700">
              Reset all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Users</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Entity Types</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Start Date"
            />
            
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="End Date"
            />
          </div>
        </div>
      )}

      {/* User Activity Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold flex items-center gap-2">
            <User size={16} />
            User Activity Summary (Last 30 Days)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedUserId(user.user_id.toString())}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.user_name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">{user.total_activities}</td>
                  <td className="px-4 py-3 text-green-600">{user.creations}</td>
                  <td className="px-4 py-3 text-blue-600">{user.updates}</td>
                  <td className="px-4 py-3 text-red-600">{user.deletions}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.last_active ? getTimeAgo(user.last_active) : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold">Activity Feed</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw size={24} className="animate-spin text-amber-500" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No activities found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium">{activity.user_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getActionMessage(activity)}
                      </span>
                    </div>
                    {activity.entity_name && (
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-mono text-xs bg-gray-100 px-1 rounded">ID: {activity.entity_id}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(activity.created_at)} ({getTimeAgo(activity.created_at)})
                      </span>
                      {activity.ip_address && (
                        <span>IP: {activity.ip_address}</span>
                      )}
                    </div>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-amber-600 cursor-pointer">View details</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {total > limit && (
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="flex items-center gap-1 px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Showing {offset + 1} to {Math.min(offset + limit, total)} of {total}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="flex items-center gap-1 px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}