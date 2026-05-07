import React, { useState, useEffect } from 'react';
import { Users, Mail, Send, Shield, CheckCircle, XCircle, Clock, Search, Filter, RefreshCw, Eye, EyeOff, Copy, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/config/api';

interface Tenant {
  user_id: number;
  user_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: number;
  company_id: number;
  company_name: string;
  subdomain: string;
  subscription_status: string;
}

interface CommunicationHistory {
  id: number;
  subject: string;
  message: string;
  recipient_count: number;
  sent_at: string;
}

export function TenantManager() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [sendToFiltered, setSendToFiltered] = useState(false);
  const [history, setHistory] = useState<CommunicationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'trial' | 'expired'>('all');
  const [copiedEmails, setCopiedEmails] = useState(false);

  useEffect(() => {
    fetchTenants();
    fetchHistory();
  }, []);

  useEffect(() => {
    let filtered = [...tenants];
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => 
        statusFilter === 'active' ? t.is_active === 1 : t.is_active === 0
      );
    }
    
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(t => {
        const subStatus = t.subscription_status?.toLowerCase() || 'trial';
        if (subscriptionFilter === 'active') return subStatus === 'active';
        if (subscriptionFilter === 'trial') return subStatus === 'trial';
        if (subscriptionFilter === 'expired') return subStatus === 'expired';
        return true;
      });
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(t => {
        const role = t.role?.toLowerCase() || 'user';
        if (roleFilter === 'admin') return role === 'admin';
        if (roleFilter === 'user') return role === 'user';
        return true;
      });
    }
    
    setFilteredTenants(filtered);
  }, [searchTerm, tenants, statusFilter, subscriptionFilter, roleFilter]);

  useEffect(() => {
    if (selectAll) {
      setSelectedTenants(filteredTenants.map(t => t.user_id));
    } else {
      setSelectedTenants([]);
    }
  }, [selectAll, filteredTenants]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/tenants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTenants(data.tenants);
        setFilteredTenants(data.tenants);
      } else {
        showResult('error', data.error || 'Failed to fetch tenants');
      }
    } catch (error) {
      showResult('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/communications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setHistory(data.communications || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const showResult = (type: 'success' | 'error', text: string) => {
    setResult({ type, text });
    setTimeout(() => setResult(null), 3000);
  };

  const copyEmailsToClipboard = () => {
    const emails = selectedTenants.length > 0 
      ? tenants.filter(t => selectedTenants.includes(t.user_id)).map(t => t.email).join(', ')
      : filteredTenants.map(t => t.email).join(', ');
    
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
    showResult('success', `${selectedTenants.length || filteredTenants.length} email(s) copied`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSubscriptionFilter('all');
    setRoleFilter('all');
  };

  const handleSendEmail = async () => {
    if (!masterPassword) {
      showResult('error', 'Master password required');
      return;
    }
    if (!subject) {
      showResult('error', 'Subject required');
      return;
    }
    if (!message) {
      showResult('error', 'Message required');
      return;
    }
    if (!sendToAll && !sendToFiltered && selectedTenants.length === 0) {
      showResult('error', 'Select recipients');
      return;
    }

    let tenantIdsToSend = [];
    if (sendToAll) {
      tenantIdsToSend = [];
    } else if (sendToFiltered) {
      tenantIdsToSend = filteredTenants.map(t => t.user_id);
    } else {
      tenantIdsToSend = selectedTenants;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/tenants/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          message,
          masterPassword,
          sendToAll: sendToAll,
          tenantIds: tenantIdsToSend
        })
      });

      const data = await response.json();
      if (response.ok) {
        showResult('success', data.message);
        setSubject('');
        setMessage('');
        setMasterPassword('');
        setSelectedTenants([]);
        setSelectAll(false);
        setSendToAll(false);
        setSendToFiltered(false);
        fetchHistory();
      } else {
        showResult('error', data.error || 'Failed to send');
      }
    } catch (error) {
      showResult('error', 'Network error');
    } finally {
      setSending(false);
    }
  };

  const toggleTenant = (userId: number) => {
    if (selectedTenants.includes(userId)) {
      setSelectedTenants(selectedTenants.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      setSelectedTenants([...selectedTenants, userId]);
    }
  };

  const getSubscriptionBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      trial: 'bg-blue-100 text-blue-700',
      expired: 'bg-red-100 text-red-700'
    };
    return badges[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-4 space-y-3">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-500" />
          <h1 className="text-lg font-semibold">Tenant Communications</h1>
          <span className="text-xs text-muted-foreground">{tenants.length} total</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyEmailsToClipboard}>
            <Copy size={14} className="mr-1" />
            {copiedEmails ? 'Copied!' : 'Copy Emails'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchTenants} disabled={loading}>
            <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Result Message - Compact */}
      {result && (
        <div className={`p-2 rounded flex items-center gap-2 text-sm ${
          result.type === 'success' 
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {result.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span>{result.text}</span>
        </div>
      )}

      {/* Stats Row - Compact */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-card rounded border p-2">
          <p className="font-bold text-base">{tenants.length}</p>
          <p className="text-muted-foreground">Total</p>
        </div>
        <div className="bg-card rounded border p-2">
          <p className="font-bold text-base text-green-600">{tenants.filter(t => t.is_active === 1).length}</p>
          <p className="text-muted-foreground">Active</p>
        </div>
        <div className="bg-card rounded border p-2">
          <p className="font-bold text-base text-blue-600">{tenants.filter(t => t.subscription_status === 'active').length}</p>
          <p className="text-muted-foreground">Subscribed</p>
        </div>
        <div className="bg-card rounded border p-2">
          <p className="font-bold text-base text-yellow-600">{selectedTenants.length}</p>
          <p className="text-muted-foreground">Selected</p>
        </div>
      </div>

      {/* Master Password & Email Compose - Combined Compact Card */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield size={14} />
            <Mail size={14} />
            <span>Send Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3 space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="pr-8 h-8 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-8 text-sm"
          />
          <Textarea
            placeholder="Message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-3 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => {
                  setSendToAll(e.target.checked);
                  if (e.target.checked) setSendToFiltered(false);
                }}
              />
              <span>All ({tenants.length})</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={sendToFiltered}
                onChange={(e) => {
                  setSendToFiltered(e.target.checked);
                  if (e.target.checked) setSendToAll(false);
                }}
              />
              <span>Filtered ({filteredTenants.length})</span>
            </label>
            {!sendToAll && !sendToFiltered && (
              <span className="text-muted-foreground">Manual: {selectedTenants.length}</span>
            )}
          </div>
          <Button onClick={handleSendEmail} disabled={sending} size="sm" className="w-full">
            <Send size={14} className="mr-1" />
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </CardContent>
      </Card>

      {/* Filters - Compact Row */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-2 py-1.5 border rounded text-sm h-8"
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-2 py-1.5 border rounded text-sm h-8"
        >
          <option value="all">Role: All</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          value={subscriptionFilter}
          onChange={(e) => setSubscriptionFilter(e.target.value as any)}
          className="px-2 py-1.5 border rounded text-sm h-8"
        >
          <option value="all">Sub: All</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="expired">Expired</option>
        </select>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
          <FilterX size={14} />
        </Button>
      </div>

      {/* Tenants Table - Compact */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tenants found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-2 py-2 text-left w-8">
                      <input
                        type="checkbox"
                        checked={selectAll && filteredTenants.length > 0}
                        onChange={(e) => setSelectAll(e.target.checked)}
                        disabled={sendToAll || sendToFiltered}
                      />
                    </th>
                    <th className="px-2 py-2 text-left">Tenant</th>
                    <th className="px-2 py-2 text-left">Company</th>
                    <th className="px-2 py-2 text-left">Email</th>
                    <th className="px-2 py-2 text-left">Role</th>
                    <th className="px-2 py-2 text-left">Subscription</th>
                    <th className="px-2 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant.user_id)}
                          onChange={() => toggleTenant(tenant.user_id)}
                          disabled={sendToAll || sendToFiltered}
                        />
                      </td>
                      <td className="px-2 py-2 font-medium">{tenant.user_name}</td>
                      <td className="px-2 py-2">{tenant.company_name}</td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tenant.email);
                            showResult('success', 'Email copied');
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          {tenant.email}
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          tenant.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tenant.role || 'user'}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getSubscriptionBadge(tenant.subscription_status)}`}>
                          {tenant.subscription_status || 'trial'}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          tenant.is_active 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {tenant.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication History - Compact Toggle */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="text-xs">
          <Clock size={14} className="mr-1" />
          {showHistory ? 'Hide' : 'Show'} History ({history.length})
        </Button>
        {showHistory && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-2 text-xs text-gray-500">No history</div>
            ) : (
              history.map((comm) => (
                <div key={comm.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium">{comm.subject}</span>
                    <span className="text-gray-500">{new Date(comm.sent_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 truncate">{comm.message}</p>
                  <p className="text-gray-400">To: {comm.recipient_count} recipients</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}