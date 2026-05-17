import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with token attachment
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// MOCK DATA FALLBACK
// ============================================================================

export const mockInvoices = [
  {
    _id: '1',
    invoiceNumber: 'INV-2023-001',
    companyName: 'Techcorp Solutions',
    totalAmount: 7560,
    taxAmount: 560,
    status: 'APPROVED',
    createdAt: '2023-10-15T10:30:00Z',
    extractedData: {
      matriculeFiscal: 'TN123456789',
      tvaAmount: 560,
      invoiceDate: '2023-10-15',
    },
    confidence: 0.98,
  },
  {
    _id: '2',
    invoiceNumber: 'INV-2023-002',
    companyName: 'Office Supplies Co',
    totalAmount: 1200,
    taxAmount: 100,
    status: 'SUBMITTED',
    createdAt: '2023-10-16T14:20:00Z',
    extractedData: {
      matriculeFiscal: 'TN987654321',
      tvaAmount: 100,
      invoiceDate: '2023-10-16',
    },
    confidence: 0.95,
  },
  {
    _id: '3',
    invoiceNumber: 'INV-2023-003',
    companyName: 'Finance Services LLC',
    totalAmount: 5000,
    taxAmount: 400,
    status: 'DRAFT',
    createdAt: '2023-10-17T08:15:00Z',
    extractedData: {},
    confidence: 0,
  },
];

export const mockAuditLog = [
  { _id: '1', action: 'UPLOAD', user: 'Eleanor Pena', timestamp: '2023-10-15T10:30:00Z', invoiceId: '1' },
  { _id: '2', action: 'AI_EXTRACTION', user: 'System', timestamp: '2023-10-15T10:35:00Z', invoiceId: '1' },
  { _id: '3', action: 'VERIFICATION', user: 'Ben Carter', timestamp: '2023-10-15T11:00:00Z', invoiceId: '1' },
  { _id: '4', action: 'APPROVE', user: 'Admin', timestamp: '2023-10-15T15:00:00Z', invoiceId: '1' },
  { _id: '5', action: 'UPLOAD', user: 'Eleanor Pena', timestamp: '2023-10-16T14:20:00Z', invoiceId: '2' },
];

export const mockNotifications = [
  { _id: '1', type: 'HIGH_PRIORITY', title: 'High Priority Approval Req: Invoice #4533', message: 'Vendor: Eleanor Pena', severity: 'HIGH', timestamp: '2023-10-02T10:00:00Z' },
  { _id: '2', type: 'AI_WARNING', title: 'AI Verification Warning: Duplicated Transaction Detected', message: 'Invoice #4533 with Description: Server Racks $5,000', severity: 'MEDIUM', timestamp: '2023-10-02T10:05:00Z' },
  { _id: '3', type: 'PAYMENT_REMINDER', title: 'Upcoming Payment Reminder: Office Supplies', message: 'Due Date: 28/02/23 Amount: $1,200.00', severity: 'LOW', timestamp: '2023-10-02T10:10:00Z' },
];

export const mockBudgetStatus = {
  currentSpending: 8450,
  remaining: 1550,
  percentage: 84.5,
  budget: {
    monthlyLimit: 10000,
  },
};

export const mockUsers = [
  { _id: '1', name: 'Eleanor Pena', email: 'eleanor@example.com', role: 'ACCOUNTANT', invoiceCount: 45 },
  { _id: '2', name: 'Ben Carter', email: 'ben@example.com', role: 'ACCOUNTANT', invoiceCount: 32 },
  { _id: '3', name: 'Admin', email: 'admin@example.com', role: 'ADMIN', invoiceCount: 120 },
  { _id: '4', name: 'Jane Doe', email: 'jane@example.com', role: 'ACCOUNTANT', invoiceCount: 28 },
];

export const mockDashboardMetrics = {
  totalInvoices: 1250,
  activeSuppliers: 48,
  approvedInvoices: 1089,
  avgProcessingTime: '2.4 hours',
};

