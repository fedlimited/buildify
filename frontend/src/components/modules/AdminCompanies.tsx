import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import api from '@/services/api';
import { 
  Building2, 
  Users, 
  Calendar,
  Loader2,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Globe,
  Clock,
  CreditCard,
  Edit3,
  Save
} from 'lucide-react';

interface Company {
  id: number;
  name: string;
  subdomain: string;
  is_active: number;
  created_at: string;
  user_count: number;
  project_count: number;
  subscription_status: string;
  plan_name: string;
  plan_display_name?: string;
  plan_id?: number;
  subscription_id?: number;
  start_date?: string;
  end_date?: string;
  trial_end_date?: string;
}

export function AdminCompanies() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { authUser } = useAppStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const itemsPerPage = 10;

  // Plan Editor State
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  // Redirect if not super admin
  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) {
      navigate('/dashboard');
    }
  }, [authUser, navigate]);

  useEffect(() => {
    fetchCompanies();
    loadPlans();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter]);

  // Fetch single company details if companyId is in URL
  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails(Number(companyId));
    } else {
      setSelectedCompany(null);
    }
  }, [companyId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCompanies();
      setCompanies(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetails = async (id: number) => {
    try {
      setDetailLoading(true);
      const data = await api.getCompanyDetails(id);
      setSelectedCompany(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch company details:', err);
      setError('Failed to load company details');
    } finally {
      setDetailLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await api.request('/subscription/plans');
      setAllPlans(response || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedCompany || !selectedPlanId) return;
    setUpdatingPlan(true);
    try {
      await fetch(`https://buildify-backend-kye8.onrender.com/api/super-admin/companies/${selectedCompany.id}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          status: subscriptionStatus,
          startDate: new Date().toISOString().split('T')[0]
        })
      });
      alert('Subscription updated successfully!');
      setShowPlanEditor(false);
      fetchCompanyDetails(selectedCompany.id); // Refresh
      fetchCompanies(); // Refresh list
    } catch (err) {
      console.error('Failed to update subscription:', err);
      alert('Failed to update subscription');
    } finally {
      setUpdatingPlan(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(c => c.is_active === 1);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(c => c.is_active === 0);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
    setCurrentPage(1);
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
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      trial: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
      cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      expired: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle }
    };
    const badge = badges[status?.toLowerCase()] || badges.expired;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status || 'No Subscription'}
      </span>
    );
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  if (!authUser?.isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ========== COMPANY DETAIL VIEW ==========
  if (companyId) {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/companies')}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Companies
          </button>
          <div className="bg-destructive/10 text-destructive rounded-lg p-4">{error}</div>
        </div>
      );
    }

    if (!selectedCompany) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/companies')}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Companies
          </button>
          <div className="text-center py-12 text-muted-foreground">Company not found</div>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/companies')}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </button>

        {/* Company Header */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{selectedCompany.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{selectedCompany.subdomain}</code>
                  {getStatusBadge(selectedCompany.is_active)}
                </div>
              </div>
            </div>
            {/* Edit Plan Button */}
            <button
              onClick={() => {
                setSelectedPlanId(selectedCompany.plan_id || 0);
                setSubscriptionStatus(selectedCompany.subscription_status || 'active');
                setShowPlanEditor(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Edit Plan
            </button>
          </div>
        </div>

        {/* Company Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Users Card */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Users</h3>
            </div>
            <p className="text-3xl font-bold">{selectedCompany.user_count || 0}</p>
          </div>

          {/* Projects Card */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium">Projects</h3>
            </div>
            <p className="text-3xl font-bold">{selectedCompany.project_count || 0}</p>
          </div>

          {/* Subscription Card */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-medium">Subscription</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{selectedCompany.plan_name || 'Free'}</span>
              {getSubscriptionBadge(selectedCompany.subscription_status)}
            </div>
          </div>

          {/* Plan Details Card */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-medium">Plan</h3>
            </div>
            <p className="text-sm">{selectedCompany.plan_display_name || selectedCompany.plan_name || 'Free'}</p>
          </div>

          {/* Start Date Card */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-medium">Start Date</h3>
            </div>
            <p className="text-sm">{formatDate(selectedCompany.start_date || selectedCompany.created_at)}</p>
          </div>

          {/* End Date Card */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-medium">End Date</h3>
            </div>
            <p className="text-sm">{formatDate(selectedCompany.end_date)}</p>
          </div>

          {/* Domain Card */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Globe className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="font-medium">Subdomain</h3>
            </div>
            <code className="text-sm bg-muted px-2 py-1 rounded">{selectedCompany.subdomain}</code>
          </div>

          {/* Joined Card */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-medium">Joined</h3>
            </div>
            <p className="text-sm">{formatDate(selectedCompany.created_at)}</p>
          </div>

          {/* Trial End Card */}
          {selectedCompany.trial_end_date && (
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-medium">Trial Ends</h3>
              </div>
              <p className="text-sm">{formatDate(selectedCompany.trial_end_date)}</p>
            </div>
          )}
        </div>

        {/* Plan Editor Modal */}
        {showPlanEditor && selectedCompany && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPlanEditor(false)}>
            <div className="bg-card rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Edit Subscription - {selectedCompany.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Select Plan</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg bg-background"
                  >
                    <option value={0}>Select a plan...</option>
                    {allPlans.map((plan: any) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.display_name || plan.name} - KES {plan.price_monthly_kes?.toLocaleString()}/mo
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select
                    value={subscriptionStatus}
                    onChange={(e) => setSubscriptionStatus(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setShowPlanEditor(false)} className="px-4 py-2 border rounded-lg">
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSubscription}
                    disabled={updatingPlan || !selectedPlanId}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {updatingPlan ? 'Updating...' : 'Update Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== COMPANIES LIST VIEW ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Companies</h1>
        <p className="text-muted-foreground">
          Manage all registered companies in the system
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{companies.length}</p>
              <p className="text-sm text-muted-foreground">Total Companies</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{companies.filter(c => c.is_active === 1).length}</p>
              <p className="text-sm text-muted-foreground">Active Companies</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{companies.reduce((sum, c) => sum + (c.user_count || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
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
            placeholder="Search by name or subdomain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <button
          onClick={fetchCompanies}
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

      {/* Companies Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subdomain</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Users</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Projects</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subscription</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No companies found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((company) => (
                  <tr key={company.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium">{company.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(company.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{company.subdomain}</code>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{company.plan_name || 'Free'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{company.user_count || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{company.project_count || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(company.is_active)}
                    </td>
                    <td className="py-3 px-4">
                      {getSubscriptionBadge(company.subscription_status)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/admin/companies/${company.id}`)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm px-3 py-1 bg-muted rounded-md">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}