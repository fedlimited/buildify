const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';









class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'API request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    if (!text) {
      return null;
    }
    return JSON.parse(text);
  }

  // ========== OTP AUTHENTICATION ==========
  async sendLoginOTP(email, subdomain) {
    const data = await this.request('/auth/send-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, subdomain })
    });
    return data;
  }





async verifyLoginOTP(email, code, subdomain) {
  const data = await this.request('/auth/verify-login-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code, subdomain })
  });
  console.log('api.verifyLoginOTP raw response:', data);  // ← ADD THIS LINE
  if (data.token) {
    this.setToken(data.token);
  }
  return data;
}




  async sendRegistrationOTP(email, subdomain) {
    const data = await this.request('/auth/send-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ email, subdomain })
    });
    return data;
  }

  async verifyRegistrationOTP(email, code, name, password, role, subdomain) {
    const data = await this.request('/auth/verify-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code, name, password, role, subdomain })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async resendOTP(email, purpose) {
    const data = await this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose })
    });
    return data;
  }

  // ========== TRADITIONAL AUTH (keep for backward compatibility) ==========
  async login(email, password, subdomain) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, subdomain })
    });
    this.setToken(data.token);
    return data.user;
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // ========== COMPANIES ==========
  async registerCompany(companyData) {
    return this.request('/companies/register', {
      method: 'POST',
      body: JSON.stringify(companyData)
    });
  }

  async getCompanyInfo() {
    return this.request('/company');
  }

  async updateCompanyInfo(companyData) {
    return this.request('/company', {
      method: 'PUT',
      body: JSON.stringify(companyData)
    });
  }


  // ========== CURRENCY ==========
  async getCurrencySettings() {
    return this.request('/currency/settings');
  }

  async updateCurrencySettings(settings) {
    return this.request('/currency/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async getAvailableCurrencies() {
    return this.request('/currency/available');
  }


  // ========== USERS ==========
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== PROJECTS ==========
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(project) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  }

  async updateProject(id, project) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== WORKER CATEGORIES ==========
  async getWorkerCategories() {
    return this.request('/worker-categories');
  }

  async createWorkerCategory(category) {
    return this.request('/worker-categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  }

  async updateWorkerCategory(id, category) {
    return this.request(`/worker-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
  }

  async deleteWorkerCategory(id) {
    return this.request(`/worker-categories/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== WORKERS ==========
  async getWorkers() {
    return this.request('/workers');
  }

  async getWorker(id) {
    return this.request(`/workers/${id}`);
  }

  async createWorker(worker) {
    return this.request('/workers', {
      method: 'POST',
      body: JSON.stringify(worker)
    });
  }

  async updateWorker(id, worker) {
    return this.request(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(worker)
    });
  }

  async deleteWorker(id) {
    return this.request(`/workers/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== PAYROLL RECORDS ==========
  async getPayrollRecords() {
    return this.request('/payroll-records');
  }

  async getPayrollRecord(id) {
    return this.request(`/payroll-records/${id}`);
  }

  async createPayrollRecord(record) {
    return this.request('/payroll-records', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  }

  async updatePayrollRecord(id, record) {
    return this.request(`/payroll-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record)
    });
  }

  async deletePayrollRecord(id) {
    return this.request(`/payroll-records/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== EXPENSES ==========
  async getExpenses(projectId = null) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request(`/expenses${query}`);
  }

  async getExpense(id) {
    return this.request(`/expenses/${id}`);
  }

  async createExpense(expense) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense)
    });
  }

  async updateExpense(id, expense) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense)
    });
  }

  async deleteExpense(id) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== INCOME ==========
  async getIncome(projectId = null) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request(`/income${query}`);
  }

  async getIncomeEntry(id) {
    return this.request(`/income/${id}`);
  }

  async createIncome(income) {
    return this.request('/income', {
      method: 'POST',
      body: JSON.stringify(income)
    });
  }

  async updateIncome(id, income) {
    return this.request(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(income)
    });
  }

  async deleteIncome(id) {
    return this.request(`/income/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== APPROVED ITEMS ==========
  async getApprovedItems() {
    return this.request('/approved-items');
  }

  async getApprovedItem(id) {
    return this.request(`/approved-items/${id}`);
  }

  async createApprovedItem(item) {
    return this.request('/approved-items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async updateApprovedItem(id, item) {
    return this.request(`/approved-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  }

  async deleteApprovedItem(id) {
    return this.request(`/approved-items/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== SUPPLIERS ==========
  async getSuppliers() {
    return this.request('/suppliers');
  }

  async getSupplier(id) {
    return this.request(`/suppliers/${id}`);
  }

  async createSupplier(supplier) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier)
    });
  }

  async updateSupplier(id, supplier) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier)
    });
  }

  async deleteSupplier(id) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== PURCHASE ORDERS ==========
  async getPurchaseOrders() {
    return this.request('/purchase-orders');
  }

  async getPurchaseOrder(id) {
    return this.request(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(order) {
    return this.request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  }

  async updatePurchaseOrder(id, order) {
    return this.request(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order)
    });
  }

  async deletePurchaseOrder(id) {
    return this.request(`/purchase-orders/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== SUPPLIES ==========
  async getSupplies() {
    return this.request('/supplies');
  }

  async getSupply(id) {
    return this.request(`/supplies/${id}`);
  }

  async createSupply(supply) {
    return this.request('/supplies', {
      method: 'POST',
      body: JSON.stringify(supply)
    });
  }

  async updateSupply(id, supply) {
    return this.request(`/supplies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supply)
    });
  }

  async deleteSupply(id) {
    return this.request(`/supplies/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== STORE TRANSACTIONS ==========
  async getStoreTransactions() {
    return this.request('/store-transactions');
  }

  async getStoreTransaction(id) {
    return this.request(`/store-transactions/${id}`);
  }

  async createStoreTransaction(transaction) {
    return this.request('/store-transactions', {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
  }

  async updateStoreTransaction(id, transaction) {
    return this.request(`/store-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction)
    });
  }

  async deleteStoreTransaction(id) {
    return this.request(`/store-transactions/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== SITE DIARY ==========
  async getSiteDiaryEntries() {
    return this.request('/site-diary-entries');
  }

  async getSiteDiaryEntry(id) {
    return this.request(`/site-diary-entries/${id}`);
  }

  async createSiteDiaryEntry(entry) {
    return this.request('/site-diary-entries', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  }

  async updateSiteDiaryEntry(id, entry) {
    return this.request(`/site-diary-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry)
    });
  }

  async deleteSiteDiaryEntry(id) {
    return this.request(`/site-diary-entries/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== SUBCONTRACTORS ==========
  async getSubcontractors() {
    return this.request('/subcontractors');
  }

  async getSubcontractor(id) {
    return this.request(`/subcontractors/${id}`);
  }

  async createSubcontractor(subcontractor) {
    return this.request('/subcontractors', {
      method: 'POST',
      body: JSON.stringify(subcontractor)
    });
  }

  async updateSubcontractor(id, subcontractor) {
    return this.request(`/subcontractors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subcontractor)
    });
  }

  async deleteSubcontractor(id) {
    return this.request(`/subcontractors/${id}`, {
      method: 'DELETE'
    });
  }







  // ========== QUOTATIONS ==========
  async getQuotations() {
    return this.request('/quotations');
  }

  async getQuotation(id) {
    return this.request(`/quotations/${id}`);
  }

  async createQuotation(quotation) {
    console.log('api.createQuotation received:', quotation);
    return this.request('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotation)
    });
  }

  async updateQuotation(id, quotation) {
    return this.request(`/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quotation)
    });
  }

  async deleteQuotation(id) {
    return this.request(`/quotations/${id}`, {
      method: 'DELETE'
    });
  }








  // ========== INVOICES ==========
  async getInvoices() {
    return this.request('/invoices');
  }

  async getInvoice(id) {
    return this.request(`/invoices/${id}`);
  }

  async createInvoice(invoice) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice)
    });
  }

  async updateInvoice(id, invoice) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice)
    });
  }

  async deleteInvoice(id) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== SETTINGS ==========
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

export default new ApiService();