export const mockAnalyticsData = [
  { month: 'Jan', spending: 8000, invoices: 120 },
  { month: 'Feb', spending: 9200, invoices: 135 },
  { month: 'Mar', spending: 7800, invoices: 110 },
  { month: 'Apr', spending: 9500, invoices: 145 },
  { month: 'May', spending: 8700, invoices: 128 },
  { month: 'Jun', spending: 10200, invoices: 155 },
  { month: 'Jul', spending: 9100, invoices: 140 },
  { month: 'Aug', spending: 8900, invoices: 132 },
  { month: 'Sep', spending: 9800, invoices: 150 },
  { month: 'Oct', spending: 8450, invoices: 125 },
  { month: 'Nov', spending: 0, invoices: 0 },
  { month: 'Dec', spending: 0, invoices: 0 },
];

export const mockCategoryBreakdown = [
  { name: 'Travel', value: 25, amount: '$2500' },
  { name: 'Software', value: 20, amount: '$2000' },
  { name: 'Office Supplies', value: 15, amount: '$1500' },
  { name: 'Expense', value: 15, amount: '$1500' },
  { name: 'Others', value: 25, amount: '$2450' },
];

export const mockEmails = [
  {
    id: 1,
    sender: 'billing@techcorp.com',
    name: 'Techcorp Solutions',
    subject: 'Your October Invoice #TC-2023-10-15',
    date: '10:42 AM',
    hasAttachment: true,
    status: 'extracted',
    invoiceId: 'TC-2023-10-15',
    snippet: 'Hi there, please find attached your monthly invoice for our server hosting...',
    body: 'Hi there,\n\nPlease find attached your monthly invoice for our server hosting services. Let us know if you have any questions.\n\nBest,\nTechcorp Billing Team',
  },
  {
    id: 2,
    sender: 'no-reply@aws.amazon.com',
    name: 'AWS Billing',
    subject: 'AWS Invoice Available',
    date: 'Yesterday',
    hasAttachment: true,
    status: 'extracted',
    invoiceId: 'AWS-99281',
    snippet: 'Greetings, Your AWS invoice for the period of September is now available...',
    body: 'Greetings,\n\nYour AWS invoice for the period of September is now available. It has been attached to this email as a PDF document.\n\nThank you for using AWS.',
  },
  {
    id: 3,
    sender: 'hello@figma.com',
    name: 'Figma',
    subject: 'Figma Organization Receipt',
    date: 'Oct 14',
    hasAttachment: true,
    status: 'processing',
    invoiceId: null,
    snippet: 'Thanks for your payment! Attached is your receipt for Figma Organization...',
    body: 'Thanks for your payment!\n\nAttached is your receipt for Figma Organization tier. Keep this for your records.',
  },
  {
    id: 4,
    sender: 'support@github.com',
    name: 'GitHub',
    subject: 'Action Required: Update payment method',
    date: 'Oct 12',
    hasAttachment: false,
    status: 'ignored',
    invoiceId: null,
    snippet: 'We noticed an issue processing your recent payment for GitHub Copilot...',
    body: 'We noticed an issue processing your recent payment for GitHub Copilot. Please update your payment method to avoid service interruption.',
  },
];

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: string) => {
    const response = await apiClient.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

export const analyticsAPI = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      return { data: null };
    }
  },

  getMonthlyStats: async (year?: number) => {
    try {
      const params = year ? `?year=${year}` : '';
      const response = await apiClient.get(`/analytics/monthly${params}`);
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  getSuppliers: async () => {
    try {
      const response = await apiClient.get('/analytics/suppliers');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },
};

export const invoiceAPI = {
  uploadFile: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('invoiceFile', file);
      const response = await apiClient.post('/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resData = response.data.data || response.data;
      const ext = resData.extractedData || {};
      const mapped = {
        ...resData,
        invoiceNumber: ext.invoiceNumber || 'NEW',
        companyName: ext.companyName || file.name,
        totalAmount: ext.totalAmount || 0,
        taxAmount: ext.tvaAmount || 0,
        confidence: ext.confidenceScores?.overall || 0.92,
      };
      return { data: mapped };
    } catch (error) {
      return {
        data: {
          _id: Date.now().toString(),
          invoiceNumber: 'INV-' + Date.now(),
          status: 'EXTRACTED',
          extractedData: { matriculeFiscal: 'TN123456789', tvaAmount: 500 },
          confidence: 0.92,
        },
      };
    }
  },

  getAll: async (status?: string, search?: string) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      const response = await apiClient.get(`/invoices?${params}`);
      const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const mapped = list.map((item: any) => ({
        ...item,
        invoiceNumber: item.extractedData?.invoiceNumber || item.invoiceNumber || 'N/A',
        companyName: item.extractedData?.companyName || item.companyName || 'Unknown Vendor',
        totalAmount: item.extractedData?.totalAmount || item.totalAmount || 0,
        taxAmount: item.extractedData?.tvaAmount || item.taxAmount || 0,
        confidence: item.extractedData?.confidenceScores?.overall || item.confidence || 0.85,
      }));
      return { data: mapped };
    } catch (error) {
      return { data: mockInvoices };
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/invoices/${id}`);
      const inv = response.data.invoice || response.data;
      const ext = response.data.extractedData || {};
      const mapped = {
        ...inv,
        invoiceNumber: ext.invoiceNumber || inv.invoiceNumber || 'N/A',
        companyName: ext.companyName || inv.companyName || 'Unknown Vendor',
        totalAmount: ext.totalAmount || inv.totalAmount || 0,
        taxAmount: ext.tvaAmount || inv.taxAmount || 0,
        confidence: ext.confidenceScores?.overall || inv.confidence || 0.85,
        extractedData: ext,
        validation: response.data.validation || null,
        auditLogs: response.data.auditLogs || [],
        comments: response.data.comments || [],
      };
      return { data: mapped };
    } catch (error) {
      return { data: mockInvoices[0] };
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await apiClient.put(`/invoices/${id}/extracted`, data);
      return { data: response.data.extractedData || response.data };
    } catch (error) {
      return { data: { ...mockInvoices[0], ...data } };
    }
  },

  delete: async (id: string) => {
    try {
      await apiClient.delete(`/invoices/${id}`);
      return { success: true };
    } catch (error) {
      return { success: true };
    }
  },

  approve: async (id: string) => {
    try {
      const response = await apiClient.post(`/invoices/${id}/approve`);
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },

  reject: async (id: string, reason: string = 'No reason provided') => {
    try {
      const response = await apiClient.post(`/invoices/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },
};

