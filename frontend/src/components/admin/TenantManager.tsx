import React, { useState, useEffect } from 'react';
import { Users, Mail, Send, Shield, CheckCircle, XCircle, Clock, Search, Filter, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [history, setHistory] = useState<CommunicationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch tenants on load
  useEffect(() => {
    fetchTenants();
    fetchHistory();
  }, []);

  // Filter tenants when search changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = tenants.filter(t => 
        t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTenants(filtered);
    } else {
      setFilteredTenants(tenants);
    }
  }, [searchTerm, tenants]);

  // Handle select all
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
    setTimeout(() => setResult(null), 5000);
  };

  const handleSendEmail = async () => {
    if (!masterPassword) {
      showResult('error', 'Master password is required');
      return;
    }
    if (!subject) {
      showResult('error', 'Email subject is required');
      return;
    }
    if (!message) {
      showResult('error', 'Email message is required');
      return;
    }
    if (!sendToAll && selectedTenants.length === 0) {
      showResult('error', 'Please select at least one tenant or select "Send to All"');
      return;
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
          tenantIds: sendToAll ? [] : selectedTenants
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
        fetchHistory();
      } else {
        showResult('error', data.error || 'Failed to send emails');
      }
    } catch (error) {
      showResult('error', 'Network error. Please try again.');
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={28} className="text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Communications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and communicate with all tenants</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchTenants} disabled={loading}>
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          result.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200'
        }`}>
          {result.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{result.text}</span>
        </div>
      )}

      {/* Master Password Input */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={18} />
            Authentication Required
          </CardTitle>
          <CardDescription>Enter master password to send communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Email Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={18} />
            Compose Email
          </CardTitle>
          <CardDescription>Create and send bulk emails to tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Write your message here..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Send to ALL tenants</span>
              </label>
              {!sendToAll && (
                <span className="text-sm text-gray-500">
                  {selectedTenants.length} tenant(s) selected
                </span>
              )}
            </div>
            <Button
              onClick={handleSendEmail}
              disabled={sending}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Send size={16} className="mr-2" />
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenants List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users size={18} />
                Tenants List
              </CardTitle>
              <CardDescription>Total: {tenants.length} tenants across all companies</CardDescription>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading tenants...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tenants found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selectAll && filteredTenants.length > 0}
                        onChange={(e) => setSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                        disabled={sendToAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Tenant</th>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    
                    <th className="px-4 py-3 text-left">Subscription</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant.user_id)}
                          onChange={() => toggleTenant(tenant.user_id)}
                          className="rounded border-gray-300"
                          disabled={sendToAll}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{tenant.user_name}</td>
                      <td className="px-4 py-3">{tenant.company_name}</td>
                      <td className="px-4 py-3">{tenant.email}</td>
                      
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tenant.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tenant.subscription_status || 'trial'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
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

      {/* Communication History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} />
                Communication History
              </CardTitle>
              <CardDescription>Recent email broadcasts sent to tenants</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No communication history yet</div>
            ) : (
              <div className="space-y-3">
                {history.map((comm) => (
                  <div key={comm.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{comm.subject}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comm.sent_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {comm.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Sent to {comm.recipient_count} recipient(s)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}