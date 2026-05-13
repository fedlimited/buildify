import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import {
  DollarSign,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building2,
  RefreshCw,
  CreditCard,
  Smartphone,
  Trash2,
  Shield,
  Database,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API_BASE_URL } from '@/config/api';

interface Payment {
  id: number;
  company_id: number;
  company_name: string;
  subdomain: string;
  subscription_id: number;
  amount_usd: number;
  amount_kes: number;
  payment_method: string;
  stripe_payment_intent_id: string;
  stripe_invoice_id: string;
  mpesa_transaction_id: string;
  mpesa_result_code: string;
  status: string;
  invoice_url: string;
  paid_at: string;
  created_at: string;
}

interface PaymentStats {
  total_payments: number;
  completed_count: number;
  failed_count: number;
  test_count: number;
  earliest_payment: string;
  latest_payment: string;
}

export function AdminPayments() {
  const navigate = useNavigate();
  const { authUser } = useAppStore();
  
  // Payment List States
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'mpesa' | 'stripe'>('all');
  
  // Payment Manager States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [managerLoading, setManagerLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('view');

  // Redirect non-super admins
  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) {
      navigate('/dashboard');
    }
  }, [authUser, navigate]);

  // Fetch data on load
  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  // Filter payments
  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getAllPayments();
      setPayments(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/payments/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status?.toLowerCase() === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_method?.toLowerCase().includes(methodFilter));
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mpesa_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.stripe_payment_intent_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleClearByDate = async () => {
    if (!startDate || !endDate) {
      showMessage('error', 'Please select both start and end dates');
      return;
    }
    if (!masterPassword) {
      showMessage('error', 'Master password is required');
      return;
    }

    setManagerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/payments/clear-by-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ startDate, endDate, masterPassword })
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('success', data.message);
        setStartDate('');
        setEndDate('');
        setMasterPassword('');
        fetchStats();
        fetchPayments();
      } else {
        showMessage('error', data.error || 'Failed to clear payments');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setManagerLoading(false);
    }
  };

  const handleClearById = async () => {
    if (!paymentId) {
      showMessage('error', 'Payment ID is required');
      return;
    }
    if (!masterPassword) {
      showMessage('error', 'Master password is required');
      return;
    }

    setManagerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ masterPassword })
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('success', data.message);
        setPaymentId('');
        setMasterPassword('');
        fetchStats();
        fetchPayments();
      } else {
        showMessage('error', data.error || 'Payment not found');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setManagerLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (confirmText !== 'DELETE_ALL_PAYMENTS') {
      showMessage('error', 'Type DELETE_ALL_PAYMENTS to confirm');
      return;
    }
    if (!masterPassword) {
      showMessage('error', 'Master password is required');
      return;
    }

    setManagerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/payments/clear-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ masterPassword, confirm: confirmText })
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('success', data.message);
        setConfirmText('');
        setMasterPassword('');
        fetchStats();
        fetchPayments();
      } else {
        showMessage('error', data.error || 'Failed to clear all payments');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setManagerLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      completed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Completed' },
      succeeded: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Failed' }
    };
    const badge = badges[status?.toLowerCase()] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getMethodIcon = (method: string) => {
    if (method?.toLowerCase().includes('mpesa')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <CreditCard className="w-4 h-4" />;
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount_usd || 0), 0);

  const totalRevenueKES = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount_kes || 0), 0);

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Payments</h1>
        <p className="text-muted-foreground">
          Monitor and manage all payment transactions across the system
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200'
        }`}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Payment Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.total_payments}</p>
            <p className="text-xs text-gray-500">Total Payments</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.completed_count}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.failed_count}</p>
            <p className="text-xs text-gray-500">Failed</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.test_count || 0}</p>
            <p className="text-xs text-gray-500">Test</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-lg font-semibold text-purple-600">
              {stats.earliest_payment ? new Date(stats.earliest_payment).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">to {stats.latest_payment ? new Date(stats.latest_payment).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <CreditCard size={16} />
            View Payments
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Trash2 size={16} />
            Manage Payments
          </TabsTrigger>
        </TabsList>

        {/* View Payments Tab */}
        <TabsContent value="view" className="space-y-4">
          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue (USD)</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">KES {totalRevenueKES.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue (KES)</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{payments.filter(p => p.status === 'completed').length}</p>
                  <p className="text-sm text-muted-foreground">Successful Payments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by company, M-Pesa code, or Stripe ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Methods</option>
              <option value="mpesa">M-Pesa</option>
              <option value="stripe">Stripe</option>
            </select>
            <button
              onClick={fetchPayments}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No payments found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{payment.company_name}</div>
                              <div className="text-xs text-muted-foreground">{payment.subdomain}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">${payment.amount_usd?.toLocaleString() || '0'}</div>
                          <div className="text-xs text-muted-foreground">KES {payment.amount_kes?.toLocaleString() || '0'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {getMethodIcon(payment.payment_method)}
                            <span className="text-sm capitalize">{payment.payment_method || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {payment.mpesa_transaction_id && (
                              <div className="font-mono text-xs">{payment.mpesa_transaction_id}</div>
                            )}
                            {payment.stripe_payment_intent_id && (
                              <div className="font-mono text-xs truncate max-w-[150px]" title={payment.stripe_payment_intent_id}>
                                {payment.stripe_payment_intent_id.slice(-12)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(payment.status)}
                          {payment.mpesa_result_code && (
                            <div className="text-xs text-muted-foreground mt-1">Code: {payment.mpesa_result_code}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(payment.paid_at || payment.created_at)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(payment.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPayments.length} of {payments.length} payments
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Manage Payments Tab */}
        <TabsContent value="manage" className="space-y-4">
          {/* Master Password Input */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Shield size={18} />
                Authentication Required
              </CardTitle>
              <CardDescription>Enter master password to perform any payment deletion action</CardDescription>
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
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Clear by Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={18} />
                Clear Payments by Date Range
              </CardTitle>
              <CardDescription>Delete all payments between selected dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleClearByDate}
                    disabled={managerLoading || !masterPassword}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Clear by Date Range
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                ⚠️ This will delete ALL payments in the selected date range.
              </p>
            </CardContent>
          </Card>

          {/* Clear by ID */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search size={18} />
                Clear Specific Payment
              </CardTitle>
              <CardDescription>Delete a single payment by its ID</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Payment ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter payment ID"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleClearById}
                    disabled={managerLoading || !masterPassword || !paymentId}
                    variant="outline"
                    className="w-full border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <XCircle size={16} className="mr-2" />
                    Delete Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clear All Payments */}
          <Card className="border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle size={18} />
                Danger Zone: Clear ALL Payments
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                This action is irreversible and will delete EVERY payment record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-red-700 dark:text-red-400">
                    Type <span className="font-mono font-bold">DELETE_ALL_PAYMENTS</span> to confirm
                  </Label>
                  <Input
                    placeholder="DELETE_ALL_PAYMENTS"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="border-red-300 focus:border-red-500"
                  />
                </div>
                <Button
                  onClick={handleClearAll}
                  disabled={managerLoading || !masterPassword || confirmText !== 'DELETE_ALL_PAYMENTS'}
                  className="w-full bg-red-700 hover:bg-red-800"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete ALL Payments Permanently
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}