export const budgetAPI = {
  getStatus: async (year?: number, month?: number) => {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());
      const response = await apiClient.get(`/budget/status?${params}`);
      return response.data;
    } catch (error) {
      return { data: mockBudgetStatus };
    }
  },

  setBudget: async (monthlyLimit: number, alertThreshold: number, year: number, month: number) => {
    try {
      const response = await apiClient.post('/budget', { monthlyLimit, alertThreshold, year, month });
      return response.data;
    } catch (error) {
      return { success: true, data: { monthlyLimit, alertThreshold } };
    }
  },
};

export const auditAPI = {
  getTrail: async () => {
    try {
      const response = await apiClient.get('/audit');
      return { data: response.data.logs || response.data };
    } catch (error) {
      return { data: mockAuditLog };
    }
  },
};

export const notificationAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return { data: response.data.notifications || response.data };
    } catch (error) {
      return { data: mockNotifications };
    }
  },
};

export const workflowAPI = {
  approve: async (invoiceId: string, decision: string, notes: string) => {
    try {
      const response = await apiClient.post(`/workflow/${invoiceId}/approve`, { decision, notes });
      return response.data;
    } catch (error) {
      return { success: true, data: { status: decision } };
    }
  },
};

export const userAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      return { data: mockUsers };
    }
  },

  invite: async (email: string, role: string, fullName: string) => {
    try {
      const response = await apiClient.post('/users', { name: fullName, email, password: 'TempPassword123!', role });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: true, data: { email, role, fullName } };
    }
  },
};

export const mailAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/mail');
      return response.data;
    } catch (error) {
      return { data: mockEmails };
    }
  },
};

export default apiClient;
