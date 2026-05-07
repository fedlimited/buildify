import React, { useState, useEffect } from 'react';
import { Users, Mail, Send, Shield, CheckCircle, XCircle, Clock, Search, Filter, RefreshCw, Eye, EyeOff, Copy, FilterX, ChevronDown, ChevronUp } from 'lucide-react';
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
        console.log('✅ Tenants fetched:', data.tenants.length);
      } else {
        showResult('error', data.error || 'Failed to fetch tenants');
      }
    } catch (error) {
      console.error('❌ Fetch tenants error:', error);
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
        console.log('✅ History fetched:', data.communications?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const showResult = (type: 'success' | 'error', text: string) => {
    setResult({ type, text });
    setTimeout(() => setResult(null), 5000);
  };

  const copyEmailsToClipboard = () => {
    const emails = selectedTenants.length > 0 
      ? tenants.filter(t => selectedTenants.includes(t.user_id)).map(t => t.email).join(', ')
      : filteredTenants.map(t => t.email).join(', ');
    
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
    showResult('success', `${selectedTenants.length || filteredTenants.length} email(s) copied`);
    console.log('📋 Emails copied:', emails.substring(0, 200) + '...');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSubscriptionFilter('all');
    setRoleFilter('all');
    console.log('🔍 Filters cleared');
  };

  const handleSendEmail = async () => {
    console.log('📧 ========== STARTING EMAIL SEND ==========');
    
    if (!masterPassword) {
      console.log('❌ Master password missing');
      showResult('error', 'Master password required');
      return;
    }
    if (!subject) {
      console.log('❌ Subject missing');
      showResult('error', 'Subject required');
      return;
    }
    if (!message) {
      console.log('❌ Message missing');
      showResult('error', 'Message required');
      return;
    }
    if (!sendToAll && !sendToFiltered && selectedTenants.length === 0) {
      console.log('❌ No recipients selected');
      showResult('error', 'Select recipients');
      return;
    }

    let tenantIdsToSend = [];
    let recipientCount = 0;
    
    if (sendToAll) {
      tenantIdsToSend = [];
      recipientCount = tenants.length;
      console.log(`📧 Sending to ALL ${recipientCount} tenants`);
    } else if (sendToFiltered) {
      tenantIdsToSend = filteredTenants.map(t => t.user_id);
      recipientCount = filteredTenants.length;
      console.log(`📧 Sending to FILTERED ${recipientCount} tenants`);
    } else {
      tenantIdsToSend = selectedTenants;
      recipientCount = selectedTenants.length;
      console.log(`📧 Sending to ${recipientCount} manually selected tenants`);
    }

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 0; 
            background-color: #f9fafb;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header-title {
            font-size: 28px;
            font-weight: bold;
            color: white;
            letter-spacing: 1px;
          }
          .tagline { 
            color: rgba(255,255,255,0.9); 
            font-size: 13px; 
            margin-top: 8px;
          }
          .content { 
            padding: 30px; 
          }
          .message { 
            color: #374151; 
            font-size: 15px; 
            line-height: 1.6; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            font-size: 12px; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb; 
            background-color: #f9fafb;
          }
          @media (max-width: 600px) {
            .content { padding: 20px; }
            .header-title { font-size: 22px; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f9fafb;">
        <div class="container">
          <div class="header">
            <div class="header-title">BOCHI</div>
            <div class="tagline">Construction Suite</div>
          </div>
          <div class="content">
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Bochi Construction Suite</p>
            <p style="font-size: 11px;">This is an automated message from Bochi Admin. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('📤 Sending request to backend...');
    console.log('   Subject:', subject);
    console.log('   Recipients:', recipientCount);
    
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
          message: htmlMessage,
          masterPassword,
          sendToAll: sendToAll,
          tenantIds: tenantIdsToSend
        })
      });

      const data = await response.json();
      console.log('📥 Backend response:', data);
      
      if (response.ok) {
        console.log(`✅✅✅ EMAIL SENT SUCCESSFULLY! ✅✅✅`);
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
        console.error('❌ Backend error:', data.error);
        showResult('error', data.error || 'Failed to send emails');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      showResult('error', 'Network error - check console');
    } finally {
      setSending(false);
      console.log('📧 ========== EMAIL SEND COMPLETE ==========');
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
      active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      trial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      expired: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    };
    return badges[status?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-amber-500" />
          <h1 className="text-xl font-semibold">Tenant Communications</h1>
          <span className="text-sm text-muted-foreground">{tenants.length} total</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="pr-8 h-9 w-48 text-sm bg-background border-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
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

      {/* Result Message */}
      {result && (
        <div className={`p-2 rounded flex items-center gap-2 text-sm ${
          result.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {result.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span>{result.text}</span>
        </div>
      )}

      {/* Email Composition Card */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="py-3 px-4 bg-amber-50 dark:bg-amber-950/20">
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Mail size={18} />
            Compose Email
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 px-4 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1 block">Subject</Label>
            <Input
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-11 text-base bg-background border-input"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Message</Label>
            <Textarea
              placeholder="Write your message here. This will be sent to all selected tenants..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-base resize-y bg-background border-input"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => {
                    setSendToAll(e.target.checked);
                    if (e.target.checked) setSendToFiltered(false);
                  }}
                  className="w-4 h-4"
                />
                <span>All tenants ({tenants.length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={sendToFiltered}
                  onChange={(e) => {
                    setSendToFiltered(e.target.checked);
                    if (e.target.checked) setSendToAll(false);
                  }}
                  className="w-4 h-4"
                />
                <span>Filtered ({filteredTenants.length})</span>
              </label>
              {!sendToAll && !sendToFiltered && (
                <span className="text-sm text-muted-foreground">
                  Manual: {selectedTenants.length} selected
                </span>
              )}
            </div>
            <Button 
              onClick={handleSendEmail} 
              disabled={sending} 
              className="bg-amber-500 hover:bg-amber-600 px-6"
            >
              <Send size={16} className="mr-2" />
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-card rounded-lg border p-3">
          <p className="font-bold text-xl">{tenants.length}</p>
          <p className="text-xs text-muted-foreground">Total Tenants</p>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <p className="font-bold text-xl text-green-600">{tenants.filter(t => t.is_active === 1).length}</p>
          <p className="text-xs text-muted-foreground">Active Users</p>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <p className="font-bold text-xl text-blue-600">{tenants.filter(t => t.subscription_status === 'active').length}</p>
          <p className="text-xs text-muted-foreground">Subscribed</p>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <p className="font-bold text-xl text-amber-600">{selectedTenants.length}</p>
          <p className="text-xs text-muted-foreground">Selected</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[150px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm bg-background border-input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-1.5 border rounded-md text-sm bg-background border-input text-foreground"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-3 py-1.5 border rounded-md text-sm bg-background border-input text-foreground"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          value={subscriptionFilter}
          onChange={(e) => setSubscriptionFilter(e.target.value as any)}
          className="px-3 py-1.5 border rounded-md text-sm bg-background border-input text-foreground"
        >
          <option value="all">All Subscriptions</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="expired">Expired</option>
        </select>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-3">
          <FilterX size={14} className="mr-1" />
          Clear
        </Button>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading tenants...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No tenants found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left w-8">
                      <input
                        type="checkbox"
                        checked={selectAll && filteredTenants.length > 0}
                        onChange={(e) => setSelectAll(e.target.checked)}
                        disabled={sendToAll || sendToFiltered}
                      />
                    </th>
                    <th className="px-3 py-2 text-left">Tenant</th>
                    <th className="px-3 py-2 text-left">Company</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Role</th>
                    <th className="px-3 py-2 text-left">Subscription</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.user_id} className="hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant.user_id)}
                          onChange={() => toggleTenant(tenant.user_id)}
                          disabled={sendToAll || sendToFiltered}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium">{tenant.user_name}</td>
                      <td className="px-3 py-2">{tenant.company_name}</td>
                      <td className="px-3 py-2">
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
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          tenant.role === 'admin' 
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {tenant.role || 'user'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getSubscriptionBadge(tenant.subscription_status)}`}>
                          {tenant.subscription_status || 'trial'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          tenant.is_active 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
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

      {/* Communication History */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="text-sm">
          <Clock size={14} className="mr-1" />
          {showHistory ? 'Hide' : 'Show'} Communication History ({history.length})
          {showHistory ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
        </Button>
        {showHistory && (
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-3 text-sm text-muted-foreground">No communication history</div>
            ) : (
              history.map((comm) => (
                <div key={comm.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{comm.subject}</span>
                    <span className="text-xs text-muted-foreground">{new Date(comm.sent_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{comm.message.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                  <p className="text-xs text-muted-foreground mt-1">Sent to {comm.recipient_count} recipient(s)</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}