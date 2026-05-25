import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import { 
  Users, 
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Building2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: number;
  is_super_admin: boolean;
  created_at: string;
  company_name: string;
  subdomain: string;
  company_id: number;
}

export function AdminUsers() {
  const navigate = useNavigate();
  const { authUser } = useAppStore();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [superAdminFilter, setSuperAdminFilter] = useState<'all' | 'super' | 'regular'>('all');
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

  // Redirect if not super admin
  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) {
      navigate('/dashboard');
    }
  }, [authUser, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, superAdminFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSystemUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Filter by super admin status
    if (superAdminFilter === 'super') {
      filtered = filtered.filter(u => u.is_super_admin === true);
    } else if (superAdminFilter === 'regular') {
      filtered = filtered.filter(u => u.is_super_admin === false);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleToggleSuperAdmin = async (userId: number, currentStatus: boolean) => {
    // Prevent toggling your own super admin status
    if (userId === authUser?.id && currentStatus) {
      alert('You cannot remove your own super admin privileges.');
      return;
    }

    if (!confirm(`Are you sure you want to ${currentStatus ? 'REMOVE' : 'GRANT'} super admin privileges?`)) {
      return;
    }

    try {
      setTogglingUserId(userId);
      await api.toggleSuperAdmin(userId, !currentStatus);
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_super_admin: !currentStatus } : u
      ));
      
      setError(null);
    } catch (err) {
      console.error('Failed to toggle super admin:', err);
      alert('Failed to update super admin status. Please try again.');
    } finally {
      setTogglingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full">
        <UserCheck className="w-3 h-3" />
        User
      </span>
    );
  };

  const getStatusBadge = (isActive: number) => {
    if (isActive === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    );
  };

  if (!authUser?.isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active === 1).length,
    superAdmins: users.filter(u => u.is_super_admin === true).length,
    admins: users.filter(u => u.role === 'admin').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Users</h1>
        <p className="text-muted-foreground">
          Manage all users across the entire system
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.superAdmins}</p>
              <p className="text-sm text-muted-foreground">Super Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Company Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins Only</option>
          <option value="user">Users Only</option>
        </select>
        <select
          value={superAdminFilter}
          onChange={(e) => setSuperAdminFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Users</option>
          <option value="super">Super Admins Only</option>
          <option value="regular">Regular Users Only</option>
        </select>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Super Admin</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No users found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium">{user.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{user.company_name}</div>
                          <div className="text-xs text-muted-foreground">{user.subdomain}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="py-3 px-4">
                      {user.is_super_admin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                          <Shield className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleSuperAdmin(user.id, user.is_super_admin)}
                        disabled={togglingUserId === user.id || (user.id === authUser?.id && user.is_super_admin)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.id === authUser?.id && user.is_super_admin
                            ? 'opacity-50 cursor-not-allowed bg-muted'
                            : 'hover:bg-muted'
                        }`}
                        title={user.is_super_admin ? 'Remove Super Admin' : 'Make Super Admin'}
                      >
                        {togglingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.is_super_admin ? (
                          <ToggleRight className="w-4 h-4 text-amber-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-4 h-4 text-amber-500" />
              Super Admins have full system access
            </span>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          About Super Admin Privileges
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Super Admins can access all companies and users in the system</li>
          <li>• They can view system-wide statistics and manage subscriptions</li>
          <li>• You cannot remove your own super admin privileges</li>
          <li>• Be careful when granting super admin access - it provides full system control</li>
        </ul>
      </div>
    </div>
  );
}