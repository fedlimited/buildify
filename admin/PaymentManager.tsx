import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, AlertCircle, Shield, Database, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/config/api';

interface PaymentStats {
  total_payments: number;
  completed_count: number;
  failed_count: number;
  test_count: number;
  earliest_payment: string;
  latest_payment: string;
}

export function PaymentManager() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch payment statistics on load
  useEffect(() => {
    fetchStats();
  }, []);

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

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Clear payments by date range
  const handleClearByDate = async () => {
    if (!startDate || !endDate) {
      showMessage('error', 'Please select both start and end dates');
      return;
    }
    if (!masterPassword) {
      showMessage('error', 'Master password is required');
      return;
    }

    setLoading(true);
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
      } else {
        showMessage('error', data.error || 'Failed to clear payments');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear all payments
  const handleClearAll = async () => {
    if (confirmText !== 'DELETE_ALL_PAYMENTS') {
      showMessage('error', 'Type DELETE_ALL_PAYMENTS to confirm');
      return;
    }
    if (!masterPassword) {
      showMessage('error', 'Master password is required');
      return;
    }

    setLoading(true);
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
      } else {
        showMessage('error', data.error || 'Failed to clear all payments');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear specific payment by ID
  const handleClearById = async () => {
    if (!paymentId) {
      showMessage('error', 'Payment ID is required');
      return;
    }
    if (!masterPassword) {
      showMessage('error', 'Master password is required');
      return;
    }

    setLoading(true);
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
      } else {
        showMessage('error', data.error || 'Payment not found');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield size={28} className="text-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin: Payment Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and clear payment records securely</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Statistics Dashboard */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={18} />
              Payment Statistics
            </CardTitle>
            <CardDescription>Overview of all payment records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <p className="text-xs text-gray-500">Test Payments</p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-lg font-semibold text-purple-600">
                  {stats.earliest_payment ? new Date(stats.earliest_payment).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-xs text-gray-500">to {stats.latest_payment ? new Date(stats.latest_payment).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Master Password Input (common for all actions) */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield size={18} />
            Authentication Required
          </CardTitle>
          <CardDescription>Enter master password to perform any payment deletion action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
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

      {/* Option 1: Clear by Date Range */}
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
                disabled={loading || !masterPassword}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Trash2 size={16} className="mr-2" />
                Clear by Date Range
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ This will delete ALL payments (including MPesa, Visa, Mastercard, test payments) in the selected date range.
          </p>
        </CardContent>
      </Card>

      {/* Option 2: Clear Specific Payment by ID */}
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
                disabled={loading || !masterPassword || !paymentId}
                variant="outline"
                className="w-full border-red-500 text-red-600 hover:bg-red-50"
              >
                <X size={16} className="mr-2" />
                Delete Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option 3: Clear All Payments (Danger Zone) */}
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
              disabled={loading || !masterPassword || confirmText !== 'DELETE_ALL_PAYMENTS'}
              className="w-full bg-red-700 hover:bg-red-800"
            >
              <Trash2 size={16} className="mr-2" />
              Delete ALL Payments Permanently
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}