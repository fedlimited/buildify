import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { AppUser, ModuleId } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Shield, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '@/services/api';

const ALL_MODULES: { id: ModuleId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projects', label: 'Projects' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'vat', label: 'VAT' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'stores', label: 'Stores' },
  { id: 'subcontractors', label: 'Subcontractors' },
  { id: 'sitediary', label: 'Site Diary' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
  { id: 'help', label: 'Help' },
  { id: 'legal', label: 'Legal' },
];

const emptyUser = { name: '', email: '', password: '', role: 'user' as AppUser['role'], permissions: ALL_MODULES.map(m => m.id), isActive: true };

export function UsersModule() {
  const { authUser } = useAppStore();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState(emptyUser);

  // Load users from backend when component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      setError('');
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  if (authUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <Shield size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Admin access required</p>
          <p className="text-sm">Only administrators can manage users.</p>
        </div>
      </div>
    );
  }

  const openNew = () => { 
    setEditing(null); 
    setForm({ ...emptyUser, permissions: ALL_MODULES.map(m => m.id) }); 
    setOpen(true);
    setError('');
  };
  
  const openEdit = (u: AppUser) => { 
    setEditing(u); 
    setForm({ 
      name: u.name, 
      email: u.email, 
      password: '', // Don't show password for editing
      role: u.role, 
      permissions: u.permissions, 
      isActive: u.isActive 
    }); 
    setOpen(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setError('Name and email are required');
      return;
    }
    
    if (!editing && !form.password) {
      setError('Password is required for new users');
      return;
    }
    
    try {
      if (editing) {
        // Update existing user
        const updated = await api.updateUser(editing.id, {
          name: form.name,
          role: form.role,
          permissions: form.permissions,
          is_active: form.isActive
        });
        setUsers(users.map(u => u.id === updated.id ? updated : u));
      } else {
        // Create new user
        const newUser = await api.createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          permissions: form.permissions
        });
        setUsers([...users, newUser]);
      }
      setOpen(false);
      resetForm();
      setError('');
    } catch (err: any) {
      console.error('Failed to save user:', err);
      setError(err.message || 'Failed to save user');
    }
  };

  const handleDelete = async (user: AppUser) => {
    if (user.id === authUser?.id) {
      setError('You cannot delete your own account');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        await api.deleteUser(user.id);
        setUsers(users.filter(u => u.id !== user.id));
        setError('');
      } catch (err: any) {
        console.error('Failed to delete user:', err);
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setForm(emptyUser);
  };

  const togglePermission = (moduleId: ModuleId) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(moduleId)
        ? prev.permissions.filter(p => p !== moduleId)
        : [...prev.permissions, moduleId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <RefreshCw size={32} className="mx-auto mb-3 animate-spin" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{users.length} user{users.length !== 1 ? 's' : ''} in your company</p>
          <Button variant="ghost" size="sm" onClick={loadUsers} title="Refresh">
            <RefreshCw size={14} />
          </Button>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus size={16} className="mr-1" />Add User
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Name</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Email</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Role</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Permissions</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Actions</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 text-card-foreground font-medium">{u.name}</td>
                <td className="px-4 py-2.5 text-xs font-mono">{u.email}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                    {u.role === 'admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}{u.role}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {u.role === 'admin' ? 'All modules' : `${u.permissions?.length || 0} modules`}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(u)} title="Edit user">
                      <Pencil size={14} />
                    </Button>
                    {u.id !== authUser?.id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => handleDelete(u)}
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found. Click "Add User" to create your first user.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'New'} User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label className="text-xs">Name *</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Email *</Label>
                <Input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  placeholder="user@company.com"
                  disabled={!!editing}
                />
                {editing && <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>}
              </div>
              {!editing && (
                <div>
                  <Label className="text-xs">Password *</Label>
                  <Input 
                    type="password" 
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                    placeholder="••••••"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Role</Label>
                <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as 'admin' | 'user' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full Access</SelectItem>
                    <SelectItem value="user">User - Limited Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: !!c })} />
                  Active
                </label>
              </div>
            </div>
            {form.role === 'user' && (
              <div>
                <Label className="text-xs mb-2 block">Module Permissions</Label>
                <p className="text-xs text-muted-foreground mb-2">Select which modules this user can access</p>
                <div className="grid grid-cols-2 gap-2 bg-muted/50 rounded-lg p-3">
                  {ALL_MODULES.map(m => (
                    <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={form.permissions.includes(m.id)}
                        onCheckedChange={() => togglePermission(m.id)}
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}